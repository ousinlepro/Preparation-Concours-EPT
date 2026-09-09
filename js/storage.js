// "Base de données" du site : tout est stocké dans localStorage, propre à ce
// navigateur — c'est l'équivalent exact de concours-ept/database.py (sqlite)
// mais sans serveur ni compte : il n'y a pas d'identifiant utilisateur du
// tout, puisque chaque navigateur a de toute façon son propre localStorage.
//
// Forme des données stockées sous la clé STORAGE_KEY :
// {
//   nextAttemptId: 1,
//   attempts: [{ id, examId, matiere, annee, score, total, takenAt,
//                answers: [{ questionId, given, correct, isCorrect }, ...] }, ...],
//   inProgress: { [examId]: { questionIds, qIndex, answers, updatedAt } }
// }
const STORAGE_KEY = "concoursEpt.v1";

function _emptyState() {
  return { nextAttemptId: 1, attempts: [], inProgress: {} };
}

/** Lecture défensive : localStorage peut être indisponible (navigation
 * privée très restrictive) ou contenir un JSON corrompu — dans les deux cas
 * on retombe sur un état vide plutôt que de planter tout le site. */
function _readState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return _emptyState();
    const parsed = JSON.parse(raw);
    return {
      nextAttemptId: parsed.nextAttemptId || 1,
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
      inProgress: parsed.inProgress && typeof parsed.inProgress === "object" ? parsed.inProgress : {},
    };
  } catch {
    return _emptyState();
  }
}

function _writeState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Stockage plein ou indisponible : on continue sans persister plutôt
    // que de casser le quiz en cours.
  }
}

const Storage = {
  // -------------------------------------------------------------------
  // Tentatives en cours (reprendre / recommencer)
  // -------------------------------------------------------------------

  getInProgressExamIds() {
    return Object.keys(_readState().inProgress);
  },

  getProgress(examId) {
    return _readState().inProgress[examId] || null;
  },

  saveProgress(examId, questionIds, qIndex, answers) {
    const state = _readState();
    state.inProgress[examId] = {
      questionIds, qIndex, answers,
      updatedAt: new Date().toISOString(),
    };
    _writeState(state);
  },

  deleteProgress(examId) {
    const state = _readState();
    delete state.inProgress[examId];
    _writeState(state);
  },

  // -------------------------------------------------------------------
  // Tentatives terminées
  // -------------------------------------------------------------------

  /** Meilleur score déjà obtenu sur cette épreuve (avant la tentative en cours). */
  getBestScore(examId) {
    const attempts = _readState().attempts.filter((a) => a.examId === examId);
    if (attempts.length === 0) return { best: null, total: null };
    const best = attempts.reduce((a, b) => (b.score > a.score ? b : a));
    return { best: best.score, total: best.total };
  },

  /** Enregistre une tentative terminée. Retourne son id. */
  saveAttempt(exam, score, total, answers) {
    const state = _readState();
    const id = state.nextAttemptId++;
    state.attempts.push({
      id,
      examId: exam.id,
      matiere: exam.matiere,
      annee: exam.annee,
      score, total,
      takenAt: new Date().toISOString(),
      answers,
    });
    _writeState(state);
    return id;
  },

  /** Toutes les tentatives, les plus récentes en premier. */
  getUserAttempts() {
    return _readState().attempts.slice().sort((a, b) => b.takenAt.localeCompare(a.takenAt));
  },

  /** Tentatives pour une matière donnée (toutes années confondues). */
  getUserAttemptsByMatiere(matiere) {
    return this.getUserAttempts().filter((a) => a.matiere === matiere);
  },

  /** Une tentative précise, avec le détail de ses réponses. */
  getAttempt(attemptId) {
    const attempt = _readState().attempts.find((a) => a.id === attemptId);
    return attempt || null;
  },

  /** Meilleur score de chaque épreuve déjà tentée (une ligne par épreuve),
   * pour la page Statistiques — remplace le classement multi-comptes du
   * site original, impossible sans connexion. */
  getPersonalBests() {
    const byExam = new Map();
    for (const a of _readState().attempts) {
      const existing = byExam.get(a.examId);
      if (!existing) {
        byExam.set(a.examId, {
          examId: a.examId, matiere: a.matiere, annee: a.annee,
          bestScore: a.score, total: a.total, attemptsCount: 1,
        });
      } else {
        existing.attemptsCount += 1;
        if (a.score > existing.bestScore) existing.bestScore = a.score;
      }
    }
    return Array.from(byExam.values()).sort(
      (a, b) => a.matiere.localeCompare(b.matiere) || a.annee - b.annee
    );
  },

  /** Efface tout : historique, records, épreuve en cours. Action
   * irréversible, appelée uniquement après confirmation côté vue. */
  resetAllData() {
    _writeState(_emptyState());
  },
};
