/* Phase 13 — opt-in, room-wide WebRTC audio via existing authenticated SSE.
   Microphone is never accessed until the user clicks the join button. */
(()=>{
 'use strict';
 const KEY='armkerp_online_v1';
 const $=id=>document.getElementById(id);
 let room='',token='',myId=null,local=null,enabled=false,muted=false,heartbeat=null;
 const peers=new Map(), seen=new Set(),pending=new Map();
 // Playback preferences stay on this device only, not on the server.
 const volumes=new Map(), remoteStreams=new Map(), meters=new Map();
 let audioContext=null, meterInterval=null, participantNames=new Map();
 const reconnectTimers=new Map(), reconnectAttempts=new Map();
 let qualityTimer=null;
 const retryMax=5;
 const qualityLabels=new Map();
 function qualityText(id){return qualityLabels.get(id)||'Չափվում է…';}
 function cancelReconnect(id){const timer=reconnectTimers.get(id);if(timer)clearTimeout(timer);reconnectTimers.delete(id);}
 function scheduleReconnect(id,immediate=false){
  if(!enabled||!room||id===myId||!Number.isSafeInteger(id))return;
  // The peer with the lower ID initiates the offer. The other peer waits for it.
  if(myId>id){status('🟠 Ձայնային կապը կորել է․ սպասում ենք վերամիացմանը։');return;}
  if(reconnectTimers.has(id))return;
  const attempt=(reconnectAttempts.get(id)||0)+1;
  if(attempt>retryMax){status('🔴 '+(participantNames.get(id)||'Խաղացող')+'-ի կապը չի վերականգնվում։ Փորձիր «Վերամիացնել»։');return;}
  reconnectAttempts.set(id,attempt);
  const wait=immediate?200:Math.min(12000,1000*Math.pow(2,attempt-1));
  status('🟠 Ձայնային կապը վերականգնվում է ('+attempt+'/'+retryMax+')…');
  reconnectTimers.set(id,setTimeout(()=>{
   reconnectTimers.delete(id);
   if(!enabled||!room||!voicePresent.has(id))return;
   stopPeer(id);startOffer(id);
  },wait));
 }
 const voicePresent=new Set();
 async function updateQuality(){
  if(!enabled)return;
  for(const [id,pc] of peers){
   let label=pc.connectionState==='connected'?'🟢 Միացված է':pc.connectionState==='failed'?'🔴 Կորել է':'🟠 '+(pc.connectionState||'Միանում է');
   if(pc.connectionState==='connected'){
    try{
     const stats=await pc.getStats();let rtt=null,loss=null;
     stats.forEach(report=>{
      if(report.type==='candidate-pair'&&report.state==='succeeded'&&report.nominated&&Number.isFinite(report.currentRoundTripTime))rtt=Math.round(report.currentRoundTripTime*1000);
      if(report.type==='inbound-rtp'&&report.kind==='audio'&&Number.isFinite(report.packetsLost)&&Number.isFinite(report.packetsReceived)){
       const total=report.packetsLost+report.packetsReceived;if(total>0)loss=Math.max(0,Math.round(report.packetsLost/total*100));
      }
     });
     label='🟢 Միացված է'+(rtt!==null?' · '+rtt+' ms RTT':'')+(loss!==null?' · կորուստ '+loss+'%':'');
    }catch(e){console.warn('[Phase15] Voice stats:',e.message);}
   }
   qualityLabels.set(id,label);
   const row=[...($('p14-participants')?.querySelectorAll('[data-voice-id]')||[])].find(x=>x.dataset.voiceId===String(id));
   const field=row?.querySelector('.p15-quality');if(field)field.textContent=label;
  }
 }
 function retryVoice(){
  if(!enabled)return;
  for(const id of voicePresent){
   if(id===myId)continue;
   reconnectAttempts.delete(id);cancelReconnect(id);
   if(myId<id){stopPeer(id);startOffer(id);}
  }
  status('🔄 Փորձում ենք վերամիացնել ձայնային կապը…');
 }

 function safeVolume(id){return volumes.has(id)?volumes.get(id):1;}
 function ensureAudioContext(){
  if(!audioContext){const Ctx=window.AudioContext||window.webkitAudioContext;if(Ctx)audioContext=new Ctx();}
  if(audioContext?.state==='suspended')audioContext.resume().catch(()=>{});
 }
 function addMeter(id,stream){
  removeMeter(id);
  if(!audioContext||!stream?.getAudioTracks().length)return;
  try{const source=audioContext.createMediaStreamSource(stream),analyser=audioContext.createAnalyser();
   analyser.fftSize=512;analyser.smoothingTimeConstant=.75;source.connect(analyser);
   meters.set(id,{source,analyser,buffer:new Uint8Array(analyser.fftSize)});
  }catch(e){console.warn('[Phase14] Voice meter:',e.message);}
 }
 function removeMeter(id){const m=meters.get(id);if(m){try{m.source.disconnect();m.analyser.disconnect();}catch{}meters.delete(id);}}
 function speaking(id){
  if(id==='self'&&muted)return false;
  const m=meters.get(id);if(!m)return false;
  m.analyser.getByteTimeDomainData(m.buffer);
  let sum=0;for(const x of m.buffer){const sample=(x-128)/128;sum+=sample*sample;}
  return Math.sqrt(sum/m.buffer.length)>.035;
 }
 function updateMeters(){
  const grid=$('p14-participants');if(!grid)return;
  for(const row of grid.querySelectorAll('[data-voice-id]')){
   const raw=row.dataset.voiceId,id=raw==='self'?'self':Number(raw);
   const active=speaking(id);
   row.classList.toggle('p14-speaking',active);
   const indicator=row.querySelector('.p14-speaking-label');
   if(indicator)indicator.textContent=active?'🟢 Խոսում է':id==='self'&&muted?'🔇 Անջատված է':'⚪ Լուռ է';
  }
 }
 function renderParticipants(){
  const grid=$('p14-participants');if(!grid)return;
  // Keep existing sliders mounted while SSE state updates to avoid interrupting dragging.
  const ids=enabled?['self',...remoteStreams.keys()]:[];
  for(const row of [...grid.querySelectorAll('[data-voice-id]')]){
   const key=row.dataset.voiceId;
   if(!ids.some(id=>String(id)===key))row.remove();
  }
  for(const id of ids){
   const key=String(id);let row=[...grid.querySelectorAll('[data-voice-id]')].find(e=>e.dataset.voiceId===key);
   if(!row){
    row=document.createElement('div');row.className='p14-participant';row.dataset.voiceId=key;
    const avatar=document.createElement('span');avatar.className='p14-avatar';avatar.textContent=id==='self'?'🎙️':'🎧';
    const details=document.createElement('div');details.className='p14-details';
    const name=document.createElement('strong');name.className='p14-name';
    const indicator=document.createElement('span');indicator.className='p14-speaking-label';indicator.textContent='⚪ Լուռ է';
    details.append(name,indicator);if(id!=='self'){const quality=document.createElement('span');quality.className='p15-quality';quality.textContent=qualityText(id);details.append(quality);}row.append(avatar,details);
    if(id!=='self'){
     const label=document.createElement('label');label.className='p14-volume-label';
     const caption=document.createElement('span');caption.textContent='🔊 Ձայն';
     const slider=document.createElement('input');slider.type='range';slider.min='0';slider.max='100';slider.step='5';slider.value=String(Math.round(safeVolume(id)*100));
     slider.setAttribute('aria-label','Խաղացողի ձայնի ուժգնություն');
     const level=document.createElement('output');level.textContent=slider.value+'%';
     slider.addEventListener('input',()=>{const value=Number(slider.value)/100;volumes.set(id,value);const audio=$('p13-audio-'+id);if(audio)audio.volume=value;level.textContent=Math.round(value*100)+'%';});
     label.append(caption,slider,level);row.append(label);
    }
    grid.append(row);
   }
   const name=row.querySelector('.p14-name');if(name)name.textContent=id==='self'?'Դու':participantNames.get(id)||'Player '+id;
  }
  updateMeters();
 }

 const rtcConfig={iceServers:[{urls:'stun:stun.l.google.com:19302'}]};
 const btn=(label,fn)=>{const b=document.createElement('button');b.type='button';b.className='p10-btn';b.textContent=label;b.addEventListener('click',fn);return b;};
 function status(t){const e=$('p13-status');if(e)e.textContent=t;}
 function authSession(){try{const s=JSON.parse(sessionStorage.getItem(KEY)||'null');return s?.room&&s?.token&&s.origin===(($('phase9-api-url')?.value||location.origin).trim().replace(/\/+$/,''))?s:null;}catch{return null;}}
 function api(){return (($('phase9-api-url')?.value||location.origin).trim().replace(/\/+$/,''))+'/api/online/live/rooms/'+encodeURIComponent(room)+'/voice';}
 async function send(path,body){if(!room||!token)throw Error('Online session չկա');const r=await fetch(api()+path,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok){const d=await r.json().catch(()=>({}));throw Error(d.message||'HTTP '+r.status);}return r.json();}
 function stopPeer(id){cancelReconnect(id);qualityLabels.delete(id);const p=peers.get(id);if(p){try{p.close();}catch{}peers.delete(id);}pending.delete(id);removeMeter(id);remoteStreams.delete(id);const a=$('p13-audio-'+id);if(a){a.srcObject=null;a.remove();}renderParticipants();}
 function cleanup(){enabled=false;muted=false;if(heartbeat)clearInterval(heartbeat);heartbeat=null;if(qualityTimer)clearInterval(qualityTimer);qualityTimer=null;for(const id of reconnectTimers.keys())cancelReconnect(id);reconnectAttempts.clear();voicePresent.clear();qualityLabels.clear();
  if(meterInterval)clearInterval(meterInterval);meterInterval=null;
  for(const id of [...peers.keys()])stopPeer(id);
  for(const id of [...remoteStreams.keys()])stopPeer(id);
  removeMeter('self');for(const t of local?.getTracks()||[])t.stop();local=null;
  seen.clear();pending.clear();update();renderParticipants();}
 async function leave(){if(!enabled)return;const oldRoom=room,oldToken=token;cleanup();try{if(room===oldRoom&&token===oldToken)await send('/presence',{enabled:false});}catch{}status('🎤 Ձայնային կապն անջատված է։');}
 function update(){const join=$('p13-join'),mute=$('p13-mute');if(join)join.textContent=enabled?'🔴 Դուրս գալ Voice Chat-ից':'🎤 Միանալ Voice Chat-ին';const retry=$('p15-retry');if(retry)retry.hidden=!enabled;if(mute){mute.hidden=!enabled;mute.textContent=muted?'🔇 Միացնել միկրոֆոնը':'🎙️ Անջատել միկրոֆոնը';}}
 function view(){const host=$('phase10-setup');if(!host)return;
  let panel=$('p13-voice');if(panel)return;
  panel=document.createElement('section');panel.id='p13-voice';panel.className='p13-panel';
  const title=document.createElement('h4');title.textContent='🎧 Voice Chat (Beta)';
  const help=document.createElement('p');help.className='p10-help';help.textContent='Սենյակի բոլոր մասնակիցները կարող են խոսել։ Միկրոֆոնը միանում է միայն քո թույլտվությամբ։';
  const controls=document.createElement('div');controls.className='p13-actions';
  const join=btn('🎤 Միանալ Voice Chat-ին',()=>enabled?leave():joinVoice());join.id='p13-join';
  const mute=btn('🎙️ Անջատել միկրոֆոնը',()=>{muted=!muted;for(const track of local?.getAudioTracks()||[])track.enabled=!muted;update();});mute.id='p13-mute';mute.hidden=true;
  const retry=btn('🔄 Վերամիացնել ձայնը',retryVoice);retry.id='p15-retry';controls.append(join,mute,retry);
  const state=document.createElement('p');state.id='p13-status';state.className='p10-help';state.setAttribute('role','status');state.textContent='Voice Chat-ը անջատված է։';
  const people=document.createElement('p');people.id='p13-people';people.className='p10-help';
  const participantTitle=document.createElement('h5');participantTitle.textContent='🎙️ Ձայնային մասնակիցներ';participantTitle.className='p14-title';
  const participants=document.createElement('div');participants.id='p14-participants';participants.className='p14-grid';
  const hint=document.createElement('p');hint.className='p10-help';hint.textContent='Ձայնի որակը հաշվարկվում է WebRTC-ից։ RTT-ն ցանցային ուշացումն է (միլիվայրկյան), կորուստը՝ փաթեթների տոկոսը։';
  const sounds=document.createElement('div');sounds.id='p13-sounds';
  panel.append(title,help,controls,state,people,participantTitle,participants,hint,sounds);host.append(panel);update();renderParticipants();
 }
 async function signal(to,type,payload){try{await send('/signal',{to,type,payload});}catch(e){console.warn('[Phase13] signaling:',e.message);status('⚠️ Կապի սխալ․ '+e.message);}}
 function peer(id){if(peers.has(id))return peers.get(id);
  const pc=new RTCPeerConnection(rtcConfig);peers.set(id,pc);
  for(const track of local.getTracks())pc.addTrack(track,local);
  pc.onicecandidate=e=>{if(e.candidate)signal(id,'candidate',e.candidate.toJSON());};
  pc.ontrack=e=>{const stream=e.streams[0]||new MediaStream([e.track]);remoteStreams.set(id,stream);
   let a=$('p13-audio-'+id);if(!a){a=document.createElement('audio');a.id='p13-audio-'+id;a.autoplay=true;a.controls=true;a.setAttribute('aria-label','Խաղացող '+id+'-ի ձայնը');$('p13-sounds')?.append(a);}
   a.srcObject=stream;a.volume=safeVolume(id);addMeter(id,stream);renderParticipants();
   a.play().catch(()=>status('🔊 Եթե ձայն չես լսում, սեղմիր ներքևի audio player-ի Play կոճակը։'));};
  pc.onconnectionstatechange=()=>{
   if(!enabled||peers.get(id)!==pc)return;
   if(pc.connectionState==='connected'){
    cancelReconnect(id);reconnectAttempts.delete(id);status('🟢 Ձայնային կապը վերականգնված է։');
   }else if(pc.connectionState==='failed'||pc.connectionState==='disconnected')scheduleReconnect(id);
   updateQuality();
  };
  return pc;
 }
 async function flush(id){const pc=peers.get(id);if(!pc?.remoteDescription)return;const q=pending.get(id)||[];pending.delete(id);for(const candidate of q){try{await pc.addIceCandidate(candidate);}catch(e){console.warn('[Phase13] ICE:',e);}}}
 async function startOffer(id){if(!enabled||peers.has(id))return;const pc=peer(id);try{await pc.setLocalDescription(await pc.createOffer());await signal(id,'offer',pc.localDescription.toJSON());}catch(e){stopPeer(id);status('⚠️ Voice offer սխալ․ '+e.message);}}
 async function receive(s){if(!enabled||s.from===myId)return;try{
  if(s.type==='offer'){
   // Both peers should never initiate; restart if an earlier connection exists.
   stopPeer(s.from);const pc=peer(s.from);
   await pc.setRemoteDescription(s.payload);await flush(s.from);
   await pc.setLocalDescription(await pc.createAnswer());await signal(s.from,'answer',pc.localDescription.toJSON());
  }else if(s.type==='answer'){
   const pc=peers.get(s.from);if(!pc||pc.signalingState!=='have-local-offer')return;
   await pc.setRemoteDescription(s.payload);await flush(s.from);
  }else if(s.type==='candidate'){
   const pc=peers.get(s.from);
   if(pc?.remoteDescription)await pc.addIceCandidate(s.payload);
   else{const q=pending.get(s.from)||[];q.push(s.payload);if(q.length>40)q.shift();pending.set(s.from,q);}
  }
 }catch(e){console.warn('[Phase13] receive:',e);status('⚠️ Voice կապի մշակման սխալ․ '+e.message);}}
 let lastRoomKey='';
 function state(data){view();const s=authSession(),key=s?s.origin+'|'+s.room+'|'+s.token:'';
  if(key!==lastRoomKey){if(enabled){const oldRoom=room,oldToken=token;cleanup();if(oldRoom&&oldToken){const base=(s?.origin||location.origin).replace(/\/+$/,'');fetch(base+'/api/online/live/rooms/'+encodeURIComponent(oldRoom)+'/voice/presence',{method:'POST',headers:{Authorization:'Bearer '+oldToken,'Content-Type':'application/json'},body:JSON.stringify({enabled:false})}).catch(()=>{});}}lastRoomKey=key;room=s?.room||'';token=s?.token||'';myId=null;}
  if(!s||data.code!==room)return;
  myId=data.myId;
  const voice=(data.voiceUsers||[]).filter(x=>Number.isSafeInteger(x));
  const names=new Map((data.members||[]).map(m=>[m.id,m.username]));participantNames=names;renderParticipants();
  const people=$('p13-people');if(people)people.textContent='🎧 Ձայնային կապով՝ '+(voice.length?voice.map(id=>names.get(id)||'Player '+id).join(', '):'դեռ ոչ ոք');
  if(!enabled)return;
  voicePresent.clear();for(const id of voice)voicePresent.add(id);for(const id of [...peers.keys()])if(!voice.includes(id)){stopPeer(id);reconnectAttempts.delete(id);}
  for(const x of data.voiceSignals||[]){if(!Number.isSafeInteger(x.id)||seen.has(x.id))continue;seen.add(x.id);if(seen.size>400)seen.clear();receive(x);}
  for(const id of voice)if(id!==myId&&myId<id&&!peers.has(id)&&!reconnectTimers.has(id))startOffer(id);
 }
 async function joinVoice(){if(enabled)return;if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia){status('⚠️ Միկրոֆոնի համար պետք է HTTPS կամ localhost։');return;}
  const s=authSession();if(!s||!room){status('Նախ միացիր Online սենյակին։');return;}
  try{local=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});
   enabled=true;muted=false;ensureAudioContext();addMeter('self',local);
   if(meterInterval)clearInterval(meterInterval);meterInterval=setInterval(updateMeters,160);if(qualityTimer)clearInterval(qualityTimer);qualityTimer=setInterval(updateQuality,2500);
   update();renderParticipants();await send('/presence',{enabled:true});
   heartbeat=setInterval(()=>{if(enabled)send('/presence',{enabled:true}).catch(e=>status('⚠️ Voice կապը կորել է․ '+e.message));},15000);
   status('🟢 Միկրոֆոնը միացված է։ Ականջակալներ օգտագործիր արձագանքը կանխելու համար։');
  }catch(e){cleanup();status(e.name==='NotAllowedError'?'⚠️ Chrome-ում թույլատրիր միկրոֆոնի օգտագործումը։':'⚠️ '+e.message);}
 }
 window.addEventListener('armkerp:live-state',e=>state(e.detail));
 window.addEventListener('armkerp:online-session',()=>{const s=authSession(),key=s?s.origin+'|'+s.room+'|'+s.token:'';if(key!==lastRoomKey){cleanup();lastRoomKey=key;room=s?.room||'';token=s?.token||'';}view();});
 document.addEventListener('DOMContentLoaded',view);
 window.addEventListener('pagehide',()=>{if(enabled){fetch(api()+'/presence',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({enabled:false}),keepalive:true}).catch(()=>{});cleanup();}});
})();
