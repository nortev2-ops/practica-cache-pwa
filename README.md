# Práctica Cache - Aplicaciones Web Progresivas (PWA)

Sitio de práctica para la Unidad II: service worker con estrategia de caché y manifest.

## Estrategia de caché implementada

**Estrategia 2 - Cache with Network Fallback**

1. Durante la instalación (`install`) se precachean 41 archivos base (HTML, CSS, JS, fuentes, imágenes e íconos).
2. En cada petición (`fetch`) primero se busca en caché. Si existe, se devuelve sin usar la red (funciona offline).
3. Si no existe, se solicita a la red y la respuesta se guarda en el caché dinámico (máximo 30 archivos).
4. Sin red y sin caché: las páginas devuelven `index.html`; el resto de recursos devuelve error de red.

Los cachés de versiones anteriores se eliminan en la activación (`activate`).

## Estructura

| Archivo | Función |
|---|---|
| `sw.js` | Service worker: instalación, activación, estrategia de caché |
| `js/app.js` | Registro del service worker |
| `index.html` | Página principal del ejemplo ("Mi PWA") |
| `img/main.jpg` | Imagen de la página principal |
| `manifest.json` | Configuración de la PWA (nombre, colores, íconos, modo standalone) |
| `images/icons/` | Íconos en 8 resoluciones (72 a 512 px) |

## Paleta de colores

- `#52d3aa` verde-agua (color principal del tema y `theme_color`)
- `#ffffff` fondo (`background_color`, pantalla de presentación)

## Ejecutar localmente

```bash
python -m http.server 8000
```

Abrir `http://localhost:8000` en Chrome. Los service workers requieren `localhost` o HTTPS.

## Publicación en GitHub Pages

Settings > Pages > Source: rama `main`, carpeta `/ (root)`.
La ruta de registro es relativa, por lo que el sitio funciona en `https://USUARIO.github.io/REPOSITORIO/`.
