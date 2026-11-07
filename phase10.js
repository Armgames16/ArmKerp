/* Phase 10 — live party Alias (host describes, guests guess).
   Authenticated server-sent events over fetch() streaming. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const SESSION_KEY='armkerp_online_v1';
 let session=null,controller=null,connectedKey='',timer=null,latest=null,updating=false;
 const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
 const button=(label,handler)=>{const e=el('button',label,'p10-btn');e.type='button';e.addEventListener('click',handler);return e;};
 const msg=(s,error=false)=>{const e=$('p10-status');if(e){e.textContent=s;e.classList.toggle('p10-error',error);}};
 const apiRoot=()=>($('phase9-api-url')?.value||location.origin).trim().replace(/\/+$/,'');
 function getSession(){try{const s=JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null');return s?.token&&s.origin===apiRoot()&&s.room?s:null;}catch(_){return null;}}
 function url(p){return apiRoot()+'/api/online/live/rooms/'+encodeURIComponent(session.room)+p;}
 async function call(path,method='GET',body){
  const headers={'Authorization':'Bearer '+session.token};if(body)headers['Content-Type']='application/json';
  const r=await fetch(url(path),{method,headers,body:body?JSON.stringify(body):undefined});
  const data=await r.json().catch(()=>({message:'Սերվերի պատասխանը սխալ է։'}));
  if(!r.ok)throw Error(data.message||'Server error');return data;
 }
 function layout(){
  const host=$('phase10-setup');if(!host)return;
  host.replaceChildren(el('h3','⚡ Live Multiplayer'));
  host.append(el('p','Հաղորդավարը տեսնում ու բացատրում է գաղտնի բառը, իսկ մյուսները գուշակում են՝ գրելով պատասխանը։','p10-help'));
  const state=el('p','','p10-help');state.id='p10-status';state.setAttribute('role','status');host.append(state);
  const controls=el('div',undefined,'p10-actions');controls.id='p10-controls';host.append(controls);
  const info=el('div',undefined,'p10-live');info.id='p10-live';host.append(info);
  const board=el('div');board.id='p10-board';host.append(board);
  refreshSession();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshSession();});
 }
 function refreshSession(){
  const s=getSession(),key=s?s.origin+'|'+s.room+'|'+s.token:'';
  if(key===connectedKey)return;
  disconnect();connectedKey=key;session=s;latest=null;
  if(!s){window.dispatchEvent(new CustomEvent('armkerp:transport',{detail:{status:'offline'}}));msg('Նախ Online բաժնում մուտք գործիր և միացիր սենյակի։');$('p10-controls')?.replaceChildren();$('p10-live')?.replaceChildren();$('p10-board')?.replaceChildren();return;}
  msg('Միանում ենք live սենյակին՝ '+s.room+'…');window.dispatchEvent(new CustomEvent('armkerp:transport',{detail:{status:'connecting'}}));stream();
 }
 function disconnect(){if(controller){controller.abort();controller=null;}if(timer){clearInterval(timer);timer=null;}}
 const sleep=t=>new Promise(resolve=>setTimeout(resolve,t));
 async function stream(){
  const thisKey=connectedKey;let delay=1000;
  while(connectedKey===thisKey&&session){
   controller=new AbortController();
   try{
    const response=await fetch(url('/events'),{headers:{Authorization:'Bearer '+session.token,Accept:'text/event-stream'},signal:controller.signal,cache:'no-store'});
    if(response.status===401||response.status===403){window.dispatchEvent(new CustomEvent('armkerp:transport',{detail:{status:'offline'}}));msg('Live մուտքը մերժվեց։ Կրկին մուտք գործիր։',true);break;}
    if(!response.ok)throw Error('Live կապը չստացվեց ('+response.status+')');
    if(!response.body)throw Error('Streaming-ը հասանելի չէ։');
    msg('🟢 Live կապը ակտիվ է · Սենյակ '+session.room);window.dispatchEvent(new CustomEvent('armkerp:transport',{detail:{status:'connected'}}));delay=1000;
    const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='';
    while(connectedKey===thisKey){
     const {value,done}=await reader.read();if(done)break;
     buffer+=decoder.decode(value,{stream:true});
     buffer=buffer.replace(/\r\n/g,'\n');
     let sep;
     while((sep=buffer.indexOf('\n\n'))>=0){
      const chunk=buffer.slice(0,sep);buffer=buffer.slice(sep+2);
      const lines=chunk.split('\n');
      const type=lines.find(x=>x.startsWith('event:'))?.slice(6).trim()||'message';
      const payload=lines.filter(x=>x.startsWith('data:')).map(x=>x.slice(5).trimStart()).join('\n');
      if(type==='state'&&payload){
       try{latest=JSON.parse(payload);render();window.dispatchEvent(new CustomEvent('armkerp:live-state',{detail:latest}));}catch(error){console.error('[Phase11] Live render:',error);msg('Live տվյալների սխալ․ ստուգիր Console-ը։',true);}
      }
     }
     if(buffer.length>100000)buffer='';
    }
   }catch(e){if(connectedKey===thisKey&&!controller?.signal.aborted){window.dispatchEvent(new CustomEvent('armkerp:transport',{detail:{status:'reconnecting'}}));console.error('[Phase11] Stream:',e);msg('Կապը ընդհատվեց․ '+e.message,true);}}
   if(connectedKey!==thisKey)break;
   window.dispatchEvent(new CustomEvent('armkerp:transport',{detail:{status:'reconnecting'}}));
   await sleep(delay);delay=Math.min(delay*2,10000);
  }
 }
 async function action(path,body){
  if(updating||!session)return;updating=true;
  try{const data=await call(path,'POST',body||{});if(data.members){latest=data;render();window.dispatchEvent(new CustomEvent('armkerp:live-state',{detail:latest}));}return data;}
  catch(e){msg(e.message,true);return null;}finally{updating=false;}
 }
 async function guess(){
  const input=$('p10-guess');const word=input?.value.trim();if(!word)return;
  input.value='';const result=await action('/guess',{guess:word});
  if(result)msg(result.correct?'🎉 Ճիշտ է։ +1 միավոր':'Փորձիր մեկ այլ բառ։');
 }

 function renderLobby(controls,host,busy){
  const playing = latest?.round?.status === 'playing';
  const lobby=el('section',undefined,'p11-lobby');
  lobby.append(el('h4','👥 Multiplayer Lobby'));
  const members=el('div',undefined,'p11-members');
  for(const p of latest.members){
   const line=el('div',undefined,'p11-member');
   line.append(
    el('span',(p.id===latest.hostId?'👑 ':'')+(p.team==='red'?'🔴 ':p.team==='blue'?'🔵 ':'')+p.username),
    el('strong',p.ready?'✅ Ready':'⏳ Waiting')
   );
   if(host&&!busy&&p.id!==latest.myId){
    line.append(button('Փոխանցել Host',()=>{
     if(confirm('Host դարձրե՞լ '+p.username+'-ին։'))action('/transfer',{userId:p.id});
    }));
   }
   members.append(line);
  }
  lobby.append(members);
  if(latest.teamMode){
   const me=latest.members.find(p=>p.id===latest.myId);
   const teams=el('div',undefined,'p12-team-picker');
   teams.append(el('p','🔴 Կարմիր vs 🔵 Կապույտ — ընտրիր թիմդ (Host-ը միայն բացատրում է)'));
   for(const t of [{id:'red',name:'🔴 Կարմիր թիմ'},{id:'blue',name:'🔵 Կապույտ թիմ'}]){
    const b=button((me?.team===t.id?'✓ ':'')+t.name,()=>action('/team',{team:t.id}));
    b.disabled=Boolean(latest.round);
    teams.append(b);
   }
   lobby.append(teams);
  }
  if(host&&!busy){
   const settings=latest.settings||{duration:60,rounds:3};
   lobby.append(button(latest.teamMode?'🔴🔵 Թիմային ռեժիմ՝ ON':'👤 Անհատական ռեժիմ՝ ON',()=>action('/team-mode',{enabled:!latest.teamMode})));
   const area=el('div',undefined,'p11-settings');
   const duration=el('select');duration.setAttribute('aria-label','Փուլի տևողություն');
   for(const n of [30,45,60,90]){const option=el('option',n+' վրկ.');option.value=n;if(n===settings.duration)option.selected=true;duration.append(option);}
   const rounds=el('select');rounds.setAttribute('aria-label','Փուլերի քանակ');
   for(const n of [1,2,3,4,5]){const option=el('option',n+' փուլ');option.value=n;if(n===settings.rounds)option.selected=true;rounds.append(option);}
   area.append(el('span','⚙️ Սենյակի կարգավորումներ'),duration,rounds,button('Պահպանել',()=>action('/settings',{duration:Number(duration.value),rounds:Number(rounds.value)})));
   lobby.append(area);
  }else{const settings=latest.settings||{duration:60,rounds:3};lobby.append(el('p','⚙️ '+settings.duration+' վրկ. · '+settings.rounds+' փուլ','p10-help'));}
  if(!playing&&latest.round?.status==='finished'&&latest.round.round>=(latest.settings?.rounds||3))lobby.append(el('p','🏁 Խաղն ավարտված է։ Host-ը կարող է սեղմել Rematch։'));
  controls.append(lobby);
 }
 function renderChat(board){
  const oldInput=$('p11-chat-input');const savedText=oldInput?.value||'';
  const wasFocused=document.activeElement===oldInput;
  const chat=el('section',undefined,'p11-chat');chat.append(el('h4','💬 Live Chat'));
  const messages=el('div',undefined,'p11-messages');messages.setAttribute('aria-live','polite');
  for(const m of (latest.chat||[]))messages.append(el('p',m.username+': '+m.message));
  if(!(latest.chat||[]).length)messages.append(el('p','Դեռ հաղորդագրություններ չկան։'));
  chat.append(messages);
  const form=el('form',undefined,'p11-chat-form');
  const input=el('input');input.id='p11-chat-input';input.maxLength=240;input.placeholder='Գրիր հաղորդագրություն…';input.value=savedText;input.setAttribute('aria-label','Live chat հաղորդագրություն');
  form.addEventListener('submit',async(e)=>{e.preventDefault();const value=input.value.trim();if(!value)return;const result=await action('/chat',{message:value});if(result)input.value='';});
  const send=el('button','Ուղարկել','p10-btn');send.type='submit';form.append(input,send);chat.append(form);board.append(chat);
  if(wasFocused){input.focus();input.setSelectionRange(input.value.length,input.value.length);}
 }
 function render(){
  if(!latest)return;
  const controls=$('p10-controls'),live=$('p10-live'),board=$('p10-board');
  if(!controls||!live||!board)return;
  const host=latest.myId===latest.hostId,game=latest.round,playing=game?.status==='playing',counting=game?.status==='countdown',busy=playing||counting;
  controls.replaceChildren();
  if(host&&!busy){
   const settings=latest.settings||{duration:60,rounds:3};
   controls.append(button('▶ Սկսել '+settings.duration+' վրկ. live փուլը',()=>action('/start')));
   controls.append(button('🔁 Rematch',()=>{if(confirm('Նոր խաղ սկսել և զրոյացնել այս սենյակի live միավորները՞'))action('/rematch');}));
  }
  if(!busy){
   const me=latest.members.find(p=>p.id===latest.myId);
   controls.append(button(me?.ready?'✅ Պատրաստ եմ':'☐ Պատրաստ եմ',()=>action('/ready',{ready:!me?.ready})));
  }
  renderLobby(controls,host,busy);

  if(host&&playing)controls.append(button('⏭ Բաց թողնել բառը (մինչև 3 անգամ)',()=>action('/skip')));
  live.replaceChildren();
  live.append(el('div',counting?'🚀 Պատրաստվիր մեկնարկին':playing?'🎮 Փուլ '+game.round:'🏠 Սենյակի սպասասրահ','p10-heading'));
  const clockElement=el('p','','p10-clock');clockElement.id='p10-clock';live.append(clockElement);
  if(counting){live.append(el('div','3','p12-countdown'),el('p','Մի քանի վայրկյանից կսկսենք…','p10-help'));}
  if(playing){
   if(host){live.append(el('p','Քո գաղտնի բառը՝','p10-help'),el('div',game.hostWord||'…','p10-word'),el('p','Բացատրիր բանավոր՝ առանց բառը արտասանելու։','p10-help'));}
   else{
    live.append(el('p','Լսիր հաղորդավարին և գրիր պատասխանդ։','p10-help'));
    const wrap=el('form',undefined,'p10-guess-form');wrap.addEventListener('submit',e=>{e.preventDefault();guess();});
    const input=el('input');input.id='p10-guess';input.placeholder='Քո գուշակությունը';input.maxLength=60;input.autocomplete='off';input.setAttribute('aria-label','Գուշակվող բառ');
    const submit=el('button','✓ Ուղարկել','p10-btn');submit.type='submit';wrap.append(input,submit);live.append(wrap);
   }
   if(game.lastCorrect)live.append(el('p','✅ '+game.lastCorrect,'p10-correct'));
  }else if(!counting)live.append(el('p',game?.status==='finished'?'⏱ Փուլն ավարտվեց։ Host-ը կարող է սկսել նորը։':'Սպասում ենք host-ին։ Մասնակցելու համար պետք է առնվազն 2 խաղացող։','p10-help'));
  board.replaceChildren(el('h4','🏆 Live միավորներ'));
  const list=el('ol');for(const p of latest.members){list.append(el('li',p.username+' — '+p.points+' միավոր'+(p.id===latest.hostId?' (Host)':'')+(p.ready?' · ✅':' · ⏳')));}board.append(list);
  if(latest.teamMode){
   const teams=el('section',undefined,'p12-scores');teams.append(el('h4','⚔️ Թիմերի միավորներ'));
   for(const t of latest.teamScores||[]){teams.append(el('p',(t.team==='red'?'🔴 Կարմիր':'🔵 Կապույտ')+' — '+t.points+' միավոր'));}
   board.append(teams);
  }
  if(game?.status==='finished'&&game.round>=(latest.settings?.rounds||3)){
   const results=el('section',undefined,'p12-results');results.append(el('h3','🏁 Խաղի արդյունքներ'));
   if(latest.teamMode){
    const scores=latest.teamScores||[];const red=scores.find(t=>t.team==='red')?.points||0,blue=scores.find(t=>t.team==='blue')?.points||0;
    results.append(el('h4',red===blue?'🤝 Ոչ-ոքի':red>blue?'🏆 Հաղթեց Կարմիր թիմը':'🏆 Հաղթեց Կապույտ թիմը'));
   }else{
    const top=[...latest.members].sort((a,b)=>b.points-a.points);
    const leaders=top.filter(p=>p.points===top[0]?.points);
    results.append(el('h4',leaders.length===1?'🏆 Հաղթող՝ '+leaders[0].username:'🤝 Ոչ-ոքի'));
   }
   const mvp=[...latest.members].sort((a,b)=>b.points-a.points)[0];
   if(mvp&&mvp.points>0)results.append(el('p','⭐ MVP՝ '+mvp.username+' · '+mvp.points+' միավոր'));
   results.append(el('p','Նոր խաղի համար Host-ը կարող է սեղմել Rematch։'));
   board.append(results);
  }
  renderChat(board);

  if(timer)clearInterval(timer);
  const countdown=()=>{const c=$('p10-clock');if(c){const remaining=playing?Math.max(0,Math.ceil((game.endsAt-Date.now())/1000)):0;
   const opening=counting?Math.max(1,Math.ceil((game.startsAt-Date.now())/1000)):0;
   const countEl=document.querySelector('.p12-countdown');if(countEl&&counting)countEl.textContent=opening;
   c.textContent=playing?'⏱ '+remaining+' վրկ.':'';if(playing&&remaining===0){c.textContent='⏱ Փուլն ավարտվում է…';}}};
  countdown();timer=setInterval(countdown,250);
 }
 document.addEventListener('DOMContentLoaded',layout);
 window.addEventListener('armkerp:online-session',refreshSession);
 window.addEventListener('beforeunload',disconnect);
})();
