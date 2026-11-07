/* Phase 17 Friends & Invitations; intentionally separate from game rendering. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id),KEY='armkerp_online_v1';
 let key='',tick=null,loading=false,last=null,notice='',refreshQueued=false;
 const h=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;};
 const btn=(text,handler)=>{const b=h('button',text,'p17-btn');b.type='button';b.addEventListener('click',handler);return b;};
 const session=()=>{try{const s=JSON.parse(sessionStorage.getItem(KEY)||'null');return s?.token&&s.origin===origin()?s:null;}catch{return null;}};
 const origin=()=>($('phase9-api-url')?.value||location.origin).trim().replace(/\/+$/,'');
 async function request(path,method='GET',body){
  const s=session();if(!s)throw Error('Նախ մուտք գործիր Online հաշիվ։');
  const res=await fetch(origin()+'/api/online/friends'+path,{method,headers:{Authorization:'Bearer '+s.token,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
  const data=await res.json().catch(()=>({message:'Սերվերի պատասխանը սխալ է։'}));
  if(!res.ok)throw Error(data.message||'Request failed');return data;
 }
 const error=e=>{notice='⚠️ '+e.message;render();};
 async function perform(path,body,onSuccess){try{const result=await request(path,'POST',body);if(onSuccess)onSuccess(result);notice='✅ Կատարված է';await refresh(true);}catch(e){error(e);}}
 function card(parent,title){const wrap=h('div',undefined,'p17-card');wrap.append(h('h4',title));parent.append(wrap);return wrap;}
 function render(){
  const target=$('phase17-setup');if(!target)return;
  // Preserve unsent username and cursor focus across background refreshes.
  const previousInput=$('p17-friend-username');
  const draft=previousInput?.value||'';
  const editing=document.activeElement===previousInput;
  const selection=editing?previousInput.selectionStart:null;
  target.replaceChildren(h('h3','👥 Ընկերներ և հրավերներ'));
  if(!session()){target.append(h('p','Մուտք գործիր Online հաշիվ՝ ընկերներ ավելացնելու համար։','p17-muted'));return;}
  const status=h('p',notice,'p17-status');status.setAttribute('role','status');target.append(status);
  const add=card(target,'➕ Ավելացնել ընկեր');
  const input=h('input',undefined,'p17-input');input.id='p17-friend-username';input.value=draft;input.placeholder='Ընկերոջ Online username';input.maxLength=24;input.setAttribute('aria-label','Username');
  add.append(input,btn('Ուղարկել հարցում',()=>{const username=input.value.trim();if(!username)return;perform('/request',{username},()=>{input.value='';});}));
  if(editing){input.focus({preventScroll:true});if(selection!==null)input.setSelectionRange(selection,selection);}
  if(!last){target.append(h('p','Բեռնում ենք ընկերների ցանկը…','p17-muted'));return;}
  const pending=card(target,'📩 Ընկերության հարցումներ');
  if(!last.incoming.length)pending.append(h('p','Նոր հարցումներ չկան։','p17-muted'));
  for(const r of last.incoming){const row=h('div',undefined,'p17-row');row.append(h('span',r.username));row.append(btn('✅ Ընդունել',()=>perform('/requests/'+r.id+'/respond',{decision:'accepted'})));row.append(btn('Մերժել',()=>perform('/requests/'+r.id+'/respond',{decision:'declined'})));pending.append(row);}
  for(const r of last.outgoing)pending.append(h('p','⏳ Ուղարկված է՝ '+r.username,'p17-muted'));
  const list=card(target,'🤝 Իմ ընկերները ('+last.friends.length+')');
  if(!last.friends.length)list.append(h('p','Դեռ ընկերներ չկան։','p17-muted'));
  for(const friend of last.friends){
   const row=h('div',undefined,'p17-row');row.append(h('strong',friend.username));
   const s=session();
   if(s?.room)row.append(btn('🎮 Հրավիրել սենյակ',()=>perform('/invite',{userId:friend.userId,code:s.room})));
   row.append(btn('Հեռացնել',()=>{if(confirm('Հեռացնե՞լ '+friend.username+'-ին ընկերներից։'))perform('/remove',{userId:friend.userId});}));list.append(row);
  }
  const invites=card(target,'🎟️ Սենյակի հրավերներ');
  if(!last.invitations.length)invites.append(h('p','Սենյակի նոր հրավեր չկա։','p17-muted'));
  for(const inv of last.invitations){const row=h('div',undefined,'p17-row');row.append(h('span',inv.sender+' → '+inv.code+(inv.private?' 🔒':'')));
   row.append(btn('🚪 Միանալ',()=>perform('/invites/'+inv.id+'/respond',{decision:'accepted'},r=>window.dispatchEvent(new CustomEvent('armkerp:friend-room-joined',{detail:{code:r.code}})))));
   row.append(btn('Մերժել',()=>perform('/invites/'+inv.id+'/respond',{decision:'declined'})));invites.append(row);
  }
  target.append(btn('🔄 Թարմացնել',()=>refresh(true)));
 }
 async function refresh(force=false){
  const s=session(),next=s?s.token+'|'+s.origin:'';
  if(next!==key){key=next;last=null;notice='';}
  if(!s){render();return;}
  if(loading){if(force)refreshQueued=true;return;}
  loading=true;
  try{last=await request('/state');if(session()?.token!==s.token)return;render();}
  catch(e){notice='⚠️ '+e.message;render();}
  finally{loading=false;if(refreshQueued){refreshQueued=false;refresh(true);}}
 }
 function start(){render();refresh();if(!tick)tick=setInterval(()=>{if(!document.hidden)refresh();},10000);}
 document.addEventListener('DOMContentLoaded',start);
 window.addEventListener('armkerp:online-session',()=>refresh(true));
 window.addEventListener('focus',()=>refresh());
 window.addEventListener('beforeunload',()=>{if(tick)clearInterval(tick);});
})();
