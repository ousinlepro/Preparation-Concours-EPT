// Statistiques personnelles — équivalent de stats_screen.dart. Remplace le
// classement multi-comptes de la version originale, impossible sans login.
Views.stats = async function () {
  const attempts = Storage.getUserAttempts();
  const totalAttempts = attempts.length;

  if (totalAttempts === 0) {
    return `
      <div class="empty-state">
        ${iconSpan("query_stats", "empty-state-icon")}
        <p>Termine une épreuve pour voir tes statistiques apparaître ici.</p>
      </div>
    `;
  }

  const totalCorrect = attempts.reduce((sum, a) => sum + a.score, 0);
  const totalQuestions = attempts.reduce((sum, a) => sum + a.total, 0);
  const globalAccuracy = totalQuestions ? Math.round((100 * totalCorrect) / totalQuestions) : 0;
  const bests = Storage.getPersonalBests();

  const bestItems = bests.map((best) => {
    const style = matiereStyle(best.matiere);
    const ratio = best.total ? (best.bestScore / best.total) * 100 : 0;
    const label = best.annee === 0 ? `${best.matiere} — Session aléatoire` : `${best.matiere} ${best.annee}`;
    return `
      <li class="best-item">
        <span class="tile-avatar" style="--matiere-color: ${style.color}">${iconSpan(style.icon)}</span>
        <div class="best-main">
          <div class="best-title">${escapeHtml(label)}</div>
          <div class="best-bar" style="--matiere-color: ${style.color}"><div class="best-bar-fill" style="width: ${ratio}%"></div></div>
          <div class="best-sub">${best.attemptsCount} tentative(s)</div>
        </div>
        <div class="best-score" style="--matiere-color: ${style.color}">${best.bestScore}/${best.total}</div>
      </li>
    `;
  }).join("");

  return `
    <div class="stat-tiles">
      <div class="card stat-tile">
        <span class="tile-avatar tile-avatar-primary">${iconSpan("fact_check")}</span>
        <div class="stat-tile-value">${totalAttempts}</div>
        <div class="stat-tile-label">Tentative(s) terminée(s)</div>
      </div>
      <div class="card stat-tile">
        <span class="tile-avatar tile-avatar-gold">${iconSpan("trending_up")}</span>
        <div class="stat-tile-value stat-tile-value-gold">${globalAccuracy}%</div>
        <div class="stat-tile-label">Taux de réussite global</div>
      </div>
    </div>
    <h2 class="section-title">Mes meilleurs scores</h2>
    <ul class="best-list">${bestItems}</ul>
  `;
};
