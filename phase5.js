/* Phase 5: accessible post-game leaderboard, stats and achievements. */
(function () {
  'use strict';
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
  }
  window.phase5RenderSummary = function () {
    const host = document.getElementById('phase5-summary');
    if (!host || !Array.isArray(teams) || !Array.isArray(scores)) return;
    host.replaceChildren();
    const standings = teams.map((team, index) => ({
      name: team.name, avatar: team.avatar || '🎮', score: Number(scores[index]) || 0,
      combo: Number(teamBestCombos[index]) || 0, index
    })).sort((a,b) => b.score-a.score || b.combo-a.combo || a.index-b.index);
    const maxScore = Math.max(0, ...standings.map(t => t.score));
    const sum = standings.reduce((total,t) => total+t.score, 0);
    host.appendChild(el('h2', 'p5-heading', '📊 Խաղի վիճակագրություն'));
    const stats = el('div', 'p5-stats');
    [['🎯 Ընդհանուր միավորներ',sum],['🏅 Լավագույն արդյունք',maxScore],['🔥 Լավագույն combo',Math.max(0,...standings.map(t=>t.combo))],['🎮 Խաղացած փուլեր',Number(totalRounds)||0]].forEach(([label,value])=>{
      const item=el('div','p5-stat');item.append(el('span','p5-stat-label',label),el('strong','p5-stat-value',value));stats.appendChild(item);
    });
    host.appendChild(stats);
    host.appendChild(el('h2','p5-heading','🏆 Թիմերի դասակարգում'));
    const board=el('ol','p5-board');
    standings.forEach((team,position)=>{
      const row=el('li','p5-rank');
      if (team.score===maxScore) row.classList.add('p5-leading');
      row.append(el('span','p5-medal',['🥇','🥈','🥉'][position]||`#${position+1}`),el('span','p5-team',`${team.avatar} ${team.name}`),el('strong','p5-points',`${team.score} միավոր`));
      board.appendChild(row);
    });
    host.appendChild(board);
    host.appendChild(el('h2','p5-heading','✨ Նվաճումներ'));
    const badges=el('div','p5-badges');
    const achievements=[];
    if (maxScore>=10) achievements.push('🎯 10+ միավոր');
    if (standings.some(t=>t.combo>=5)) achievements.push('🔥 Combo Master · x5');
    if (standings.some(t=>t.combo>=10)) achievements.push('🚀 Combo Legend · x10');
    if (standings.length>1 && standings.filter(t=>t.score===maxScore).length>1) achievements.push('🤝 Հավասար պայքար');
    if (standings.length>1 && standings[0].score-standings[1].score>=10) achievements.push('👑 Հստակ հաղթանակ');
    if (!achievements.length) achievements.push('🎮 Առաջին քայլը՝ խաղն ավարտված է');
    achievements.forEach(label=>badges.appendChild(el('span','p5-badge',label)));
    host.appendChild(badges);
  };
})();
