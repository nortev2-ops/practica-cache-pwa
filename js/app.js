/*
 * Registro del Service Worker.
 * La ruta es relativa a la página ('./sw.js'), por lo que funciona igual
 * en localhost y en GitHub Pages (https://usuario.github.io/repositorio/).
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registro => console.log('Service Worker registrado. Alcance:', registro.scope))
      .catch(error => console.error('Error al registrar el Service Worker:', error));
  });
}
