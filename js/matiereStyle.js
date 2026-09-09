// Icône (nom de ligature Material Symbols, comme les IconData Flutter) +
// couleur d'accent par matière — mêmes valeurs que
// concours-ept/app.py (MATIERE_STYLES) et
// concours_ept_app/lib/theme/matiere_style.dart, pour une identité visuelle
// cohérente entre les trois versions du projet.
const MATIERE_STYLES = {
  "Mathématiques": { icon: "functions", color: "#3D5AFE" },
  "Physique": { icon: "science", color: "#8E5AC8" },
  "Anglais": { icon: "translate", color: "#E0752D" },
  "Français": { icon: "menu_book", color: "#D6336C" },
};
const FALLBACK_MATIERE_STYLE = { icon: "school", color: "#607D8B" };

/** Style pour une matière donnée. Une matière absente de la table (ajoutée
 * plus tard dans le catalogue) retombe sur un style neutre plutôt que de
 * planter. */
function matiereStyle(matiere) {
  return MATIERE_STYLES[matiere] || FALLBACK_MATIERE_STYLE;
}

/** <span> d'icône Material Symbols — mêmes noms de ligature que les
 * IconData Flutter (functions_rounded -> "functions", etc.). */
function iconSpan(name, extraClass) {
  return `<span class="material-symbols-outlined${extraClass ? " " + extraClass : ""}">${name}</span>`;
}
