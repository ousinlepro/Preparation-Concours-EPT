// Petits utilitaires partagés entre toutes les vues.
// Scripts classiques (pas de modules) : tout ce qui est déclaré ici avec
// `const`/`function` au niveau supérieur est visible par les fichiers
// <script> chargés après celui-ci dans index.html.

/** Échappe le HTML avant insertion dans innerHTML (le texte des questions
 * vient de nos propres fichiers JSON, mais autant ne jamais faire confiance
 * à du texte inséré tel quel — les formules LaTeX entre $...$ ne sont pas
 * affectées : MathJax les retrouve normalement une fois le HTML analysé). */
function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Mélange Fisher-Yates, in place, retourne le tableau pour chaîner. */
function shuffled(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Formate une date ISO (Date.toISOString()) en quelque chose de lisible en français. */
function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("fr-FR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso || "";
  }
}

/** Demande à MathJax de retypeset le sous-arbre donné, une fois le HTML
 * injecté. MathJax est chargé en `async` : on attend son initialisation si
 * elle n'est pas encore terminée plutôt que d'échouer silencieusement. */
function typesetMath(el) {
  if (!window.MathJax) return;
  if (window.MathJax.typesetPromise) {
    window.MathJax.typesetPromise([el]).catch(() => {});
  } else if (window.MathJax.startup && window.MathJax.startup.promise) {
    window.MathJax.startup.promise.then(() => {
      if (window.MathJax.typesetPromise) window.MathJax.typesetPromise([el]).catch(() => {});
    });
  }
}

/** Construit l'URL d'un fragment de route, ex: navTo('historique/Anglais'). */
function navTo(hashPath) {
  location.hash = "#/" + hashPath.replace(/^\/+/, "");
}
