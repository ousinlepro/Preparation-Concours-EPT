// Accueil — équivalent de home_screen.dart (bandeau d'accueil, en-tête de
// matière, ExamCard avec anneau de meilleur score).
Views.home = async function () {
  const byMatiere = await ExamRepo.examsByMatiere();
  const inProgressIds = new Set(Storage.getInProgressExamIds());
  const bestsByExamId = new Map(Storage.getPersonalBests().map((b) => [b.examId, b]));
  const matieres = Object.keys(byMatiere).sort((a, b) => a.localeCompare(b));

  if (matieres.length === 0) {
    return `
      <div class="empty-state">
        ${iconSpan("school", "empty-state-icon")}
        <p>Aucune question n'est encore disponible. Reviens bientôt !</p>
      </div>
    `;
  }

  const examCount = matieres.reduce((n, m) => n + byMatiere[m].length, 0);

  const heroHtml = `
    <div class="hero">
      <div class="hero-text">
        <div class="hero-title">Prêt à t'entraîner ?</div>
        <div class="hero-subtitle">${examCount} épreuves sur ${matieres.length} matières · une question à la fois, comme le jour du concours.</div>
      </div>
      ${iconSpan("school", "hero-icon")}
    </div>
  `;

  const sections = matieres.map((matiere) => {
    const style = matiereStyle(matiere);
    const cards = byMatiere[matiere].map((exam) => {
      const inProgress = inProgressIds.has(exam.id);
      const best = bestsByExamId.get(exam.id);
      const ratio = best && best.total ? Math.round((best.bestScore / best.total) * 100) : 0;

      return `
        <div class="card exam-card">
          <span class="subject-badge" style="--matiere-color: ${style.color}; --ratio: ${ratio}">
            <span class="subject-badge-icon">${iconSpan(style.icon)}</span>
          </span>
          <div class="exam-card-main">
            <div class="exam-card-title">
              <span>Session ${exam.annee}</span>
              ${inProgress ? `<span class="pill pill-gold">${iconSpan("play_circle")}<span>En cours</span></span>` : ""}
            </div>
            <div class="exam-card-meta">${exam.questionCount} question(s)</div>
            ${best ? `<div class="exam-card-best" style="--matiere-color: ${style.color}">🏆 ${best.bestScore}/${best.total}</div>` : ""}
          </div>
          <button type="button" class="btn-tonal" style="--matiere-color: ${style.color}" data-start-exam="${escapeHtml(exam.id)}">
            ${inProgress ? "Continuer" : "Commencer"}
          </button>
        </div>
      `;
    }).join("");

    return `
      <section class="matiere-group">
        <div class="matiere-header">
          <span class="tile-avatar" style="--matiere-color: ${style.color}">${iconSpan(style.icon)}</span>
          <h2>${escapeHtml(matiere)}</h2>
        </div>
        <div class="exam-grid">${cards}</div>
      </section>
    `;
  }).join("");

  return heroHtml + sections;
};

/** Clic sur "Commencer"/"Continuer" : reprend une tentative en cours si elle
 * existe, sinon en démarre une nouvelle — équivalent de /quiz/start côté Flask. */
async function startExamFlow(examId) {
  const progress = Storage.getProgress(examId);
  if (Quiz.isProgressUsable(progress)) {
    navTo(`quiz/${examId}/resume`);
    return;
  }
  const exam = await ExamRepo.getExam(examId);
  if (!exam) return;
  Quiz.beginFreshAttempt(exam);
  navTo(`quiz/${examId}`);
}
