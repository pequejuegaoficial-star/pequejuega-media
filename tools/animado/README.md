# Reels animados de Peque Juega

Cada reel sale de una **ficha** (JSON) con los textos y el nombre de un dibujo por escena. El motor pone el movimiento, la música original (tools/musica.py, a 120 pulsos/min para que los cortes caigan a compás) y guarda el vídeo en `reels/`.

```
node tools/animado/reel.js tools/animado/fichas/AAAA-MM-DD-tema.json --fotos tira.jpg   # revisar antes de renderizar
node tools/animado/reel.js tools/animado/fichas/AAAA-MM-DD-tema.json                    # → reels/AAAA-MM-DD-tema.mp4
node tools/animado/reel.js --catalogo                                                   # → tools/animado/catalogo.jpg
```
Si `require('playwright')` falla: `export NODE_PATH=$(npm root -g)`.

No depende de nada instalado aparte de Playwright y ffmpeg: la fuente Poppins va en `fuentes/` (licencia OFL) y, si `tools/musica.py` falla por falta de numpy/scipy, el motor usa una pista de `music/` y lo avisa.

Para comprobar la página de enlaces sin internet: `node tools/comprobar-pagina.js ig` (lista cada producto con su botón y su enlace, y falla si un enlace no lleva a amazon.es con el tag de la red). GitHub Pages no es accesible desde las sesiones en la nube y la página se dibuja con JavaScript, así que esta es la forma de verificarla.

## Ficha
```json
{ "fecha": "2026-11-18", "slug": "pintar-con-agua", "escenas": [
  { "tipo": "gancho", "etiqueta": "IDEA SIN PANTALLAS", "titulo": "Pintar *sin manchar* nada", "sub": "Solo necesitas agua", "dibujo": "brocha" },
  { "tipo": "idea", "n": 1, "titulo": "Un vaso de agua y una brocha", "dibujo": "vaso-agua", "sub": "Ni pintura, ni babero" },
  { "tipo": "cierre", "frase": "Guárdalo para la próxima tarde en casa" } ] }
```
- `gancho` (3 s): el titular está completo en el fotograma 0 (portada). `*así*` resalta una frase corta.
- `idea` (4 s con 3 ideas; 3,5 s con 4; 5 s con 2): número, título, dibujo y una línea.
- `cierre` (3 s): logo, frase y botón "Guárdalo y síguenos @pequejuega.oficial" (`boton` lo cambia; `dibujo` es opcional).
- `fondo` (color) y `dur` (segundos) son opcionales en cualquier escena. `semilla` fija la música (usar 2, 5, 8, 11… para 120 pulsos/min).

## Dibujos
- **Propios** (`dibujos.js`, ver `catalogo.jpg`): cada pieza lleva su animación en `data-a`. Las instrucciones para añadir uno nuevo están al principio del archivo.
- **Iconos libres**: `"dibujo": "icono:nombre"` usa un icono de Tabler Icons (licencia MIT, sin atribución obligatoria; copia de la licencia en `iconos/`). Se dibuja trazo a trazo sobre un círculo blanco. Hay una selección en `iconos/`; para otro, `npm i @tabler/icons` y copiar `icons/outline/nombre.svg`.
- **Portada real de los libros** (reels de venta): `"dibujo": "portada:100"` (100 dibujos para aprender, B0HR9HHNVJ) o `"dibujo": "portada:50"` (¡Para colgar en la nevera!, B0HR9GYJBP). Imágenes en `portadas/`, sacadas de las cubiertas finales de KDP. En los reels de venta usar SIEMPRE la portada real (gancho y cierre) en vez del dibujo genérico `libro-colorear`.
- No usar bancos con licencia CC BY o CC BY-SA (OpenMoji, Twemoji…) sin poner la atribución que exigen, ni nada sin licencia clara. Nunca personajes ni marcas de terceros.

## Antes de publicar
Mirar la tira de `--fotos`: texto sin cortar ni solapar y dibujo correcto. Después del render, comprobar duración y que el archivo tiene audio.

## Vídeo largo mensual para YouTube (desde nov-2026)
`node tools/video-mensual.js AAAA-MM` une los reels del mes en `reels/largos/AAAA-MM-recopilacion.mp4` y escribe al lado un `.txt` con título, descripción (con capítulos, "Publi", enlace a la página con `?r=yt` y aviso de afiliado) y ajustes. `--lista` solo enseña qué entraría. Tiene que durar más de 3 min 5 s (si no, YouTube lo trata como Short y los enlaces no son clicables): el script avisa. Se publica SOLO en YouTube, como vídeo normal y NO creado para niños; cuenta como 1 publicación de Metricool.

## Página de enlaces: productos de afiliado (16-nov-2026)
`docs/index.html` → `PRODUCTOS`: los libros propios y 30 productos de afiliado agrupados por palabra (`grupo`). Cada grupo tiene ancla con la palabra en minúsculas: `…/pequejuega-media/?r=ig#regalos`, `#rincon`, `#pintar`, `#letras`, `#lluvia`, `#bici`, `#circuito`, `#orden`, `#dormir`, `#torre`, `#mochila`. Datos y normas: doc del proyecto `claude/afiliados-30-productos.md`. Tras tocar la página: `node tools/comprobar-pagina.js ig` (y `yt`, `fb`).
