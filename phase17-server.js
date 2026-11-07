/* Phase 17 — authenticated friends and in-app room invitations. */
const express=require('express');
const db=require('./database');
const router=express.Router();
const fail=(res,n,message)=>res.status(n).json({success:false,message});
const validId=n=>Number.isSafeInteger(n)&&n>0;
const pair=(a,b)=>a<b?[a,b]:[b,a];
db.exec(`CREATE TABLE IF NOT EXISTS friend_requests(
 id INTEGER PRIMARY KEY, sender_id INTEGER NOT NULL, receiver_id INTEGER NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('pending','accepted','declined')),
 created_at INTEGER NOT NULL,
 UNIQUE(sender_id,receiver_id));
 CREATE INDEX IF NOT EXISTS friend_requests_inbox ON friend_requests(receiver_id,status);
 CREATE TABLE IF NOT EXISTS friend_room_invites(
 id INTEGER PRIMARY KEY, room_id INTEGER NOT NULL, sender_id INTEGER NOT NULL,
 receiver_id INTEGER NOT NULL, status TEXT NOT NULL CHECK(status IN ('pending','accepted','declined')),
 created_at INTEGER NOT NULL);
 CREATE INDEX IF NOT EXISTS friend_room_inbox ON friend_room_invites(receiver_id,status);`);
const friends=(a,b)=>{
 const [x,y]=pair(a,b);
 return !!db.prepare(`SELECT 1 FROM friend_requests WHERE status='accepted'
 AND ((sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?)) LIMIT 1`).get(x,y,y,x);
};
router.get('/state',(req,res)=>{
 const uid=req.onlineUser.user_id;
 const accepted=db.prepare(`SELECT r.id, u.id AS userId,u.username FROM friend_requests r JOIN users u ON
 u.id=CASE WHEN r.sender_id=? THEN r.receiver_id ELSE r.sender_id END
 WHERE (r.sender_id=? OR r.receiver_id=?) AND r.status='accepted' ORDER BY u.username COLLATE NOCASE`).all(uid,uid,uid);
 const incoming=db.prepare(`SELECT r.id,u.username FROM friend_requests r JOIN users u ON u.id=r.sender_id
 WHERE r.receiver_id=? AND r.status='pending' ORDER BY r.created_at DESC LIMIT 50`).all(uid);
 const outgoing=db.prepare(`SELECT r.id,u.username FROM friend_requests r JOIN users u ON u.id=r.receiver_id
 WHERE r.sender_id=? AND r.status='pending' ORDER BY r.created_at DESC LIMIT 50`).all(uid);
 const invitations=db.prepare(`SELECT i.id,r.code,u.username AS sender,sec.private AS private
 FROM friend_room_invites i JOIN online_rooms r ON r.id=i.room_id
 JOIN users u ON u.id=i.sender_id LEFT JOIN room_security sec ON sec.room_id=r.id
 WHERE i.receiver_id=? AND i.status='pending' ORDER BY i.created_at DESC LIMIT 30`).all(uid);
 res.json({success:true,friends:accepted,incoming,outgoing,invitations});
});
router.post('/request',(req,res)=>{
 const uid=req.onlineUser.user_id,name=String(req.body?.username||'').trim();
 if(!/^[\p{L}\p{N}_-]{3,24}$/u.test(name))return fail(res,400,'Գրիր ճիշտ username։');
 const user=db.prepare('SELECT id FROM users WHERE username=? COLLATE NOCASE').get(name);
 if(!user)return fail(res,404,'Այս username-ով խաղացող չկա։');
 if(user.id===uid)return fail(res,400,'Չես կարող ինքդ քեզ ավելացնել։');
 if(friends(uid,user.id))return fail(res,409,'Արդեն ընկերներ եք։');
 const reversed=db.prepare(`SELECT id,status FROM friend_requests WHERE sender_id=? AND receiver_id=?`).get(user.id,uid);
 if(reversed?.status==='pending')return fail(res,409,'Այս խաղացողն արդեն քեզ հարցում է ուղարկել։');
 const existing=db.prepare(`SELECT id,status FROM friend_requests WHERE sender_id=? AND receiver_id=?`).get(uid,user.id);
 if(existing?.status==='pending')return fail(res,409,'Հարցումն արդեն ուղարկված է։');
 if(existing)db.prepare(`UPDATE friend_requests SET status='pending',created_at=? WHERE id=?`).run(Date.now(),existing.id);
 else db.prepare(`INSERT INTO friend_requests(sender_id,receiver_id,status,created_at) VALUES(?,?,'pending',?)`).run(uid,user.id,Date.now());
 res.status(201).json({success:true});
});
router.post('/requests/:id/respond',(req,res)=>{
 const id=Number(req.params.id),uid=req.onlineUser.user_id;
 if(!validId(id)||!['accepted','declined'].includes(req.body?.decision))return fail(res,400,'Սխալ հարցում։');
 const info=db.prepare(`UPDATE friend_requests SET status=? WHERE id=? AND receiver_id=? AND status='pending'`).run(req.body.decision,id,uid);
 if(!info.changes)return fail(res,404,'Հարցումն այլևս հասանելի չէ։');
 res.json({success:true});
});
router.post('/remove',(req,res)=>{
 const uid=req.onlineUser.user_id,other=req.body?.userId;
 if(!validId(other)||other===uid)return fail(res,400,'Սխալ խաղացող։');
 const info=db.prepare(`DELETE FROM friend_requests WHERE status='accepted'
 AND ((sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?))`).run(uid,other,other,uid);
 if(!info.changes)return fail(res,404,'Ընկերություն չկա։');
 res.json({success:true});
});
router.post('/invite',(req,res)=>{
 const sender=req.onlineUser.user_id,receiver=req.body?.userId,code=String(req.body?.code||'').trim().toUpperCase();
 if(!validId(receiver)||!/^[A-Z2-9]{8}$/.test(code))return fail(res,400,'Սխալ հրավեր։');
 if(!friends(sender,receiver))return fail(res,403,'Հրավիրել կարելի է միայն ընկերներին։');
 const room=db.prepare('SELECT id,creator_id FROM online_rooms WHERE code=?').get(code);
 if(!room)return fail(res,404,'Սենյակը չի գտնվել։');
 if(room.creator_id!==sender)return fail(res,403,'Սենյակ հրավիրել կարող է միայն ստեղծողը։');
 if(db.prepare('SELECT 1 FROM room_bans WHERE room_id=? AND user_id=?').get(room.id,receiver))return fail(res,403,'Այս խաղացողը հեռացված է սենյակից։');
 if(db.prepare('SELECT 1 FROM online_room_members WHERE room_id=? AND user_id=?').get(room.id,receiver))return fail(res,409,'Խաղացողն արդեն սենյակում է։');
 const pending=db.prepare(`SELECT 1 FROM friend_room_invites WHERE room_id=? AND receiver_id=? AND status='pending'`).get(room.id,receiver);
 if(pending)return fail(res,409,'Հրավերն արդեն ուղարկված է։');
 db.prepare(`INSERT INTO friend_room_invites(room_id,sender_id,receiver_id,status,created_at) VALUES(?,?,?,'pending',?)`).run(room.id,sender,receiver,Date.now());
 res.status(201).json({success:true});
});
router.post('/invites/:id/respond',(req,res)=>{
 const uid=req.onlineUser.user_id,id=Number(req.params.id),decision=req.body?.decision;
 if(!validId(id)||!['accepted','declined'].includes(decision))return fail(res,400,'Սխալ հրավեր։');
 const invite=db.prepare(`SELECT i.*,r.code,r.creator_id FROM friend_room_invites i JOIN online_rooms r ON r.id=i.room_id WHERE i.id=? AND i.receiver_id=? AND i.status='pending'`).get(id,uid);
 if(!invite)return fail(res,404,'Հրավերը հասանելի չէ։');
 if(decision==='declined'){
  db.prepare(`UPDATE friend_room_invites SET status='declined' WHERE id=?`).run(id);
  return res.json({success:true});
 }
 if(invite.sender_id!==invite.creator_id||!friends(uid,invite.sender_id))return fail(res,403,'Հրավերն այլևս վավեր չէ։');
 if(db.prepare('SELECT 1 FROM room_bans WHERE room_id=? AND user_id=?').get(invite.room_id,uid))return fail(res,403,'Այս սենյակից հեռացված ես։');
 const count=db.prepare('SELECT COUNT(*) n FROM online_room_members WHERE room_id=?').get(invite.room_id).n;
 const existing=db.prepare('SELECT 1 FROM online_room_members WHERE room_id=? AND user_id=?').get(invite.room_id,uid);
 if(!existing&&count>=15)return fail(res,409,'Սենյակն արդեն լիքն է։');
 db.transaction(()=>{
  db.prepare('INSERT OR IGNORE INTO online_room_members(room_id,user_id,joined_at) VALUES(?,?,?)').run(invite.room_id,uid,Date.now());
  db.prepare(`UPDATE friend_room_invites SET status='accepted' WHERE id=?`).run(id);
 })();
 require('./phase10-server').notifyJoin(invite.code);
 res.json({success:true,code:invite.code});
});
module.exports=router;
