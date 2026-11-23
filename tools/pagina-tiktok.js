#!/usr/bin/env node
/* Página privada para subir los reels a TikTok A MANO (docs/tiktok.html, sin indexar ni enlazar).
   Lee tools/tiktok-semana.json ([{fecha, hora, archivo, titulo, texto, venta}]), copia cada vídeo de reels/ a docs/tiktok/
   (borra los de semanas anteriores) y escribe la página con un botón para descargar el vídeo y otro para copiar el texto.
   Uso: node tools/pagina-tiktok.js */
const fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..'), dest = path.join(raiz, 'docs', 'tiktok');
const lista = JSON.parse(fs.readFileSync(path.join(__dirname, 'tiktok-semana.json'), 'utf8'));
fs.mkdirSync(dest, { recursive: true });
for (const f of fs.readdirSync(dest)) if (f.endsWith('.mp4') && !lista.some(x => x.archivo === f)) fs.unlinkSync(path.join(dest, f));
for (const x of lista) fs.copyFileSync(path.join(raiz, 'reels', x.archivo), path.join(dest, x.archivo));
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const tarjetas = lista.map((x, i) => {
  const d = new Date(x.fecha + 'T12:00:00');
  return `<section><h2>${dias[d.getDay()]} ${d.getDate()} · ${x.hora}</h2><p class="t">${esc(x.titulo)}</p>
<video controls preload="none" src="tiktok/${x.archivo}"></video>
<a class="b" href="tiktok/${x.archivo}" download>1 · Descargar vídeo</a>
<button class="b" data-i="${i}">2 · Copiar texto</button>
<textarea id="t${i}" readonly rows="7">${esc(x.texto)}</textarea>
${x.afiliado ? '<p class="n">Reel de AFILIADO: en «Divulgación de contenido» marca «Contenido de marca» (contenido comercial de terceros).</p>' : x.venta ? '<p class="n">Reel de venta del cuaderno: en «Más opciones» → «Divulgación de contenido» marca «Tu marca».</p>' : ''}</section>`;
}).join('\n');
const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Peque Juega · TikTok a mano</title>
<style>body{font-family:system-ui,sans-serif;margin:0;background:#fde68a;color:#1f2937}main{max-width:520px;margin:0 auto;padding:14px}
h1{font-size:22px;margin:6px 0}ol{padding-left:20px;font-size:14px}section{background:#fffdf5;border:3px solid #1f2937;border-radius:16px;padding:12px;margin:14px 0}
h2{margin:0;font-size:18px;text-transform:capitalize}.t{margin:2px 0 8px;font-weight:600}video{width:100%;max-height:360px;background:#000;border-radius:10px}
.b{display:block;width:100%;box-sizing:border-box;margin-top:8px;padding:12px;font:inherit;font-weight:800;font-size:16px;text-align:center;text-decoration:none;color:#fff;background:#1f2937;border:0;border-radius:10px}
textarea{width:100%;box-sizing:border-box;margin-top:8px;font:inherit;font-size:13px;border-radius:10px;padding:8px}.n{font-size:13px;margin:6px 0 0;font-weight:600}</style></head>
<body><main><h1>TikTok a mano</h1>
<ol><li>Pulsa «Descargar vídeo» (se guarda en el móvil).</li><li>Pulsa «Copiar texto».</li><li>Abre TikTok → + → Cargar → elige el vídeo → pega el texto → Publicar.</li><li>Quédate 5–10 minutos usando la app después de publicar.</li></ol>
${tarjetas}
</main><script>
document.querySelectorAll('button[data-i]').forEach(b => b.addEventListener('click', async () => {
  const t = document.getElementById('t' + b.dataset.i);
  try { await navigator.clipboard.writeText(t.value); } catch (e) { t.select(); document.execCommand('copy'); }
  b.textContent = 'Texto copiado ✓';
}));
</script></body></html>`;
fs.writeFileSync(path.join(raiz, 'docs', 'tiktok.html'), html);
console.log('docs/tiktok.html con', lista.length, 'vídeos');
