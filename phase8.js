/* Phase 8: privacy-friendly, offline social score challenges.
   Share codes are user-editable game claims, not verified online results. */
(() => {
  'use strict';
  const VERSION = 1, PREFIX = 'AK8-', MAX_CODE = 2000;
  const $ = id => document.getElementById(id);
  const node = (tag, className, value) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined) el.textContent = String(value);
    return el;
  };
  const number = value => Number.isSafeInteger(value) && value >= 0 && value <= 100000 ? value : null;
  const limitName = value => typeof value === 'string' && value.trim().length >= 1 && value.trim().length <= 40 ? value.trim() : null;
  const currentName = () => {
    try {
      const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
      return limitName(user?.username) || 'Հյուր';
    } catch (_) { return 'Հյուր'; }
  };
  let lastResult = null;
  let rival = null;
  function capture() {
    if (!Array.isArray(window.teams) && typeof teams === 'undefined') return null;
    const t = typeof teams !== 'undefined' ? teams : window.teams;
    const s = typeof scores !== 'undefined' ? scores : window.scores;
    if (!Array.isArray(t) || !Array.isArray(s) || !t.length || t.length !== s.length || t.length > 16) return null;
    const entries = t.map((team,i) => ({name:limitName(team.name), score:number(s[i])}));
    if (entries.some(x => x.name === null || x.score === null)) return null;
    const highest = Math.max(...entries.map(x=>x.score));
    return {v:VERSION, player:currentName(), teams:entries, points:highest, date:new Date().toISOString().slice(0,10)};
  }
  function encode(data) {
    const bytes = new TextEncoder().encode(JSON.stringify(data));
    let binary=''; bytes.forEach(b=>binary+=String.fromCharCode(b));
    return PREFIX + btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  function decode(raw) {
    let value = String(raw||'').trim();
    // Accept both the standalone code and our optional shareable URL fragment.
    if (value.includes('#challenge=')) value = value.split('#challenge=').pop().split('&')[0];
    try { value=decodeURIComponent(value); } catch (_) { /* not URL encoded */ }
    if (!value.startsWith(PREFIX) || value.length > MAX_CODE) throw Error('Սա Arm Kերպ-ի վավեր challenge code չէ։');
    const part=value.slice(PREFIX.length);
    if (!/^[A-Za-z0-9_-]+$/.test(part)) throw Error('Code-ի ձևաչափը սխալ է։');
    const binary=atob(part.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-part.length%4)%4));
    const data=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(binary,c=>c.charCodeAt(0))));
    if (data.v!==VERSION || !limitName(data.player) || !/^\d{4}-\d{2}-\d{2}$/.test(data.date) ||
        !Array.isArray(data.teams) || !data.teams.length || data.teams.length>16 ||
        data.teams.some(t=>!t || !limitName(t.name) || number(t.score)===null) ||
        number(data.points)===null || data.points !== Math.max(...data.teams.map(t=>t.score))) {
      throw Error('Code-ի տվյալները սխալ են կամ վնասված։');
    }
    return {v:VERSION, player:data.player, date:data.date,
      teams:data.teams.map(t=>({name:t.name,score:t.score})), points:data.points};
  }
  function status(host, message, bad=false) {
    if (!host) return;
    const target=host.querySelector('.p8-status');
    if (target) {target.textContent=message; target.classList.toggle('p8-error',bad);}
  }
  function comparison(host) {
    const area=host.querySelector('.p8-comparison'); if(!area)return;
    area.replaceChildren();
    if (!rival) return;
    area.append(node('h4','p8-subhead','🏁 Ընկերոջ արդյունքը'));
    area.append(node('p','p8-note',`${rival.player} · ${rival.date} · լավագույն թիմ՝ ${rival.points} միավոր`));
    const list=node('ol','p8-teams');
    rival.teams.slice().sort((a,b)=>b.score-a.score).forEach(t=>list.append(node('li','',`${t.name} — ${t.score} միավոր`)));
    area.append(list);
    const mine=lastResult;
    if(mine) {
      const verdict=mine.points>rival.points?'🎉 Դու առաջ ես':mine.points<rival.points?'🎯 Ընկերդ առաջ է':'🤝 Հավասար արդյունք';
      area.append(node('strong','p8-verdict',`${verdict} (${mine.points} : ${rival.points})`));
    } else area.append(node('p','p8-note','Ավարտիր խաղ, որպեսզի համեմատես քո արդյունքը։'));
    area.append(node('p','p8-disclaimer','⚠️ Share code-երը ստուգված արդյունքներ չեն. ցանկացած մարդ կարող է դրանք փոփոխել։'));
  }
  async function share(host) {
    if(!lastResult) {status(host,'Սկզբում ավարտիր խաղը։',true);return;}
    const code=encode(lastResult);
    const url = location.protocol==='https:' ? location.origin+location.pathname+'#challenge='+encodeURIComponent(code) : '';
    const message=`🎮 Arm Kերպ challenge — ${lastResult.player}: ${lastResult.points} միավոր!\n${url || code}`;
    try {
      if (navigator.share) { await navigator.share({title:'Arm Kերպ Challenge',text:message}); status(host,'Կիսվելու պատուհանը բացվեց։'); return; }
      if(navigator.clipboard?.writeText) {await navigator.clipboard.writeText(message);status(host,'Արդյունքը պատճենվեց։ Ուղարկիր ընկերոջդ։');return;}
    } catch (error) { if(error?.name==='AbortError')return; }
    const output=host.querySelector('.p8-code');
    output.value=url||code;output.hidden=false;output.focus();output.select();
    status(host,'Պատճենիր կոդը ներքևի դաշտից։');
  }
  function panel(host, winner=false) {
    host.replaceChildren();
    host.append(node('h3','p8-title','🤝 Ընկերների Challenge'));
    host.append(node('p','p8-note',winner?'Կիսվիր արդյունքով և համեմատիր ընկերներիդ հետ։':'Ներմուծիր ընկերոջ ուղարկած challenge code-ը։'));
    if(winner) {
      const btn=node('button','p8-btn','📤 Կիսվել իմ արդյունքով');btn.type='button';btn.addEventListener('click',()=>share(host));host.append(btn);
      const output=node('textarea','p8-code');output.readOnly=true;output.hidden=true;output.setAttribute('aria-label','Պատճենվող challenge code');host.append(output);
    }
    const field=node('textarea','p8-input');field.placeholder='Տեղադրիր challenge code կամ link…';field.rows=2;field.maxLength=MAX_CODE+300;field.setAttribute('aria-label','Ընկերոջ challenge code');
    const btn=node('button','p8-btn p8-secondary','⚔️ Համեմատել');btn.type='button';
    btn.addEventListener('click',()=>{
      try {rival=decode(field.value);status(host,'Ընկերոջ արդյունքը բեռնված է։');refresh();}
      catch(error){status(host,error.message||'Չհաջողվեց ներմուծել կոդը։',true);}
    });
    host.append(field,btn,node('p','p8-status',''),node('div','p8-comparison'));
    comparison(host);
  }
  function refresh(){['phase8-setup','phase8-winner'].forEach(id=>{const host=$(id);if(host)comparison(host);});}
  window.phase8OnGameFinished=()=>{
    lastResult=capture();
    try {if(lastResult) localStorage.setItem('armkerp_phase8_last_result',JSON.stringify(lastResult));} catch (_) {}
    const winner=$('phase8-winner');if(winner)panel(winner,true);
    refresh();
  };
  document.addEventListener('DOMContentLoaded',()=>{
    try {
      const saved=JSON.parse(localStorage.getItem('armkerp_phase8_last_result')||'null');
      if(saved)lastResult=decode(encode(saved));
    } catch(_){lastResult=null;}
    const setup=$('phase8-setup'); if(setup)panel(setup,false);
    const winner=$('phase8-winner'); if(winner)panel(winner,true);
    if (location.hash.startsWith('#challenge=')) {
      try {rival=decode(location.hash);refresh();status(setup||winner,'Ընկերոջ challenge-ը բեռնված է։');}
      catch (_) {status(setup||winner,'Հղման challenge code-ը անվավեր է։',true);}
      history.replaceState(null,'',location.pathname+location.search);
    }
  });
})();
