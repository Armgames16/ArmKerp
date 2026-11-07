/* Phase 6: persistent, per-account XP, levels and achievements. */
(function () {
  'use strict';
  const achievements = [
    ['first','🎮 Առաջին խաղ',s=>s.games>=1],
    ['five','🏅 5 խաղ',s=>s.games>=5],
    ['ten','🏆 10 խաղ',s=>s.games>=10],
    ['hundred','🎯 100 միավոր',s=>s.points>=100],
    ['combo','🔥 Combo Master',s=>s.bestCombo>=5],
    ['legend','🚀 Combo Legend',s=>s.bestCombo>=10]
  ];
  const number = value => Math.max(0, Number(value)||0);
  const level = xp => Math.floor(Math.sqrt(number(xp)/100))+1;
  const threshold = lvl => 100*(lvl-1)*(lvl-1);
  function key(user) { return 'armkerp_progress_v1_' + String(user.id ?? user.username); }
  function read(user) {
    try {
      const raw=JSON.parse(localStorage.getItem(key(user))||'{}');
      return {xp:number(raw.xp),games:number(raw.games),points:number(raw.points),bestCombo:number(raw.bestCombo),lastGameId:raw.lastGameId||null,rewardIds:Array.isArray(raw.rewardIds)?raw.rewardIds.filter(id=>typeof id==='string'):[]};
    } catch (_) { return {xp:0,games:0,points:0,bestCombo:0,lastGameId:null,rewardIds:[]}; }
  }
  function account() {
    if (typeof getCurrentUser!=='function') return null;
    const user=getCurrentUser();
    return user && !user.isGuest && (user.id!=null || user.username) ? user : null;
  }
  function add(tag,cls,value) {
    const node=document.createElement(tag);node.className=cls;
    if (value!==undefined) node.textContent=String(value);
    return node;
  }
  window.phase6AwardProgress=function () {
    const user=account(); if (!user || !Array.isArray(scores)) return;
    const state=read(user);
    const latest=Array.isArray(gameHistory) ? gameHistory[0] : null;
    if (!latest || latest.id===state.lastGameId) return;
    const points=scores.reduce((sum,value)=>sum+number(value),0);
    const combo=Math.max(0,...(Array.isArray(teamBestCombos)?teamBestCombos.map(number):[0]));
    state.games+=1;state.points+=points;state.bestCombo=Math.max(state.bestCombo,combo);
    state.xp+=50+points*10+Math.min(combo,10)*5;
    state.lastGameId=latest.id;
    try {localStorage.setItem(key(user),JSON.stringify(state));} catch (_) {return;}
    window.phase6RenderProfile();
  };
  // Idempotent XP rewards for daily challenges. Each claim ID is recorded with XP.
  window.phase6ClaimReward=function (amount,rewardId) {
    const user=account();
    if(!user || !Number.isInteger(amount) || amount<=0 || amount>10000 ||
       typeof rewardId!=='string' || !/^daily:\d{4}-\d{2}-\d{2}:(game|words|combo)$/.test(rewardId)) return false;
    const state=read(user);
    if(state.rewardIds.includes(rewardId)) return true;
    state.rewardIds.push(rewardId);
    state.xp+=amount;
    try { localStorage.setItem(key(user),JSON.stringify(state)); }
    catch (_) { return false; }
    window.phase6RenderProfile();
    return true;
  };
  window.phase6RenderProfile=function () {
    const host=document.getElementById('phase6-profile'); if(!host)return;
    host.replaceChildren();
    const user=account();
    if (!user) {host.append(add('p','p6-note','🔐 XP-ն և նվաճումները պահպանելու համար մուտք գործիր հաշիվ։'));return;}
    const s=read(user),lvl=level(s.xp),start=threshold(lvl),end=threshold(lvl+1);
    host.append(add('h3','p6-heading',`⭐ Մակարդակ ${lvl} · ${s.xp} XP`));
    const track=add('div','p6-track');track.setAttribute('role','progressbar');track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');
    const percent=Math.min(100,Math.max(0,Math.round((s.xp-start)/(end-start)*100)));
    track.setAttribute('aria-valuenow',String(percent));track.setAttribute('aria-label','Հաջորդ մակարդակի առաջընթաց');
    const fill=add('div','p6-fill');fill.style.width=percent+'%';track.append(fill);host.append(track);
    host.append(add('p','p6-note',`${end-s.xp} XP մինչև հաջորդ մակարդակ`));
    const stats=add('div','p6-stats');
    [['🎮 Խաղեր',s.games],['🎯 Միավորներ',s.points],['🔥 Լավագույն combo','x'+s.bestCombo]].forEach(([name,val])=>{
      const cell=add('div','p6-stat');cell.append(add('span','',name),add('strong','',val));stats.append(cell);
    });host.append(stats);
    host.append(add('h3','p6-heading','🏅 Մշտական նվաճումներ'));
    const badges=add('div','p6-badges');
    achievements.forEach(([,name,condition])=>{
      const unlocked=condition(s),badge=add('span','p6-badge'+(unlocked?'':' p6-locked'),unlocked?name:'🔒 '+name.replace(/^\S+\s/,''));
      badge.title=unlocked?'Բացված է':'Դեռ փակ է';badges.append(badge);
    });host.append(badges);
  };
})();
