// Chargement du catalogue d'épreuves — équivalent de
// concours-ept/app.py (load_index/get_exam) et
// concours_ept_app/lib/data/questions_repository.dart, mais via fetch()
// plutôt qu'une lecture de fichier ou un appel serveur : data/exams/index.json
// est le catalogue léger (id, matière, année, fichier, nb de questions), lu
// une seule fois ; le contenu complet d'une épreuve (questions/choix/corrigé)
// n'est chargé, à la demande et mis en cache, que lorsqu'elle est réellement
// ouverte. Chemins relatifs (pas de "/" en tête) pour fonctionner aussi bien
// en local que servi depuis un sous-dossier GitHub Pages.
const ExamRepo = {
  _indexPromise: null,
  _examCache: new Map(),

  async loadIndex() {
    if (!this._indexPromise) {
      this._indexPromise = fetch("data/exams/index.json")
        .then((r) => {
          if (!r.ok) throw new Error("Catalogue des épreuves introuvable (data/exams/index.json).");
          return r.json();
        })
        .then((data) => data.exams);
    }
    return this._indexPromise;
  },

  /** Catalogue léger, regroupé par matière et trié par année — ce que lit l'accueil. */
  async examsByMatiere() {
    const index = await this.loadIndex();
    const byMatiere = {};
    for (const entry of index) {
      if (!byMatiere[entry.matiere]) byMatiere[entry.matiere] = [];
      byMatiere[entry.matiere].push(entry);
    }
    for (const list of Object.values(byMatiere)) list.sort((a, b) => a.annee - b.annee);
    return byMatiere;
  },

  /** Liste triée des matières présentes dans le catalogue. */
  async matieres() {
    const index = await this.loadIndex();
    return Array.from(new Set(index.map((e) => e.matiere))).sort((a, b) => a.localeCompare(b));
  },

  async _indexEntry(examId) {
    const index = await this.loadIndex();
    return index.find((e) => e.id === examId) || null;
  },

  /** Charge le contenu complet (questions incluses) d'UNE épreuve, à la
   * demande, à partir de son fichier référencé dans index.json. */
  async getExam(examId) {
    if (this._examCache.has(examId)) return this._examCache.get(examId);
    const entry = await this._indexEntry(examId);
    if (!entry) return null;
    const res = await fetch("data/exams/" + entry.file);
    if (!res.ok) throw new Error("Épreuve introuvable : " + examId);
    const data = await res.json();
    const exam = { id: entry.id, matiere: entry.matiere, annee: entry.annee, questions: data.questions };
    this._examCache.set(examId, exam);
    return exam;
  },
};
