(()=>{'use strict';
const $=id=>document.getElementById(id);
const entry=(()=>{try{return JSON.parse(sessionStorage.getItem('armkerp_online_v1')||'null')}catch{return null}})();
const token=entry?.origin===location.origin?entry.token:null;
let offset=0;
function node(tag,text,cls){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;}
function status(message){$('status').textContent=message;}
async function api(path,method='GET',body){
 const response=await fetch('/api/admin'+path,{method,headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,cache:'no-store'});
 const data=await response.json().catch(()=>({message:'Invalid response'}));
 if(!response.ok)throw Error(data.message||'HTTP '+response.status);
 return data;
}
async function load(){
 if(!token){status('Online հաշվով մուտք գործիր հիմնական խաղում, ապա բացիր /admin.html։');return;}
 try{
  const [overview,people,audit]=await Promise.all([api('/overview'),api('/users?offset='+offset),api('/audit')]);
  $('panel').hidden=false;
  status('✅ Admin մուտքը հաստատված է');
  $('stats').replaceChildren();
  for(const [label,key] of [['Օգտատերեր','users'],['Սենյակներ','rooms'],['Կասեցված','suspended'],['Ընկերություններ','friendships']]){
   const tile=node('div',undefined,'tile');tile.append(node('span',label),node('strong',String(overview.stats[key])));$('stats').append(tile);
  }
  $('users').replaceChildren();
  for(const u of people.users){
   const row=node('div',undefined,'user');const info=node('div');info.append(node('strong',u.username),node('div','ID '+u.id+(u.admin?' · Admin':'')+(u.suspended?' · Կասեցված':''),'meta'));row.append(info);
   if(!u.admin){const b=node('button',u.suspended?'Վերականգնել':'Կասեցնել');b.addEventListener('click',async()=>{
    const reason=u.suspended?'':prompt('Կասեցման պատճառը (պարտադիր)');if(!u.suspended&&!reason?.trim())return;
    if(!confirm('Հաստատե՞լ այս փոփոխությունը '+u.username+' հաշվի համար։'))return;
    b.disabled=true;
    try{await api('/users/'+u.id+'/suspension','POST',{suspended:!u.suspended,reason});await load()}catch(e){status('⚠️ '+e.message);b.disabled=false}
   });row.append(b);}
   $('users').append(row);
  }
  $('prev').disabled=offset===0;$('next').disabled=people.users.length<people.limit;
  $('audit').replaceChildren();
  for(const e of audit.events)$('audit').append(node('div',new Date(e.createdAt).toLocaleString()+' · '+e.actor+' · '+e.action+' · user #'+e.targetId,'event'));
 }catch(e){$('panel').hidden=true;status('⚠️ '+e.message+' — Admin իրավունքդ կամ Online մուտքդ ստուգիր։');}
}
$('prev').addEventListener('click',()=>{offset=Math.max(0,offset-50);load()});$('next').addEventListener('click',()=>{offset+=50;load()});$('refresh').addEventListener('click',load);load();
})();