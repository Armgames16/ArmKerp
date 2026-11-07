/* Phase 10: Server-authoritative real-time Alias via authenticated SSE streams.
   In-memory active rounds, persistent verified live points. Node.js single process. */
const crypto=require('node:crypto');
const express=require('express');
const db=require('./database');
const WORDS=[
 'ֆուտբոլ','համակարգիչ','դպրոց','գիրք','թատրոն','բժիշկ','օդանավ','գետ','լիճ','արև','լուսին','աստղ','հեծանիվ','հեռախոս','կինոթատրոն','ժամացույց','երաժշտություն','նկարչություն','շուն','կատու','առյուծ','փիղ','վագր','վարդ','ծաղիկ','անտառ','սար','ձյուն','անձրև','ամպ','ծով','հաց','պանիր','խնձոր','տանձ','ծիրան','դեղձ','նարինջ','շոկոլադ','բասկետբոլ','դարպասապահ','մարզադաշտ','գնդակ','մարզիչ','մրցավար','հաղթանակ','պար','խոհարար','հացթուխ','հրդեհ','հրշեջ','ոստիկան','վարորդ','գնացք','ավտոբուս','նավ','կամուրջ','շենք','դղյակ','այգի','ընտանիք','ընկերություն','տիեզերք','մոլորակ','ռոբոտ','մկնիկ','ստեղնաշար','տեսախցիկ','լուսանկար','ծիծաղ','երազանք','տոնածառ','նվեր','ծննդյան օր','գաղտնիք','պատուհան','դուռ','սեղան','աթոռ','գորգ','բարձ','փուչիկ','լապտեր','պատմություն','աշխարհագրություն','գիտություն','մաթեմատիկա','խաղալիք'
];
const router=express.Router();
const games=new Map(); // room ID -> active game state
const streams=new Map(); // room ID -> Set<{res,userId}>
const RECENT_LIMIT=8;
const chatHistory=new Map(),chatCooldown=new Map();
const voiceUsers=new Map(); // room -> Map(userId -> last heartbeat)
const voiceMessages=new Map(); // room -> short-lived, recipient-only WebRTC signaling
let voiceSeq=0;
const voiceActive=(rid)=>{const now=Date.now(),map=voiceUsers.get(rid);if(!map)return [];for(const [id,t] of map)if(now-t>45000)map.delete(id);if(!map.size)voiceUsers.delete(rid);return [...map.keys()];};
const voiceQueue=(rid)=>{const now=Date.now();const q=(voiceMessages.get(rid)||[]).filter(x=>now-x.at<60000);voiceMessages.set(rid,q);return q;};
const teamMode=new Map(); // room ID -> boolean (reset on server restart)
const teamFor=(rid,uid)=>db.prepare('SELECT team FROM live_player_teams WHERE room_id=? AND user_id=?').get(rid,uid)?.team||null;
const teamScores=(members)=>['red','blue'].map(team=>({team,points:members.filter(p=>p.team===team).reduce((sum,p)=>sum+p.points,0)}));
const settingsFor=(rid)=>db.prepare("SELECT duration,rounds FROM live_room_settings WHERE room_id=?").get(rid)||{duration:60,rounds:3};
const readiness=(rid)=>db.prepare("SELECT user_id FROM live_room_ready WHERE room_id=? AND ready=1").all(rid).map(x=>x.user_id);
db.exec(`CREATE TABLE IF NOT EXISTS live_room_settings(
 room_id INTEGER PRIMARY KEY, duration INTEGER NOT NULL DEFAULT 60,
 rounds INTEGER NOT NULL DEFAULT 3);
 CREATE TABLE IF NOT EXISTS live_room_ready(room_id INTEGER NOT NULL,user_id INTEGER NOT NULL,
 ready INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(room_id,user_id));
 CREATE TABLE IF NOT EXISTS live_player_teams(room_id INTEGER NOT NULL,user_id INTEGER NOT NULL,
 team TEXT NOT NULL CHECK(team IN ('red','blue')),PRIMARY KEY(room_id,user_id));
 CREATE TABLE IF NOT EXISTS live_player_scores(
 room_id INTEGER NOT NULL,user_id INTEGER NOT NULL,points INTEGER NOT NULL DEFAULT 0,
 PRIMARY KEY(room_id,user_id),FOREIGN KEY(room_id) REFERENCES online_rooms(id),
 FOREIGN KEY(user_id) REFERENCES users(id));`);
function error(res,code,message){return res.status(code).json({success:false,message});}
function room(req,res){
 const code=String(req.params.code||'').toUpperCase();
 if(!/^[A-Z2-9]{8}$/.test(code)){error(res,400,'Սենյակի կոդը սխալ է։');return null;}
 const r=db.prepare(`SELECT r.id,r.code,r.creator_id FROM online_rooms r
 JOIN online_room_members m ON m.room_id=r.id
 WHERE r.code=? AND m.user_id=?`).get(code,req.onlineUser.user_id);
 if(!r){error(res,403,'Դու այս սենյակի մասնակիցը չես։');return null;}
 return r;
}
const normalize=s=>s.normalize('NFC').trim().toLocaleLowerCase('hy-AM').replace(/[\s\u0589\u055c\u055d\u055e\u055f.,!?։՝«»"'()\-]+/g,'');
function pick(game){
 let choices=WORDS.filter(w=>!game.recent.includes(w));
 if(!choices.length)choices=WORDS;
 const word=choices[crypto.randomInt(choices.length)];
 game.recent.push(word);if(game.recent.length>RECENT_LIMIT)game.recent.shift();
 game.word=word;game.revision++;
}
function finish(rid){
 const game=games.get(rid);if(!game||game.status!=='playing')return;
 game.status='finished';game.word=null;game.revision++;
 publish(rid);
}
function liveSnapshot(r,userId){
 const game=games.get(r.id);
 if(game&&game.status==='playing'&&Date.now()>=game.endsAt)finish(r.id);
 const g=games.get(r.id);
 const members=db.prepare(`SELECT u.id,u.username,COALESCE(s.points,0) AS points, t.team FROM online_room_members m
 JOIN users u ON u.id=m.user_id LEFT JOIN live_player_scores s
 ON s.room_id=m.room_id AND s.user_id=m.user_id
 LEFT JOIN live_player_teams t ON t.room_id=m.room_id AND t.user_id=m.user_id
 WHERE m.room_id=? ORDER BY points DESC,u.username COLLATE NOCASE`).all(r.id);
 const readyIds=new Set(readiness(r.id));
 const teamsEnabled=teamMode.get(r.id)===true;
 const sec=db.prepare('SELECT private,password_hash FROM room_security WHERE room_id=?').get(r.id);
 const payload={success:true,code:r.code,security:{private:!!sec?.private,passwordProtected:!!sec?.password_hash},hostId:r.creator_id,myId:userId,settings:settingsFor(r.id),teamMode:teamsEnabled,
  teamScores:teamScores(members),chat:(chatHistory.get(r.id)||[]),
  voiceUsers:voiceActive(r.id),voiceSignals:voiceQueue(r.id).filter(x=>x.to===userId).map(({id,from,to,type,payload})=>({id,from,to,type,payload})),
  members:members.map(({id,username,points,team})=>({id,username,points,team:team||null,ready:readyIds.has(id)})),
  round:g?{status:g.status,endsAt:g.endsAt,startsAt:g.startsAt||null,round:g.round,revision:g.revision,
    hostWord:userId===r.creator_id&&g.status==='playing'?g.word:null,
    hints:g.status==='playing'?'Հաղորդավարը բացատրում է բառը։':null,
    lastCorrect:g.lastCorrect||null}:null};
 return payload;
}
function publish(rid){
 const subs=streams.get(rid);if(!subs)return;
 const r=db.prepare('SELECT id,code,creator_id FROM online_rooms WHERE id=?').get(rid);
 if(!r)return;
 for(const entry of [...subs]){
  if(!db.prepare('SELECT 1 FROM online_room_members WHERE room_id=? AND user_id=?').get(rid,entry.userId)){try{entry.res.end();}catch(_){}subs.delete(entry);continue;}
  try{entry.res.write('event: state\ndata: '+JSON.stringify(liveSnapshot(r,entry.userId))+'\n\n');}
  catch(_){subs.delete(entry);}
 }
}
// Phase 13: authenticated signaling. The actual audio is WebRTC peer-to-peer;
// audio never passes through this server. Signaling expires after 60 seconds.
router.post('/rooms/:code/voice/presence',(req,res)=>{
 const r=room(req,res);if(!r)return;
 const enabled=req.body?.enabled===true;
 let users=voiceUsers.get(r.id);if(!users){users=new Map();voiceUsers.set(r.id,users);}
 const id=req.onlineUser.user_id;
 if(enabled&&!users.has(id)){voiceMessages.set(r.id,voiceQueue(r.id).filter(x=>x.to!==id&&x.from!==id));}
 if(enabled)users.set(id,Date.now());else {users.delete(id);voiceMessages.set(r.id,voiceQueue(r.id).filter(x=>x.to!==id&&x.from!==id));}
 if(!users.size)voiceUsers.delete(r.id);
 publish(r.id);res.json({success:true});
});
router.post('/rooms/:code/voice/signal',(req,res)=>{
 const r=room(req,res);if(!r)return;
 const to=req.body?.to,type=req.body?.type,payload=req.body?.payload;
 if(!Number.isSafeInteger(to)||to===req.onlineUser.user_id||!['offer','answer','candidate'].includes(type))return error(res,400,'Invalid voice signal');
 if(!voiceActive(r.id).includes(req.onlineUser.user_id)||!voiceActive(r.id).includes(to))return error(res,409,'Both users must enable voice chat');
 if(typeof payload!=='object'||payload===null||Array.isArray(payload))return error(res,400,'Invalid signal data');
 const serialized=JSON.stringify(payload);
 if(serialized.length>12000)return error(res,413,'Signal is too large');
 const queue=voiceQueue(r.id);
 queue.push({id:++voiceSeq,from:req.onlineUser.user_id,to,type,payload,at:Date.now()});
 if(queue.length>250)queue.splice(0,queue.length-250);
 publish(r.id);res.json({success:true});
});
// All endpoints authenticated by parent router, including streaming fetch with bearer header.
router.get('/rooms/:code/state',(req,res)=>{const r=room(req,res);if(r)res.json(liveSnapshot(r,req.onlineUser.user_id));});
router.get('/rooms/:code/events',(req,res)=>{
 const r=room(req,res);if(!r)return;
 const count=[...streams.values()].reduce((sum,set)=>sum+set.size,0);
 if(count>500)return error(res,503,'Չափազանց շատ բաց կապեր կան։');
 res.set({'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});
 res.flushHeaders();
 const entry={res,userId:req.onlineUser.user_id};
 if(!streams.has(r.id))streams.set(r.id,new Set());streams.get(r.id).add(entry);
 res.write('retry: 2000\nevent: state\ndata: '+JSON.stringify(liveSnapshot(r,entry.userId))+'\n\n');
 const heartbeat=setInterval(()=>{try{res.write(': ping\n\n');}catch(_){}},20000);
 req.on('close',()=>{clearInterval(heartbeat);const set=streams.get(r.id);if(set){set.delete(entry);if(!set.size)streams.delete(r.id);}});
});
router.post('/rooms/:code/start',(req,res)=>{
 const r=room(req,res);if(!r)return;
 if(r.creator_id!==req.onlineUser.user_id)return error(res,403,'Միայն սենյակի հեղինակը կարող է սկսել։');
 const count=db.prepare('SELECT COUNT(*) AS n FROM online_room_members WHERE room_id=?').get(r.id).n;
 if(count<2)return error(res,409,'Սկսելու համար պետք է առնվազն 2 մասնակից։');
 const guests=db.prepare('SELECT user_id FROM online_room_members WHERE room_id=? AND user_id<>?').all(r.id,r.creator_id);
 const ready=new Set(readiness(r.id));
 if(guests.some(x=>!ready.has(x.user_id)))return error(res,409,'Բոլոր հյուրերը դեռ պատրաստ չեն։');
 const previous=games.get(r.id);
 if(previous?.status==='playing'||previous?.status==='countdown')return error(res,409,'Փուլն արդեն ընթացքի մեջ է։');
 if(teamMode.get(r.id)===true){
  const others=db.prepare('SELECT user_id FROM online_room_members WHERE room_id=? AND user_id<>?').all(r.id,r.creator_id);
  const assigned=others.map(p=>teamFor(r.id,p.user_id));
  if(!assigned.includes('red')||!assigned.includes('blue'))return error(res,409,'Թիմային խաղի համար պետք են առնվազն երկու գուշակողներ՝ տարբեր թիմերում (Host-ից բացի)։');
 }
 const now=Date.now(),settings=settingsFor(r.id);
 if(previous && previous.round>=settings.rounds)return error(res,409,'Բոլոր փուլերն ավարտվել են։ Սեղմիր Rematch։');
 const game={status:'countdown',round:(previous?.round||0)+1,startsAt:now+3000,endsAt:now+3000+settings.duration*1000,
  word:null,recent:previous?.recent||[],revision:0,lastCorrect:null,lastGuess:new Map(),skips:0};
 games.set(r.id,game);pick(game);
 const ref=game;
 const launch=setTimeout(()=>{if(games.get(r.id)===ref&&game.status==='countdown'){game.status='playing';game.revision++;publish(r.id);}},3000);
 launch.unref?.();
 const timeout=setTimeout(()=>{if(games.get(r.id)===ref)finish(r.id);},settings.duration*1000+3010);
 timeout.unref?.();publish(r.id);res.json(liveSnapshot(r,req.onlineUser.user_id));
});
router.post('/rooms/:code/guess',(req,res)=>{
 const r=room(req,res);if(!r)return;
 if(r.creator_id===req.onlineUser.user_id)return error(res,403,'Հաղորդավարը չի կարող գուշակել։');
 const g=games.get(r.id);
 if(!g||g.status!=='playing'||Date.now()>=g.endsAt){finish(r.id);return error(res,409,'Ակտիվ փուլ չկա։');}
 const answer=req.body?.guess;
 if(typeof answer!=='string'||!answer.trim()||answer.length>60)return error(res,400,'Գրիր 1–60 նիշանոց պատասխան։');
 const now=Date.now(),prev=g.lastGuess.get(req.onlineUser.user_id)||0;
 if(now-prev<700)return error(res,429,'Մի փոքր դանդաղ գուշակիր։');
 g.lastGuess.set(req.onlineUser.user_id,now);
 const correct=normalize(answer)===normalize(g.word);
 if(correct){
  db.prepare(`INSERT INTO live_player_scores(room_id,user_id,points) VALUES(?,?,1)
  ON CONFLICT(room_id,user_id) DO UPDATE SET points=points+1`).run(r.id,req.onlineUser.user_id);
  g.lastCorrect=req.onlineUser.username+'՝ +1 միավոր';pick(g);publish(r.id);
 }
 res.json({success:true,correct});
});
router.post('/rooms/:code/skip',(req,res)=>{
 const r=room(req,res);if(!r)return;
 if(r.creator_id!==req.onlineUser.user_id)return error(res,403,'Միայն հաղորդավարը կարող է բաց թողնել։');
 const g=games.get(r.id);if(!g||g.status!=='playing'||Date.now()>=g.endsAt){finish(r.id);return error(res,409,'Ակտիվ փուլ չկա։');}
 if(g.skips>=3)return error(res,409,'Այս փուլում բաց թողնելու սահմանը 3-ն է։');
 g.skips++;g.lastCorrect=null;pick(g);publish(r.id);
 res.json({success:true,skipsLeft:3-g.skips});
});

router.post('/rooms/:code/ready',(req,res)=>{
 const r=room(req,res);if(!r)return;
 const g=games.get(r.id);if(['playing','countdown'].includes(g?.status))return error(res,409,'Խաղի ընթացքում պատրաստության վիճակը չի փոխվում։');
 if(typeof req.body?.ready!=='boolean')return error(res,400,'Սխալ ready արժեք։');
 db.prepare(`INSERT INTO live_room_ready(room_id,user_id,ready) VALUES(?,?,?)
 ON CONFLICT(room_id,user_id) DO UPDATE SET ready=excluded.ready`).run(r.id,req.onlineUser.user_id,req.body.ready?1:0);
 publish(r.id);res.json(liveSnapshot(r,req.onlineUser.user_id));
});
router.post('/rooms/:code/settings',(req,res)=>{
 const r=room(req,res);if(!r)return;
 if(r.creator_id!==req.onlineUser.user_id)return error(res,403,'Միայն Host-ը կարող է կարգավորել։');
 if(['playing','countdown'].includes(games.get(r.id)?.status))return error(res,409,'Փուլի ընթացքում կարգավորումները չեն փոխվում։');
 const {duration,rounds}=req.body||{};
 if(![30,45,60,90].includes(duration)||![1,2,3,4,5].includes(rounds))return error(res,400,'Սխալ կարգավորումներ։');
 db.prepare(`INSERT INTO live_room_settings(room_id,duration,rounds) VALUES(?,?,?)
 ON CONFLICT(room_id) DO UPDATE SET duration=excluded.duration,rounds=excluded.rounds`).run(r.id,duration,rounds);
 publish(r.id);res.json(liveSnapshot(r,req.onlineUser.user_id));
});
router.post('/rooms/:code/rematch',(req,res)=>{
 const r=room(req,res);if(!r)return;
 if(r.creator_id!==req.onlineUser.user_id)return error(res,403,'Միայն Host-ը կարող է նոր խաղ սկսել։');
 if(['playing','countdown'].includes(games.get(r.id)?.status))return error(res,409,'Նախ ավարտիր ընթացիկ փուլը։');
 games.delete(r.id);
 db.prepare('DELETE FROM live_room_ready WHERE room_id=?').run(r.id);
 db.prepare('DELETE FROM live_player_scores WHERE room_id=?').run(r.id);
 publish(r.id);res.json(liveSnapshot(r,req.onlineUser.user_id));
});
router.post('/rooms/:code/transfer',(req,res)=>{
 const r=room(req,res);if(!r)return;
 if(r.creator_id!==req.onlineUser.user_id)return error(res,403,'Միայն Host-ը կարող է փոխանցել։');
 if(['playing','countdown'].includes(games.get(r.id)?.status))return error(res,409,'Host-ը կարելի է փոխել միայն փուլերի միջև։');
 const next=req.body?.userId;
 if(!Number.isSafeInteger(next)||next===r.creator_id||!db.prepare('SELECT 1 FROM online_room_members WHERE room_id=? AND user_id=?').get(r.id,next))return error(res,400,'Ընտրիր սենյակի մեկ այլ մասնակցի։');
 db.prepare('UPDATE online_rooms SET creator_id=? WHERE id=?').run(next,r.id);
 publish(r.id);res.json({success:true});
});
router.post('/rooms/:code/team-mode',(req,res)=>{
 const r=room(req,res);if(!r)return;
 if(r.creator_id!==req.onlineUser.user_id)return error(res,403,'Միայն Host-ը կարող է փոխել ռեժիմը։');
 if(['playing','countdown'].includes(games.get(r.id)?.status))return error(res,409,'Սպասիր փուլի ավարտին։');
 if(typeof req.body?.enabled!=='boolean')return error(res,400,'Սխալ ռեժիմ։');
 if(games.get(r.id)?.round)return error(res,409,'Ռեժիմը փոխելու համար սկզբում սեղմիր Rematch։');
 teamMode.set(r.id,req.body.enabled);
 db.prepare('DELETE FROM live_room_ready WHERE room_id=?').run(r.id);
 publish(r.id);res.json(liveSnapshot(r,req.onlineUser.user_id));
});
router.post('/rooms/:code/team',(req,res)=>{
 const r=room(req,res);if(!r)return;
 if(!teamMode.get(r.id))return error(res,409,'Թիմային ռեժիմը միացված չէ։');
 if(games.get(r.id)?.round)return error(res,409,'Թիմը փոխելու համար սկզբում սեղմիր Rematch։');
 const team=req.body?.team;
 if(!['red','blue'].includes(team))return error(res,400,'Ընտրիր թիմ։');
 db.prepare(`INSERT INTO live_player_teams(room_id,user_id,team) VALUES(?,?,?)
 ON CONFLICT(room_id,user_id) DO UPDATE SET team=excluded.team`).run(r.id,req.onlineUser.user_id,team);
 db.prepare('DELETE FROM live_room_ready WHERE room_id=? AND user_id=?').run(r.id,req.onlineUser.user_id);
 publish(r.id);res.json(liveSnapshot(r,req.onlineUser.user_id));
});
router.post('/rooms/:code/chat',(req,res)=>{
 const r=room(req,res);if(!r)return;
 const message=req.body?.message;
 if(typeof message!=='string'||message.trim().length<1||message.trim().length>240)return error(res,400,'Հաղորդագրությունը պետք է լինի 1–240 նիշ։');
 const key=r.id+':'+req.onlineUser.user_id,now=Date.now();
 if(now-(chatCooldown.get(key)||0)<1000)return error(res,429,'Մի փոքր դանդաղ գրիր։');
 chatCooldown.set(key,now);
 const history=chatHistory.get(r.id)||[];
 history.push({id:crypto.randomUUID(),username:req.onlineUser.username,message:message.trim(),at:now});
 if(history.length>30)history.splice(0,history.length-30);
 chatHistory.set(r.id,history);publish(r.id);res.json({success:true});
});
// Called when another player joins via the Phase 9 room endpoint.
router.isActive=(rid)=>['playing','countdown'].includes(games.get(rid)?.status);
router.removeMember=(rid,uid)=>{
 voiceUsers.get(rid)?.delete(uid);
 voiceMessages.set(rid,voiceQueue(rid).filter(x=>x.from!==uid&&x.to!==uid));
 for(const entry of [...(streams.get(rid)||[])])if(entry.userId===uid){try{entry.res.end();}catch(_){}streams.get(rid).delete(entry);}
 publish(rid);
};
router.notifyJoin=(code)=>{const r=db.prepare('SELECT id FROM online_rooms WHERE code=?').get(code);if(r)publish(r.id);};
module.exports=router;
