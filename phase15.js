/* Phase 15 — server stream connection status; no artificial latency claims. */
(()=>{
 'use strict';
 let status='offline';
 const labels={offline:'⚪ Online սենյակին միացած չէ',connecting:'🟠 Սերվերին միանում ենք…',connected:'🟢 Live սերվերը միացված է',reconnecting:'🟠 Կապը կորել է․ ինքնաբերաբար վերամիանում ենք…'};
 function render(){
  const host=document.getElementById('phase10-setup');if(!host)return;
  let el=document.getElementById('p15-connection');
  if(!el){el=document.createElement('p');el.id='p15-connection';el.className='p15-connection';el.setAttribute('role','status');host.prepend(el);}
  el.textContent=labels[status]||labels.offline;
 }
 window.addEventListener('armkerp:transport',e=>{status=e.detail?.status||'offline';render();});
 window.addEventListener('armkerp:online-session',()=>{status='connecting';render();});
 document.addEventListener('DOMContentLoaded',render);
})();
