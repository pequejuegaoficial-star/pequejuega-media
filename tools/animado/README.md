# Reels animados de Peque Juega

Cada reel sale de una **ficha** (JSON) con los textos y el nombre de un dibujo por escena. El motor pone el movimiento, la música original (tools/musica.py, a 120 pulsos/min para que los cortes caigan a compás) y guarda el vídeo en `reels/`.

```
node tools/animado/reel.js tools/animado/fichas/AAAA-MM-DD-tema.json --fotos tira.jpg   # revisar antes de renderizar
node tools/animado/reel.js tools/animado/fichas/AAAA-MM-DD-tema.json                    # → reels/AAAA-MM-DD-tema.mp4
node tools/animado/reel.js --catalogo                                                   # → tools/animado/catalogo.jpg
```
Si `require('playwright')` falla: `export NODE_PATH=$(npm root -g)`.

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
- No usar bancos con licencia CC BY o CC BY-SA (OpenMoji, Twemoji…) sin poner la atribución que exigen, ni nada sin licencia clara. Nunca personajes ni marcas de terceros.

## Antes de publicar
Mirar la tira de `--fotos`: texto sin cortar ni solapar y dibujo correcto. Después del render, comprobar duración y que el archivo tiene audio.
