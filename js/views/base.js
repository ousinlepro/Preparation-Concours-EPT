// Chaque propriété de Views est une fonction async(...) => string qui rend
// une "page" en HTML — équivalent d'un render_template() côté Flask, sauf
// qu'ici c'est le routeur (js/router.js) qui injecte le résultat dans #app.
const Views = {};
