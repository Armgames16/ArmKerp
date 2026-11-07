/* Admin APIs: normal bearer session + DB-backed role + server-side permissions. */
const express=require('express');
const db=require('./admin-schema');
const router=express.Router();
const fail=(res,status,message)=>res.status(status).json({success:false,message});
router.use((req,res,next)=>{
 const admin=db.prepare('SELECT 1 FROM admin_users WHERE user_id=?').get(req.onlineUser.user_id);
 if(!admin)return fail(res,403,'Admin access required');
 next();
});
router.get('/overview',(req,res)=>{
 const count=q=>db.prepare(q).get().total;
 res.json({success:true,stats:{
  users:count('SELECT COUNT(*) AS total FROM users'),
  rooms:count('SELECT COUNT(*) AS total FROM online_rooms'),
  suspended:count('SELECT COUNT(*) AS total FROM admin_suspensions'),
  friendships:count("SELECT COUNT(*) AS total FROM friend_requests WHERE status='accepted'")
 }});
});
router.get('/users',(req,res)=>{
 const limit=50, offset=Math.min(10000,Math.max(0,Number.parseInt(req.query.offset,10)||0));
 const users=db.prepare(`SELECT u.id,u.username,
 CASE WHEN a.user_id IS NULL THEN 0 ELSE 1 END AS admin,
 CASE WHEN s.user_id IS NULL THEN 0 ELSE 1 END AS suspended
 FROM users u LEFT JOIN admin_users a ON a.user_id=u.id
 LEFT JOIN admin_suspensions s ON s.user_id=u.id
 ORDER BY u.id DESC LIMIT ? OFFSET ?`).all(limit,offset);
 res.json({success:true,users,offset,limit});
});
router.post('/users/:id/suspension',(req,res)=>{
 const userId=Number(req.params.id);
 if(!Number.isSafeInteger(userId)||userId<=0||typeof req.body?.suspended!=='boolean')return fail(res,400,'Invalid request');
 const user=db.prepare('SELECT id FROM users WHERE id=?').get(userId);
 if(!user)return fail(res,404,'User not found');
 if(userId===req.onlineUser.user_id)return fail(res,403,'Cannot suspend your own account');
 if(db.prepare('SELECT 1 FROM admin_users WHERE user_id=?').get(userId))return fail(res,403,'Cannot suspend an admin account');
 const suspended=req.body.suspended;
 const reason=typeof req.body.reason==='string'?req.body.reason.trim().slice(0,120):'';
 if(suspended&&!reason)return fail(res,400,'Reason required');
 db.transaction(()=>{
  if(suspended){
   db.prepare('INSERT INTO admin_suspensions(user_id,reason,created_at,actor_id) VALUES(?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET reason=excluded.reason,created_at=excluded.created_at,actor_id=excluded.actor_id').run(userId,reason,Date.now(),req.onlineUser.user_id);
   db.prepare('DELETE FROM online_sessions WHERE user_id=?').run(userId);
  }else db.prepare('DELETE FROM admin_suspensions WHERE user_id=?').run(userId);
  db.prepare('INSERT INTO admin_audit(actor_id,action,target_id,created_at) VALUES(?,?,?,?)').run(req.onlineUser.user_id,suspended?'suspend':'restore',userId,Date.now());
 })();
 res.json({success:true,suspended});
});
router.get('/audit',(req,res)=>{
 const events=db.prepare(`SELECT a.id,a.action,a.target_id AS targetId,a.created_at AS createdAt,u.username AS actor
 FROM admin_audit a JOIN users u ON u.id=a.actor_id ORDER BY a.id DESC LIMIT 40`).all();
 res.json({success:true,events});
});
module.exports=router;
