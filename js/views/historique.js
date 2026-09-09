// Historique — équivalent de historique_matieres_screen.dart et
// historique_matiere_screen.dart (listes de "ListTile" : avatar rond, titre,
// sous-titre, chevron).

Views.historiqueMatieres = async function () {
  const matieres = await ExamRepo.matieres();

  if (matieres.length === 0) {
    return `
      <div class="empty-state">
        ${iconSpan("history", "empty-state-icon")}
        <p>Rien à afficher pour le moment.</p>
      </div>
    `;
  }

  const rows = matieres.map((matiere) => {
    const style = matiereStyle(matiere);
    return `
      <a href="#/historique/${encodeURIComponent(matiere)}" class="card list-tile">
        <span class="tile-avatar" style="--matiere-color: ${style.color}">${iconSpan(style.icon)}</span>
        <span class="tile-main"><span class="tile-title">${escapeHtml(matiere)}</span></span>
        ${iconSpan("chevron_right", "tile-chevron")}
      </a>
    `;
  }).join("");

  return `<h2 class="section-title">Choisis une matière</h2>${rows}`;
};

Views.historiqueMatiere = async function (matiere) {
  const attempts = Storage.getUserAttemptsByMatiere(matiere);
  const style = matiereStyle(matiere);

  if (attempts.length === 0) {
    return `
      <div class="empty-state">
        ${iconSpan(style.icon, "empty-state-icon")}
        <p>Pas encore de tentative en ${escapeHtml(matiere)}.</p>
      </div>
    `;
  }

  // Rang de chaque tentative parmi les tentatives sur LA MÊME épreuve
  // (meilleur score = rang 1 ; égalité départagée par la plus ancienne) —
  // même logique que ranksByExam() côté Flutter.
  const byExam = new Map();
  for (const a of attempts) {
    if (!byExam.has(a.examId)) byExam.set(a.examId, []);
    byExam.get(a.examId).push(a);
  }
  const ranks = new Map();
  for (const group of byExam.values()) {
    const ordered = group.slice().sort((a, b) => b.score - a.score || a.takenAt.localeCompare(b.takenAt));
    ordered.forEach((row, i) => ranks.set(row.id, i + 1));
  }

  const rows = attempts.map((a) => {
    const label = a.annee === 0 ? "Session aléatoire" : `Session ${a.annee}`;
    const rank = ranks.get(a.id);
    return `
      <button type="button" class="card list-tile" data-nav-to="historique/tentative/${a.id}">
        <span class="tile-avatar" style="--matiere-color: ${style.color}">${iconSpan(style.icon)}</span>
        <span class="tile-main">
          <span class="tile-title">${escapeHtml(label)} — ${a.score}/${a.total}</span>
          <span class="tile-subtitle">${formatDate(a.takenAt)} · rang ${rank} sur cette épreuve</span>
        </span>
        ${iconSpan("chevron_right", "tile-chevron")}
      </button>
    `;
  }).join("");

  return `<h2 class="section-title">${escapeHtml(matiere)}</h2>${rows}`;
};
