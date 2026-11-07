/* Phase 9 — authenticated, server-stored asynchronous score rooms.
   Submitted scores are self-reported, not independently verified. */
const crypto = require('node:crypto');
const bcrypt = require('bcrypt');
const express = require('express');
const db = require('./admin-schema');
const router = express.Router();
const LIMIT = 15;
const MAX_SCORE = 10000;
const ttl = 14 * 24 * 3600 * 1000;

db.exec(`
 CREATE TABLE IF NOT EXISTS online_sessions(
  token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL,
  expires_at INTEGER NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id));
 CREATE TABLE IF NOT EXISTS online_rooms(
  id INTEGER PRIMARY KEY, code TEXT UNIQUE NOT NULL,
  creator_id INTEGER NOT NULL, created_at INTEGER NOT NULL,
  FOREIGN KEY(creator_id) REFERENCES users(id));
 CREATE TABLE IF NOT EXISTS online_room_members(
  room_id INTEGER NOT NULL, user_id INTEGER NOT NULL, joined_at INTEGER NOT NULL,
  PRIMARY KEY(room_id,user_id), FOREIGN KEY(room_id) REFERENCES online_rooms(id),
  FOREIGN KEY(user_id) REFERENCES users(id));
 CREATE TABLE IF NOT EXISTS online_room_scores(
  room_id INTEGER NOT NULL, user_id INTEGER NOT NULL, score INTEGER NOT NULL,
  team_name TEXT NOT NULL, updated_at INTEGER NOT NULL,
  PRIMARY KEY(room_id,user_id), FOREIGN KEY(room_id) REFERENCES online_rooms(id),
  FOREIGN KEY(user_id) REFERENCES users(id));
 CREATE INDEX IF NOT EXISTS online_score_rank ON online_room_scores(score DESC);
`);
// Phase 16: room privacy and moderation are enforced server-side.
db.exec(`CREATE TABLE IF NOT EXISTS room_security(
 room_id INTEGER PRIMARY KEY,private INTEGER NOT NULL DEFAULT 0,
 invite_hash TEXT, password_hash TEXT);
 CREATE TABLE IF NOT EXISTS room_bans(
 room_id INTEGER NOT NULL,user_id INTEGER NOT NULL,
 PRIMARY KEY(room_id,user_id));`);
const securityFor = rid => db.prepare('SELECT private,invite_hash,password_hash FROM room_security WHERE room_id=?').get(rid)||{private:0,invite_hash:null,password_hash:null};
const inviteToken = () => crypto.randomBytes(24).toString('hex');
const safeSecret = x => typeof x==='string'&&x.length>=6&&x.length<=72;
function roomDetails(rid,userId){
 const room=db.prepare('SELECT creator_id FROM online_rooms WHERE id=?').get(rid);
 const settings=securityFor(rid);
 return {private:!!settings.private,passwordProtected:!!settings.password_hash,
   isHost:room?.creator_id===userId};
}
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const fail = (res, status, message) => res.status(status).json({success:false,message});
const nameOK = x => typeof x === 'string' && /^[\p{L}\p{N}_-]{3,24}$/u.test(x);
const safeRoomCode = x => typeof x === 'string' && /^[A-Z2-9]{8}$/.test(x);
function auth(req,res,next) {
 const match = /^Bearer ([a-f0-9]{64})$/.exec(req.get('authorization') || '');
 if (!match) return fail(res,401,'Մուտք գործիր Online հաշիվ։');
 const session = db.prepare(`SELECT s.user_id, u.username FROM online_sessions s
 JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?`)
 .get(hash(match[1]),Date.now());
 if (!session) return fail(res,401,'Online session-ը ավարտվել է։ Մուտք գործիր նորից։');
 if(db.prepare('SELECT 1 FROM admin_suspensions WHERE user_id=?').get(session.user_id))return fail(res,403,'Այս հաշիվը ժամանակավորապես կասեցված է։');
 req.onlineUser = session; req.onlineTokenHash=hash(match[1]); next();
}
const throttles = new Map();
function throttle(req,res,next) {
 const id = req.ip || 'unknown', now=Date.now();
 let record=throttles.get(id);
 if(!record || now-record.start>60000) record={start:now,count:0};
 record.count++;throttles.set(id,record);
 if(throttles.size>10000) for(const [key,r] of throttles) if(now-r.start>60000) throttles.delete(key);
 if(record.count>100) return fail(res,429,'Չափազանց շատ հարցումներ։ Փորձիր մեկ րոպեից։');
 next();
}
router.use(throttle);
router.post('/register',async(req,res)=>{
 const {username,password}=req.body || {};
 if(!nameOK(username)||typeof password!=='string'||password.length<8||password.length>128)
   return fail(res,400,'Username՝ 3–24 տառ/թիվ, գաղտնաբառ՝ 8–128 նիշ։');
 try {
  if(db.prepare('SELECT id FROM users WHERE username=?').get(username)) return fail(res,409,'Username-ն արդեն զբաղված է։');
  const hashed=await bcrypt.hash(password,12);
  db.prepare('INSERT INTO users(username,password) VALUES(?,?)').run(username,hashed);
  res.status(201).json({success:true,message:'Online հաշիվը ստեղծված է։ Հիմա մուտք գործիր։'});
 } catch(e) {if(e.code==='SQLITE_CONSTRAINT_UNIQUE')return fail(res,409,'Username-ն արդեն զբաղված է։');console.error(e);fail(res,500,'Server error');}
});
router.post('/login',async(req,res)=>{
 const {username,password}=req.body||{};
 if(!nameOK(username)||typeof password!=='string'||password.length>128) return fail(res,401,'Սխալ տվյալներ։');
 try {
  const user=db.prepare('SELECT id,username,password FROM users WHERE username=?').get(username);
  if(!user||!(await bcrypt.compare(password,user.password)))return fail(res,401,'Սխալ username կամ գաղտնաբառ։');
  if(db.prepare('SELECT 1 FROM admin_suspensions WHERE user_id=?').get(user.id))return fail(res,403,'Այս հաշիվը ժամանակավորապես կասեցված է։');
  const token=crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO online_sessions(token_hash,user_id,expires_at) VALUES(?,?,?)').run(hash(token),user.id,Date.now()+ttl);
  res.json({success:true,token,user:{username:user.username},expiresAt:Date.now()+ttl});
 } catch(e){console.error(e);fail(res,500,'Server error');}
});
router.post('/logout',auth,(req,res)=>{
 db.prepare('DELETE FROM online_sessions WHERE token_hash=?').run(req.onlineTokenHash);
 res.json({success:true});
});
router.get('/me',auth,(req,res)=>res.json({success:true,username:req.onlineUser.username}));
router.post('/rooms',auth,async(req,res)=>{
 const isPrivate=req.body?.private===true;
 const password=req.body?.password||'';
 if(password&&!safeSecret(password))return fail(res,400,'Սենյակի գաղտնաբառ՝ 6–72 նիշ։');
 if(req.body?.private!==undefined&&typeof req.body.private!=='boolean')return fail(res,400,'Սխալ private արժեք։');
 const invite=isPrivate?inviteToken():null;
 const hashedPassword=password?await bcrypt.hash(password,10):null;
 let code;
 do {code=crypto.randomBytes(6).toString('base64url').toUpperCase().replace(/[^A-Z2-9]/g,'').slice(0,8);}
 while(!safeRoomCode(code)||db.prepare('SELECT id FROM online_rooms WHERE code=?').get(code));
 const now=Date.now();
 const tx=db.transaction(()=>{
  const info=db.prepare('INSERT INTO online_rooms(code,creator_id,created_at) VALUES(?,?,?)').run(code,req.onlineUser.user_id,now);
  db.prepare('INSERT INTO online_room_members(room_id,user_id,joined_at) VALUES(?,?,?)').run(info.lastInsertRowid,req.onlineUser.user_id,now);
  db.prepare('INSERT INTO room_security(room_id,private,invite_hash,password_hash) VALUES(?,?,?,?)').run(info.lastInsertRowid,isPrivate?1:0,invite?hash(invite):null,hashedPassword);
 });tx();res.status(201).json({success:true,code,inviteToken:invite,private:isPrivate,passwordProtected:!!hashedPassword});
});
router.post('/rooms/:code/join',auth,async(req,res)=>{
 const code=String(req.params.code||'').toUpperCase();
 if(!safeRoomCode(code))return fail(res,400,'Սենյակի կոդը պետք է լինի 8 նիշ։');
 const room=db.prepare('SELECT id FROM online_rooms WHERE code=?').get(code);
 if(!room)return fail(res,404,'Սենյակը չի գտնվել։');
 if(db.prepare('SELECT 1 FROM room_bans WHERE room_id=? AND user_id=?').get(room.id,req.onlineUser.user_id))return fail(res,403,'Host-ը քեզ հեռացրել է այս սենյակից։');
 const sec=securityFor(room.id);
 const existing=db.prepare('SELECT 1 FROM online_room_members WHERE room_id=? AND user_id=?').get(room.id,req.onlineUser.user_id);
 if(!existing){
   const invitation=req.body?.inviteToken;
   if(sec.private&&(!/^[a-f0-9]{48}$/.test(invitation||'')||hash(invitation)!==sec.invite_hash))return fail(res,403,'Փակ սենյակի հրավերի կոդը սխալ է։');
   const password=req.body?.password;
   if(sec.password_hash&&(typeof password!=='string'||password.length>72||!(await bcrypt.compare(password,sec.password_hash))))return fail(res,403,'Սենյակի գաղտնաբառը սխալ է։');
 }
 const count=db.prepare('SELECT COUNT(*) AS n FROM online_room_members WHERE room_id=?').get(room.id).n;
 if(!existing && count>=LIMIT)return fail(res,409,'Սենյակն արդեն լիքն է։');
 db.prepare('INSERT OR IGNORE INTO online_room_members(room_id,user_id,joined_at) VALUES(?,?,?)').run(room.id,req.onlineUser.user_id,Date.now());
 require('./phase10-server').notifyJoin(code);
 res.json({success:true,code});
});
function roomForMember(req,res){
 const code=String(req.params.code||'').toUpperCase();
 if(!safeRoomCode(code)){fail(res,400,'Սենյակի կոդը սխալ է։');return null;}
 const room=db.prepare(`SELECT r.id,r.code,r.created_at FROM online_rooms r
 JOIN online_room_members m ON m.room_id=r.id
 WHERE r.code=? AND m.user_id=?`).get(code,req.onlineUser.user_id);
 if(!room){fail(res,404,'Սկզբում միացիր այդ սենյակին։');return null;}
 return room;
}
router.get('/rooms/:code',auth,(req,res)=>{
 const room=roomForMember(req,res);if(!room)return;
 const members=db.prepare(`SELECT u.id, u.username, s.score, s.team_name AS teamName, s.updated_at AS updatedAt
 FROM online_room_members m JOIN users u ON u.id=m.user_id
 LEFT JOIN online_room_scores s ON s.room_id=m.room_id AND s.user_id=m.user_id
 WHERE m.room_id=? ORDER BY (s.score IS NULL), s.score DESC, u.username COLLATE NOCASE`).all(room.id);
 res.json({success:true,code:room.code,members,unverified:true,security:roomDetails(room.id,req.onlineUser.user_id)});
});
router.post('/rooms/:code/security',auth,async(req,res)=>{
 const room=roomForMember(req,res);if(!room)return;
 const who=db.prepare('SELECT creator_id FROM online_rooms WHERE id=?').get(room.id);
 if(who.creator_id!==req.onlineUser.user_id)return fail(res,403,'Միայն Host-ը կարող է փոխել սենյակի անվտանգությունը։');
 const {private:isPrivate,password,rotateInvite}=req.body||{};
 if(typeof isPrivate!=='boolean'||typeof rotateInvite!=='boolean'||(password!==undefined&&password!==null&&password!==''&&!safeSecret(password)))return fail(res,400,'Սխալ կարգավորումներ։');
 const old=securityFor(room.id);
 const invitation=(isPrivate && (!old.invite_hash||rotateInvite||!old.private))?inviteToken():null;
 const newHash=invitation?hash(invitation):(isPrivate?old.invite_hash:null);
 const passwordHash=password===null?'':password?await bcrypt.hash(password,10):old.password_hash;
 db.prepare(`INSERT INTO room_security(room_id,private,invite_hash,password_hash) VALUES(?,?,?,?)
 ON CONFLICT(room_id) DO UPDATE SET private=excluded.private,invite_hash=excluded.invite_hash,password_hash=excluded.password_hash`)
 .run(room.id,isPrivate?1:0,newHash,passwordHash||null);
 require('./phase10-server').notifyJoin(room.code);
 res.json({success:true,security:roomDetails(room.id,req.onlineUser.user_id),inviteToken:invitation});
});
router.post('/rooms/:code/kick',auth,(req,res)=>{
 const room=roomForMember(req,res);if(!room)return;
 const creator=db.prepare('SELECT creator_id FROM online_rooms WHERE id=?').get(room.id)?.creator_id;
 if(creator!==req.onlineUser.user_id)return fail(res,403,'Միայն Host-ը կարող է հեռացնել մասնակցին։');
 const uid=req.body?.userId;
 if(!Number.isSafeInteger(uid)||uid===creator)return fail(res,400,'Ընտրիր մեկ այլ մասնակցի։');
 const found=db.prepare('SELECT 1 FROM online_room_members WHERE room_id=? AND user_id=?').get(room.id,uid);
 if(!found)return fail(res,404,'Մասնակիցը չի գտնվել։');
 if(require('./phase10-server').isActive(room.id))return fail(res,409,'Խաղի ընթացքում մասնակցին հեռացնել հնարավոր չէ։');
 db.transaction(()=>{
  db.prepare('INSERT OR IGNORE INTO room_bans(room_id,user_id) VALUES(?,?)').run(room.id,uid);
  db.prepare('DELETE FROM online_room_members WHERE room_id=? AND user_id=?').run(room.id,uid);
  db.prepare('DELETE FROM live_room_ready WHERE room_id=? AND user_id=?').run(room.id,uid);
  db.prepare('DELETE FROM live_player_teams WHERE room_id=? AND user_id=?').run(room.id,uid);
  db.prepare('DELETE FROM live_player_scores WHERE room_id=? AND user_id=?').run(room.id,uid);
  db.prepare('DELETE FROM online_room_scores WHERE room_id=? AND user_id=?').run(room.id,uid);
 })();
 require('./phase10-server').removeMember(room.id,uid);
 res.json({success:true});
});
router.get('/rooms/:code/bans',auth,(req,res)=>{
 const room=roomForMember(req,res);if(!room)return;
 const creator=db.prepare('SELECT creator_id FROM online_rooms WHERE id=?').get(room.id)?.creator_id;
 if(creator!==req.onlineUser.user_id)return fail(res,403,'Միայն Host-ը կարող է տեսնել հեռացվածներին։');
 const banned=db.prepare('SELECT u.id,u.username FROM room_bans b JOIN users u ON u.id=b.user_id WHERE b.room_id=? ORDER BY u.username').all(room.id);
 res.json({success:true,banned});
});
router.post('/rooms/:code/unban',auth,(req,res)=>{
 const room=roomForMember(req,res);if(!room)return;
 const creator=db.prepare('SELECT creator_id FROM online_rooms WHERE id=?').get(room.id)?.creator_id;
 if(creator!==req.onlineUser.user_id)return fail(res,403,'Միայն Host-ը կարող է վերադարձնել մասնակցին։');
 if(!Number.isSafeInteger(req.body?.userId))return fail(res,400,'Սխալ մասնակից։');
 db.prepare('DELETE FROM room_bans WHERE room_id=? AND user_id=?').run(room.id,req.body.userId);
 res.json({success:true});
});
router.post('/rooms/:code/score',auth,(req,res)=>{
 const room=roomForMember(req,res);if(!room)return;
 const {score,teamName}=req.body||{};
 if(!Number.isSafeInteger(score)||score<0||score>MAX_SCORE||typeof teamName!=='string'||!teamName.trim()||teamName.trim().length>40)
  return fail(res,400,'Միավորը պետք է լինի 0–10000, թիմի անունը՝ մինչև 40 նիշ։');
 db.prepare(`INSERT INTO online_room_scores(room_id,user_id,score,team_name,updated_at)
 VALUES(?,?,?,?,?) ON CONFLICT(room_id,user_id) DO UPDATE SET
 score=MAX(score,excluded.score),
 team_name=CASE WHEN excluded.score>score THEN excluded.team_name ELSE team_name END,
 updated_at=CASE WHEN excluded.score>score THEN excluded.updated_at ELSE updated_at END`)
 .run(room.id,req.onlineUser.user_id,score,teamName.trim(),Date.now());
 res.json({success:true,message:'Լավագույն արդյունքը պահպանված է (չստուգված)։'});
});
router.get('/leaderboard',auth,(req,res)=>{
 const players=db.prepare(`SELECT u.username, MAX(s.score) AS bestScore, COUNT(DISTINCT s.room_id) AS rooms
 FROM online_room_scores s JOIN users u ON u.id=s.user_id
 GROUP BY s.user_id ORDER BY bestScore DESC, rooms DESC, u.username COLLATE NOCASE LIMIT 30`).all();
 res.json({success:true,players,unverified:true});
});
router.use('/friends',auth,require('./phase17-server'));
router.use('/live', auth, require('./phase10-server'));
router.onlineAuth=auth;
module.exports=router;
