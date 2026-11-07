/* Phase 7 — Daily Challenges. Local-only, per-account progress and XP claims. */
(function () {
  'use strict';

  const STORE_PREFIX = 'armkerp_daily_v1_';
  const CHALLENGES = [
    {id:'game', icon:'🎮', name:'Ավարտիր 1 խաղ', hint:'Ավարտված խաղեր', target:1, field:'games', xp:75},
    {id:'words', icon:'🧠', name:'Գուշակիր 10 բառ', hint:'Գուշակված բառեր', target:10, field:'words', xp:100},
    {id:'combo', icon:'🔥', name:'Հավաքիր x5 combo', hint:'Օրվա լավագույն combo', target:5, field:'bestCombo', xp:125}
  ];

  function dayKey(date) {
    const d=date || new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  function yesterdayKey() {
    const d=new Date();
    d.setHours(12,0,0,0); // midday avoids a DST boundary edge-case
    d.setDate(d.getDate()-1);
    return dayKey(d);
  }
  function asCount(value) {
    return Number.isFinite(Number(value)) ? Math.max(0,Math.floor(Number(value))) : 0;
  }
  function account() {
    if (typeof getCurrentUser!=='function') return null;
    const user=getCurrentUser();
    return user && !user.isGuest && (user.id!=null || user.username) ? user : null;
  }
  function key(user) { return STORE_PREFIX+String(user.id ?? user.username); }
  function fresh(user) {
    let raw={};
    try { raw=JSON.parse(localStorage.getItem(key(user))||'{}') || {}; } catch (_) { /* fresh defaults */ }
    const day=dayKey();
    const same=raw.day===day;
    return {
      day,
      words:same?asCount(raw.words):0,
      games:same?asCount(raw.games):0,
      bestCombo:same?asCount(raw.bestCombo):0,
      claimed:same && Array.isArray(raw.claimed) ? raw.claimed.filter(id=>CHALLENGES.some(c=>c.id===id)) : [],
      lastGameId:same ? (raw.lastGameId ?? null) : null,
      lastClaimDate:typeof raw.lastClaimDate==='string'?raw.lastClaimDate:null,
      streak:asCount(raw.streak)
    };
  }
  function save(user,state) {
    try { localStorage.setItem(key(user),JSON.stringify(state)); return true; }
    catch (err) { console.warn('Daily Challenges: cannot save progress',err); return false; }
  }
  function questProgress(state,quest) { return Math.min(quest.target,asCount(state[quest.field])); }
  function streakToday(state) {
    if (state.lastClaimDate===state.day || state.lastClaimDate===yesterdayKey()) return state.streak;
    return 0;
  }
  function make(tag,className,text) {
    const element=document.createElement(tag);
    if(className) element.className=className;
    if(text!==undefined) element.textContent=String(text);
    return element;
  }
  function renderInto(host,user,state) {
    host.replaceChildren();
    const compact=host.id==='phase7-profile';
    host.classList.toggle('p7-compact',compact);
    const header=make('div','p7-head');
    const titleWrap=make('div','p7-head-text');
    titleWrap.append(make('h3','p7-title','🎯 Ամենօրյա առաջադրանքներ'),make('p','p7-description','3 առաջադրանք · ընդհանուր 300 XP'));
    header.append(titleWrap);
    if(user) header.append(make('span','p7-streak',`🔥 ${streakToday(state)} օր streak`));
    host.append(header);
    if(!user) {
      host.append(make('p','p7-guest','🔐 Մուտք գործիր քո հաշվով, որպեսզի ստանաս օրական XP պարգևներ։ Guest-ի արդյունքները չեն պահպանվում։'));
      return;
    }
    const completed=CHALLENGES.filter(ch=>state.claimed.includes(ch.id)).length;
    const progress=make('div','p7-overview');
    progress.append(make('span','',`${completed}/3 պարգև ստացված`),make('span','',`${dayKey()} · տեղական ժամանակ`));
    host.append(progress);
    const items=make('div','p7-list');
    CHALLENGES.forEach(quest=>{
      const value=questProgress(state,quest);
      const done=value>=quest.target;
      const claimed=state.claimed.includes(quest.id);
      const item=make('div','p7-item'+(claimed?' p7-claimed':''));
      const info=make('div','p7-info');
      const name=make('strong','p7-name',quest.icon+' '+quest.name);
      const details=make('div','p7-detail');
      details.append(make('span','',`${quest.hint}՝ ${value}/${quest.target}`),make('span','p7-reward',`+${quest.xp} XP`));
      const track=make('div','p7-track');
      track.setAttribute('role','progressbar');
      track.setAttribute('aria-label',quest.name);
      track.setAttribute('aria-valuemin','0');
      track.setAttribute('aria-valuemax',String(quest.target));
      track.setAttribute('aria-valuenow',String(value));
      const fill=make('div','p7-fill');fill.style.width=`${Math.round(value/quest.target*100)}%`;track.append(fill);
      info.append(name,details,track);
      const action=make('button','p7-claim'+(done&&!claimed?' p7-ready':''),claimed?'✓ Ստացված':done?'Ստանալ':'Ընթացքում');
      action.type='button';action.disabled=claimed||!done;
      action.setAttribute('aria-label',claimed?`${quest.name}: պարգևն արդեն ստացված է`:`${quest.name}: ${done?'ստանալ '+quest.xp+' XP':'դեռ ընթացքի մեջ է'}`);
      action.addEventListener('click',()=>window.phase7Claim(quest.id));
      item.append(info,action);items.append(item);
    });
    host.append(items);
    host.append(make('p','p7-foot','Առաջադրանքները թարմացվում են ամեն օր՝ 00:00-ին (քո սարքի ժամով)։'));
  }

  window.phase7Render=function () {
    const user=account();
    const state=user?fresh(user):null;
    ['phase7-setup','phase7-winner','phase7-profile'].forEach(id=>{
      const host=document.getElementById(id);
      if(host) renderInto(host,user,state);
    });
  };

  window.phase7OnWordGuessed=function (currentCombo) {
    const user=account();if(!user)return;
    const state=fresh(user);
    state.words++;
    state.bestCombo=Math.max(state.bestCombo,asCount(currentCombo));
    save(user,state);
  };

  window.phase7OnGameFinished=function () {
    const user=account();if(!user){window.phase7Render();return;}
    const latest=Array.isArray(gameHistory)?gameHistory[0]:null;
    const state=fresh(user);
    if(latest && latest.id!=null && state.lastGameId!==latest.id) {
      state.games++;
      state.lastGameId=latest.id;
      save(user,state);
    }
    window.phase7Render();
  };

  window.phase7Claim=function (questId) {
    const user=account();if(!user)return;
    const challenge=CHALLENGES.find(ch=>ch.id===questId);if(!challenge)return;
    const state=fresh(user);
    if(state.claimed.includes(questId) || questProgress(state,challenge)<challenge.target) {window.phase7Render();return;}
    // Phase 6 records reward IDs together with XP, preventing double awards,
    // even if a browser closes before the separate daily UI state is saved.
    const grantId=`daily:${state.day}:${questId}`;
    if(typeof window.phase6ClaimReward!=='function' || !window.phase6ClaimReward(challenge.xp,grantId)) {
      window.alert('XP-ն չհաջողվեց պահպանել։ Ստուգիր բրաուզերի պահեստը և նորից փորձիր։');
      return;
    }
    if(state.lastClaimDate!==state.day) {
      state.streak=state.lastClaimDate===yesterdayKey()?state.streak+1:1;
      state.lastClaimDate=state.day;
    }
    state.claimed.push(questId);
    save(user,state);
    window.phase7Render();
    // Keep the existing profile XP display in sync with claimed rewards.
    if(typeof window.phase6RenderProfile==='function') window.phase6RenderProfile();
  };

  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden) window.phase7Render();
  });
  window.addEventListener('focus',()=>window.phase7Render());
})();
