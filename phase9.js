/* Phase 9: online asynchronous rooms and leaderboard. Phase 1-8 unaffected. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const store='armkerp_online_v1';
 let session=null, poll=null, busy=false;
 const root=()=>($('phase9-api-url')?.value||location.origin).trim().replace(/\/+$/,'');
 const element=(tag,text,cls='')=>{const e=document.createElement(tag);e.textContent=text||'';if(cls)e.className=cls;return e;};
 const status=(txt,bad=false)=>{const e=$('phase9-status');if(e){e.textContent=txt;e.classList.toggle('p9-error',bad);}};
 const request=async(path,method='GET',data,needsAuth=true)=>{
  const headers={};if(data!==undefined)headers['Content-Type']='application/json';
  if(needsAuth&&session?.token)headers.Authorization='Bearer '+session.token;
  const resp=await fetch(root()+'/api/online'+path,{method,headers,body:data===undefined?undefined:JSON.stringify(data)});
  const body=await resp.json().catch(()=>({message:'Սերվերի պատասխանը սխալ է։'}));
  if(!resp.ok)throw Error(body.message||'Network error '+resp.status);
  return body;
 };
 function persist(){try{session?sessionStorage.setItem(store,JSON.stringify(session)):sessionStorage.removeItem(store);}catch(_){} window.dispatchEvent(new Event('armkerp:online-session'));}
 function restore(){try{const raw=JSON.parse(sessionStorage.getItem(store)||'null');if(raw&&raw.token&&raw.origin===root())session=raw;}catch(_){session=null;}}
 function clear(){session=null;persist();stopPoll();renderAuth();}
 function stopPoll(){if(poll){clearInterval(poll);poll=null;}}
 const button=(label,action,secondary=false)=>{const b=element('button',label,'p9-btn'+(secondary?' p9-muted':''));b.type='button';b.addEventListener('click',action);return b;};
 const input=(id,placeholder,type='text')=>{const e=element('input','', 'p9-input');e.id=id;e.placeholder=placeholder;e.type=type;e.autocomplete=type==='password'?'current-password':'off';return e;};
 function shell(){
  for(const id of ['phase9-setup','phase9-winner']){
   const host=$(id);if(!host)continue;
   host.replaceChildren();host.append(element('h3','🌐 Online մրցումներ'));
   if(id==='phase9-winner'){host.append(element('p','Ուղարկիր լավագույն թիմիդ միավորը առցանց սենյակ՝ ստորև։','p9-note'));continue;}
   const cfg=element('details');cfg.append(element('summary','⚙️ Սերվերի հասցե (միայն անհրաժեշտության դեպքում)'));
   cfg.append(input('phase9-api-url','https://your-backend.example'));
   host.append(cfg);
   const ui=element('div','');ui.id='phase9-ui';host.append(ui);
   const msg=element('p','','p9-status');msg.id='phase9-status';msg.setAttribute('role','status');host.append(msg);
  }
  const conf=$('phase9-api-url');if(conf){conf.value=localStorage.getItem('armkerp_phase9_server')||location.origin;conf.addEventListener('change',()=>{localStorage.setItem('armkerp_phase9_server',root());clear();status('Սերվերի հասցեն թարմացվեց։');});}
  restore();renderAuth();
 }
 window.addEventListener('armkerp:friend-room-joined',event=>{
  if(!session||!event.detail?.code)return;
  session.room=event.detail.code;session.inviteToken=null;persist();renderAuth();
  status('✅ Ընկերոջ հրավերով միացար սենյակին։');
 });
 function renderAuth(){
  const host=$('phase9-ui');if(!host)return;host.replaceChildren();
  if(!session){
   host.append(element('p','Առանձին Online հաշիվ է պետք։ Հին, բրաուզերում պահված հաշիվը ավտոմատ չի փոխանցվում։','p9-note'));
   const user=input('p9-username','Online username');user.maxLength=24;
   const pass=input('p9-password','Գաղտնաբառ (առնվազն 8 նիշ)','password');pass.maxLength=128;
   host.append(user,pass);
   host.append(button('🔑 Online մուտք',()=>credentials(false)),button('✨ Գրանցվել',()=>credentials(true),true));
   return;
  }
  host.append(element('p','👤 '+session.username+' · սերվերային հաշիվ','p9-note'));
  host.append(button('Դուրս գալ Online հաշվից',async()=>{try{await request('/logout','POST');}catch(_){}clear();},true));
  host.append(element('h4','🏠 Խաղային սենյակ'));
  const code=input('p9-room-code','8 նիշանոց սենյակի կոդ');code.value=session.room||'';code.maxLength=8;code.autocapitalize='characters';host.append(code);
  const options=element('div','','p16-create-options');
  const privLabel=element('label');const priv=element('input');priv.type='checkbox';priv.id='p16-private';privLabel.append(priv,document.createTextNode(' 🔒 Փակ սենյակ (միայն հրավերով)'));
  options.append(privLabel,input('p16-create-password','Նոր սենյակի գաղտնաբառ (ըստ ցանկության)','password'));
  host.append(options);
  host.append(button('➕ Ստեղծել սենյակ',createRoom));
  const joinOptions=element('details');joinOptions.className='p16-join-options';joinOptions.append(element('summary','🔑 Հրավեր / գաղտնաբառ (եթե պահանջվում է)'));
  const invitation=input('p16-join-invite','Հրավերի կոդ');invitation.maxLength=48;
  const password=input('p16-join-password','Սենյակի գաղտնաբառ','password');
  joinOptions.append(invitation,password);host.append(joinOptions);
  host.append(button('🚪 Միանալ',joinRoom,true));
  const room=element('div','');room.id='p9-room';host.append(room);
  host.append(button('🏆 Global Leaderboard',leaderboard,true));
  const rank=element('div','');rank.id='p9-rank';host.append(rank);
  if(session.room){roomState();startPoll();}
 }
 async function credentials(register){
  const username=$('p9-username')?.value.trim(),password=$('p9-password')?.value;
  if(!username||!password){status('Լրացրու դաշտերը։',true);return;}
  try{
   if(register){await request('/register','POST',{username,password},false);status('✅ Հաշիվը ստեղծված է։ Սեղմիր «Online մուտք»։');return;}
   const result=await request('/login','POST',{username,password},false);
   session={token:result.token,username:result.user.username,origin:root(),room:''};persist();renderAuth();status('✅ Online մուտքը հաջողվեց։');
  }catch(e){status(e.message,true);}
 }
 function roomCode(){return ($('p9-room-code')?.value||'').trim().toUpperCase();}
 async function createRoom(){
  const isPrivate=$('p16-private')?.checked===true, password=$('p16-create-password')?.value||'';
  try{const r=await request('/rooms','POST',{private:isPrivate,password});session.room=r.code;
    session.inviteToken=r.inviteToken||null;persist();renderAuth();
    status(isPrivate?'🔒 Փակ սենյակը ստեղծվեց։ Ընկերոջդ փոխանցիր սենյակի և հրավերի կոդերը։':'Սենյակը ստեղծվեց։ Կոդը փոխանցիր ընկերոջդ։');
  }catch(e){status(e.message,true);}
 }
 async function joinRoom(){const code=roomCode();if(!/^[A-Z2-9]{8}$/.test(code)){status('Մուտքագրիր 8-նիշանոց կոդը։',true);return;}
  try{await request('/rooms/'+code+'/join','POST',{
   inviteToken:($('p16-join-invite')?.value||'').trim(), password:$('p16-join-password')?.value||''
  });session.room=code;session.inviteToken=null;persist();renderAuth();status('✅ Միացար սենյակին։');}catch(e){status(e.message,true);}}
 async function roomState(){
  if(!session?.room||busy)return;busy=true;
  try{
   const r=await request('/rooms/'+session.room);
   const host=$('p9-room');if(!host)return;host.replaceChildren();
   host.append(element('h4','🔗 Սենյակ՝ '+r.code));
   const sec=r.security||{};
   host.append(element('p',(sec.private?'🔒 Փակ':'🌐 Բաց')+' սենյակ'+(sec.passwordProtected?' · 🔑 գաղտնաբառով':''),'p9-note'));
   if(sec.isHost){
     const controls=element('div','','p16-host-controls');
     controls.append(element('h4','🛡️ Սենյակի անվտանգություն'));
     const privLabel=element('label');const chk=element('input');chk.type='checkbox';chk.checked=!!sec.private;chk.id='p16-room-private';
     privLabel.append(chk,document.createTextNode(' 🔒 Փակ սենյակ'));controls.append(privLabel);
     const pass=input('p16-room-password','Նոր գաղտնաբառ (դատարկ = անփոփոխ)','password');controls.append(pass);
     const clearLabel=element('label');const clear=element('input');clear.type='checkbox';clear.id='p16-clear-password';clearLabel.append(clear,document.createTextNode(' Հեռացնել գաղտնաբառը'));controls.append(clearLabel);
     const rotateLabel=element('label');const rotate=element('input');rotate.type='checkbox';rotate.id='p16-rotate-invite';rotateLabel.append(rotate,document.createTextNode(' Ստեղծել նոր հրավերի կոդ'));controls.append(rotateLabel);
     controls.append(button('💾 Պահպանել անվտանգությունը',async()=>{
       try{const opts={private:chk.checked,rotateInvite:rotate.checked};if(clear.checked)opts.password=null;else if(pass.value)opts.password=pass.value;
         const data=await request('/rooms/'+r.code+'/security','POST',opts);
         if(data.inviteToken){session.inviteToken=data.inviteToken;persist();}
         if(!chk.checked){session.inviteToken=null;persist();}
         status('✅ Կարգավորումները պահպանված են։');setTimeout(roomState,0);
       }catch(e){status(e.message,true);}
     }));
     if(sec.private){
       const saved=session.inviteToken;
       if(saved){const token=input('p16-current-invite','Հրավերի կոդ');token.value=saved;token.readOnly=true;controls.append(token);
         controls.append(button('📋 Պատճենել հրավերը',()=>{
           const content='ARM Կերպ — Սենյակ '+r.code+' | Հրավերի կոդ՝ '+saved;
           if(navigator.clipboard?.writeText)navigator.clipboard.writeText(content).then(()=>status('Հրավերը պատճենված է։')).catch(()=>status('Ընտրիր կոդը և պատճենիր ձեռքով։',true));
           else status('Ընտրիր հրավերի կոդը և պատճենիր ձեռքով։',true);
         },true));
       }else controls.append(element('p','Այս բրաուզերում հրավերի կոդը չկա։ Նշիր «Ստեղծել նոր հրավերի կոդ» և պահպանիր։','p9-note'));
     }
     controls.append(element('h4','🚫 Մասնակիցների կառավարում'));
     const others=r.members.filter(m=>m.username!==session.username);
     for(const m of others){
       const line=element('div','','p16-member');line.append(element('span',m.username));
       line.append(button('Kick',async()=>{
         if(!confirm('Հեռացնե՞լ '+m.username+'-ին սենյակից։'))return;
         try{await request('/rooms/'+r.code+'/kick','POST',{userId:m.id});status('Մասնակիցը հեռացված է։');setTimeout(roomState,0);}catch(e){status(e.message,true);}
       },true));controls.append(line);
     }
     controls.append(button('🚫 Հեռացված մասնակիցներ',async()=>{
       try{const result=await request('/rooms/'+r.code+'/bans');
         const list=element('div');list.className='p16-ban-list';
         if(!result.banned.length)list.append(element('p','Հեռացված մասնակիցներ չկան։'));
         for(const m of result.banned){const line=element('div','','p16-member');line.append(element('span',m.username));line.append(button('Վերադարձնել',async()=>{
           try{await request('/rooms/'+r.code+'/unban','POST',{userId:m.id});status('Արգելքը հանված է։');setTimeout(roomState,0);}catch(e){status(e.message,true);}
         },true));list.append(line);}controls.append(list);
       }catch(e){status(e.message,true);}
     },true));
     host.append(controls);
   }

   host.append(element('p','Արդյունքները ինքնահայտարարարված են և դեռ չեն ստուգվում։','p9-note'));
   const ol=element('ol');r.members.forEach(m=>ol.append(element('li',`${m.username} — ${m.score===null?'դեռ չի ուղարկել':m.score+' միավոր'}${m.teamName?' · '+m.teamName:''}`)));host.append(ol);
   host.append(button('📤 Ուղարկել վերջին խաղի արդյունքը',submitScore));
   host.append(button('🔄 Թարմացնել',()=>roomState(),true));
   const winner=$('phase9-winner');if(winner){let w=winner.querySelector('.p9-submit');if(!w){w=button('📤 Ուղարկել արդյունքն Online սենյակ',submitScore);w.classList.add('p9-submit');winner.append(w);}}
  }catch(e){status(e.message,true);if(/մուտք|session/i.test(e.message))clear();}
  finally{busy=false;}
 }
 async function submitScore(){
  if(!session?.room){status('Նախ միացիր Online սենյակին։',true);return;}
  let result=null;try{result=JSON.parse(localStorage.getItem('armkerp_phase8_last_result')||'null');}catch(_){}
  if(!result||!Array.isArray(result.teams)||!result.teams.length){status('Սկզբում ավարտիր խաղը։',true);return;}
  const team=result.teams.slice().sort((a,b)=>b.score-a.score)[0];
  if(!team||!Number.isSafeInteger(team.score)){status('Խաղի արդյունքը սխալ է։',true);return;}
  try{await request('/rooms/'+session.room+'/score','POST',{score:team.score,teamName:team.name});status('✅ Արդյունքն ուղարկված է։');setTimeout(roomState,0);}
  catch(e){status(e.message,true);}
 }
 async function leaderboard(){
  try{const data=await request('/leaderboard');const host=$('p9-rank');if(!host)return;host.replaceChildren();host.append(element('h4','🌍 Global Top 30'));
   host.append(element('p','Միավորները չեն հաստատվում հակախաբեության համակարգով։','p9-note'));
   const ol=element('ol');data.players.forEach(p=>ol.append(element('li',`${p.username} — ${p.bestScore} միավոր`)));host.append(ol);
   if(!data.players.length)host.append(element('p','Դեռ արդյունքներ չկան։'));
  }catch(e){status(e.message,true);}
 }
 function startPoll(){stopPoll();poll=setInterval(()=>{if(session?.room&&!document.hidden&&!document.activeElement?.closest('.p16-host-controls'))roomState();},12000);}
 document.addEventListener('DOMContentLoaded',shell);
 window.phase9OnGameFinished=()=>{if(session?.room){const winner=$('phase9-winner');if(winner&&!winner.querySelector('.p9-submit')){const b=button('📤 Ուղարկել արդյունքն Online սենյակ',submitScore);b.classList.add('p9-submit');winner.append(b);}}};
})();
