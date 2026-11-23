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
- **Retención (desde el 23-nov-2026, obligatorio)**: poner en la ficha `"ganchoSinEntrada": true` (titular, resaltado y dibujo del gancho ya completos y en movimiento en el fotograma 0; el sub entra a 0,9 s y el titular late a 1,8 s) y `"ritmoRapido": true` (en las ideas la línea de apoyo entra a 1,6 s y el número late 1 s antes del corte: ningún tramo de más de 1,5 s sin cambio). Comprobar con `--fotos` que la primera foto ya tiene el titular.
- Si `boton` pasa de 40 caracteres (p. ej. "Comenta LAMINA 👇 y te mando 4 láminas gratis"), la píldora se dibuja más pequeña para que no se salga.
- `gancho_tipo` (desde dic-2026): tipo de gancho psicológico que se prueba (lista y reglas en `embudo/GANCHOS.md`). El motor no lo usa; sirve para medir. En reels que no son de venta, "GRATIS" va en la `etiqueta`.
- `fondo` (color) y `dur` (segundos) son opcionales en cualquier escena. `semilla` fija la música (usar 2, 5, 8, 11… para 120 pulsos/min).

## Dibujos
- **Propios** (`dibujos.js`, ver `catalogo.jpg`): cada pieza lleva su animación en `data-a`. Las instrucciones para añadir uno nuevo están al principio del archivo.
- **Iconos libres**: `"dibujo": "icono:nombre"` usa un icono de Tabler Icons (licencia MIT, sin atribución obligatoria; copia de la licencia en `iconos/`). Se dibuja trazo a trazo sobre un círculo blanco. Hay una selección en `iconos/`; para otro, `npm i @tabler/icons` y copiar `icons/outline/nombre.svg`.
- **Portada real de los libros** (reels de venta): `"dibujo": "portada:100"` (100 dibujos para aprender, B0HR9HHNVJ) o `"dibujo": "portada:50"` (¡Para colgar en la nevera!, B0HR9GYJBP) o `"dibujo": "portada:navidad"` (Mi primer libro de Navidad, B0HRXCPXFQ; obligatoria en todo reel de venta o de actividades de Navidad, decisión de Jorge 18-nov). Imágenes en `portadas/`, sacadas de las cubiertas finales de KDP. En los reels de venta usar SIEMPRE la portada real (gancho y cierre) en vez del dibujo genérico `libro-colorear`.
- No usar bancos con licencia CC BY o CC BY-SA (OpenMoji, Twemoji…) sin poner la atribución que exigen, ni nada sin licencia clara. Nunca personajes ni marcas de terceros.

## Antes de publicar
Mirar la tira de `--fotos`: texto sin cortar ni solapar y dibujo correcto. Después del render, comprobar duración y que el archivo tiene audio.

## Vídeo largo mensual para YouTube (desde nov-2026)
`node tools/video-mensual.js AAAA-MM` une los reels del mes en `reels/largos/AAAA-MM-recopilacion.mp4` y escribe al lado un `.txt` con título, descripción (con capítulos, "Publi", enlace a la página con `?r=yt` y aviso de afiliado) y ajustes. `--lista` solo enseña qué entraría. Tiene que durar más de 3 min 5 s (si no, YouTube lo trata como Short y los enlaces no son clicables): el script avisa. Se publica SOLO en YouTube, como vídeo normal y NO creado para niños; cuenta como 1 publicación de Metricool.

## Página de enlaces (rediseñada el 16-nov-2026: cuadrícula y categorías)
`docs/index.html`, todo se edita en el bloque CONFIGURACIÓN:
- `PRODUCTOS`: libros propios (con `img` en `docs/img/`), la lámina gratis (`descarga: 'laminas/…pdf'`) y 30 productos de afiliado (`grupo` + `clave`).
- `CATEGORIAS`: clave → [nombre corto, icono de reserva]. El botón muestra la foto `docs/img/cat-<clave en minúsculas>.jpg` (4:3, 400×300; fotos de Pexels, lista y autores en `docs/img/CREDITOS.md`; sin caras de niños ni personajes o marcas); si falta la foto, sale el icono. Cada categoría es un botón con ancla en minúsculas: `…/pequejuega-media/?r=ig#regalos`, `#rincon`, `#pintar`, `#letras`, `#lluvia`, `#bici`, `#circuito`, `#orden`, `#dormir`, `#torre`, `#mochila`. Al entrar con el ancla se abre esa categoría.
- `ICONO_POR_ASIN` e `ICONOS`: dibujo de cada producto (Tabler Icons, MIT, copiados de `tools/animado/iconos/`). NO usar fotos de producto de Amazon: sus políticas solo las permiten a través de su API.
- Láminas gratis: `docs/laminas/laminas-gratis-peque-juega.pdf` (4 láminas + 1 página con la dirección de la web; sin enlaces de afiliado dentro). Enlace directo para DM: `https://pequejuegaoficial-star.github.io/pequejuega-media/laminas/laminas-gratis-peque-juega.pdf`. Ancla en la página: `#laminas`.
- Ordenador: 4 por fila; móvil: 2 por fila. Tras tocar la página: `node tools/comprobar-pagina.js ig` (y `yt`, `fb`).

## TikTok a mano (desde el 16-nov-2026)
TikTok ya NO se programa en Metricool (los vídeos publicados por API en la cuenta nueva se quedaban a 0 visualizaciones). Jorge los sube desde la app.
- `tools/tiktok-semana.json`: lista de la semana `[{fecha, hora, archivo, titulo, texto, venta}]` (texto propio para TikTok: en los reels de venta, "Escríbenos LIBRO por Instagram", no "comenta LIBRO").
- `node tools/pagina-tiktok.js` copia los vídeos a `docs/tiktok/` (borra los anteriores) y escribe `docs/tiktok.html`: página sin indexar ni enlazar, con "Descargar vídeo" y "Copiar texto" → https://pequejuegaoficial-star.github.io/pequejuega-media/tiktok.html
- En Metricool, los proveedores de cada publicación son solo facebook, instagram y youtube.
