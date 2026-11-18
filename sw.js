/*
 * Service Worker - Práctica Cache (PWA)
 * Estrategia utilizada: 2 - CACHE WITH NETWORK FALLBACK
 *
 * Al hacer una petición primero se busca en caché. Si el recurso existe se
 * devuelve de inmediato (funciona sin conexión). Si no existe, se solicita a
 * la red y la respuesta se guarda en el caché dinámico para próximas visitas.
 *
 * Las rutas son RELATIVAS, por lo que el mismo archivo funciona en
 * localhost y en GitHub Pages (https://usuario.github.io/repositorio/).
 */

// Versión del caché: al cambiarla se crea un caché nuevo y se borra el anterior
const VERSION = 'v5';
const CACHE_ESTATICO = `estatico-${VERSION}`;
const CACHE_DINAMICO = `dinamico-${VERSION}`;

// Máximo de archivos que guarda el caché dinámico
const LIMITE_DINAMICO = 30;

// Archivos base que se guardan durante la instalación
// CSS de Bootstrap desde CDN: se guarda aparte para que la página se vea sin conexión.
// Si el CDN no responde, la instalación continúa igual.
const BOOTSTRAP_CDN = 'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css';

const ARCHIVOS_ESTATICOS = [
  './',
  './index.html',
  './img/main.jpg',
  './about.html',
  './contact.html',
  './manifest.json',

  './css/animate.css',
  './css/bootstrap.css',
  './css/icomoon.css',
  './css/style.css',

  './fonts/icomoon/icomoon.woff',
  './fonts/icomoon/icomoon.ttf',
  './fonts/bootstrap/glyphicons-halflings-regular.woff2',
  './fonts/bootstrap/glyphicons-halflings-regular.woff',
  './fonts/bootstrap/glyphicons-halflings-regular.ttf',

  './js/modernizr-2.6.2.min.js',
  './js/jquery.min.js',
  './js/jquery.easing.1.3.js',
  './js/bootstrap.min.js',
  './js/jquery.waypoints.min.js',
  './js/jquery.stellar.min.js',
  './js/jquery.countTo.js',
  './js/google_map.js',
  './js/main.js',
  './js/app.js',

  './images/hero_1.jpg',
  './images/hero_2.jpg',
  './images/hero_3.jpg',
  './images/hero_4.jpg',
  './images/person2.jpg',
  './images/person3.jpg',
  './images/person4.jpg',
  './images/loc.png',

  './images/icons/icon-72x72.png',
  './images/icons/icon-96x96.png',
  './images/icons/icon-128x128.png',
  './images/icons/icon-144x144.png',
  './images/icons/icon-152x152.png',
  './images/icons/icon-192x192.png',
  './images/icons/icon-384x384.png',
  './images/icons/icon-512x512.png'
];

/*********************** INSTALACIÓN ***********************
Durante la instalación se guardan en caché los archivos base.
Si alguno no se puede descargar, la instalación falla completa
(addAll es todo o nada), por eso la lista debe existir en el proyecto.
************************************************************/
self.addEventListener('install', evento => {
  evento.waitUntil(
    caches.open(CACHE_ESTATICO)
      .then(cache => cache.addAll(ARCHIVOS_ESTATICOS))
      .then(() => caches.open(CACHE_ESTATICO))
      .then(cache => cache.add(new Request(BOOTSTRAP_CDN, { mode: 'cors' })))
      .catch(error => console.warn('Bootstrap CDN no guardado en caché:', error))
      .then(() => self.skipWaiting())
  );
});

/*********************** ACTIVACIÓN ***********************
Se eliminan los cachés de versiones anteriores para no
ocupar espacio innecesario.
************************************************************/
self.addEventListener('activate', evento => {
  evento.waitUntil(
    caches.keys()
      .then(nombres => Promise.all(
        nombres
          .filter(nombre => nombre !== CACHE_ESTATICO && nombre !== CACHE_DINAMICO)
          .map(nombre => caches.delete(nombre))
      ))
      .then(() => self.clients.claim())
  );
});

/*********************** LIMPIEZA DE CACHÉ ***********************
Mantiene un número limitado de archivos en el caché indicado.
Elimina el más antiguo y repite hasta cumplir el límite.
*****************************************************************/
async function limpiarCache(nombreCache, numeroItems) {
  const cache = await caches.open(nombreCache);
  const llaves = await cache.keys();
  if (llaves.length > numeroItems) {
    await cache.delete(llaves[0]);
    return limpiarCache(nombreCache, numeroItems);
  }
}

/*********************** ESTRATEGIA 2 ***********************
                 CACHE WITH NETWORK FALLBACK
1. Buscar en caché  -> si existe, devolverlo (modo offline).
2. Si no existe     -> pedirlo a la red, guardarlo en el
                       caché dinámico y devolverlo.
3. Si no hay red    -> páginas: devolver index.html;
                       otros recursos: error de red.
************************************************************/
self.addEventListener('fetch', evento => {
  const peticion = evento.request;

  // Solo se almacenan peticiones GET (cache.put no acepta POST, PUT, etc.)
  if (peticion.method !== 'GET') return;

  evento.respondWith(
    caches.match(peticion).then(enCache => {
      // 1. Existe en caché: se devuelve sin usar la red
      if (enCache) return enCache;

      // 2. No existe en caché: se pide a la red
      console.log('No existe en caché:', peticion.url);

      return fetch(peticion)
        .then(respWeb => {
          // Respuestas válidas (ok) u opacas (CDN sin CORS) se guardan
          if (respWeb && (respWeb.ok || respWeb.type === 'opaque')) {
            const copia = respWeb.clone();
            caches.open(CACHE_DINAMICO)
              .then(cache => cache.put(peticion, copia))
              .then(() => limpiarCache(CACHE_DINAMICO, LIMITE_DINAMICO));
          }
          return respWeb;
        })
        // 3. Sin red y sin caché: fallback
        .catch(() => {
          if (peticion.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return Response.error();
        });
    })
  );
});
