#!/usr/bin/env node
/* Vídeo largo mensual para YouTube: une los reels de un mes en un solo vídeo (más de 3 min → vídeo normal,
   no Short, así los enlaces de la descripción son clicables).
   Uso: node tools/video-mensual.js 2026-11        → reels/largos/2026-11-recopilacion.mp4 + .txt (título y descripción)
        node tools/video-mensual.js 2026-11 --lista → solo enseña qué reels entrarían
   Entran los reels reels/AAAA-MM-*.mp4 del mes, por fecha. Si un tema está repetido, se queda el más reciente. */
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const raiz = path.join(__dirname, '..'), mes = process.argv[2], soloLista = process.argv.includes('--lista');
if (!/^\d{4}-\d{2}$/.test(mes || '')) { console.error('Uso: node tools/video-mensual.js AAAA-MM [--lista]'); process.exit(1); }
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const dur = f => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
const titulo = (archivo) => {                       // título del reel: gancho de la ficha o, si no hay ficha, el nombre del archivo
  const ficha = path.join(raiz, 'tools', 'animado', 'fichas', archivo.replace('.mp4', '.json'));
  if (fs.existsSync(ficha)) { const g = JSON.parse(fs.readFileSync(ficha, 'utf8')).escenas.find(e => e.tipo === 'gancho'); if (g) return g.titulo.replace(/\*/g, ''); }
  const t = archivo.slice(11, -4).replace(/-/g, ' '); return t[0].toUpperCase() + t.slice(1);
};
const porTema = new Map();
for (const f of fs.readdirSync(path.join(raiz, 'reels')).filter(f => f.startsWith(mes + '-') && f.endsWith('.mp4')).sort()) porTema.set(f.slice(11), f);
const reels = [...porTema.values()].sort();
if (!reels.length) { console.error('No hay reels de ' + mes); process.exit(1); }
let t = 0; const capitulos = [];
for (const f of reels) { const d = dur(path.join(raiz, 'reels', f)); const m = Math.floor(t / 60), s = Math.floor(t % 60); capitulos.push(`${m}:${String(s).padStart(2, '0')} ${titulo(f)}`); t += d; }
console.log(`${reels.length} reels · ${(t / 60).toFixed(1)} min`); console.log(capitulos.join('\n'));
if (t < 185) console.error('AVISO: dura menos de 3 min 5 s; YouTube lo trataría como Short (enlaces no clicables).');
if (soloLista) process.exit(0);
const salida = path.join(raiz, 'reels', 'largos'); fs.mkdirSync(salida, { recursive: true });
const mp4 = path.join(salida, `${mes}-recopilacion.mp4`);
const args = ['-y', '-loglevel', 'error'];
for (const f of reels) args.push('-i', path.join(raiz, 'reels', f));
const filtro = reels.map((_, i) => `[${i}:v]scale=1080:1920,fps=30,setsar=1,format=yuv420p[v${i}];[${i}:a]aresample=44100,aformat=channel_layouts=stereo[a${i}]`).join(';') +
  ';' + reels.map((_, i) => `[v${i}][a${i}]`).join('') + `concat=n=${reels.length}:v=1:a=1[v][a]`;
args.push('-filter_complex', filtro, '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '26', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', mp4);
execFileSync('ffmpeg', args, { stdio: 'inherit' });
const [a, m] = mes.split('-'), nombreMes = MESES[+m - 1];
const txt = `TÍTULO
Ideas de juego sin pantallas para tu peque: todo ${nombreMes} de ${a}

DESCRIPCIÓN
Publi · Todas las ideas de ${nombreMes} en un solo vídeo, para tener a mano cuando no sepas a qué jugar.

📘 Nuestros cuadernos para colorear (1–3 años) y más ideas: https://pequejuegaoficial-star.github.io/pequejuega-media/?r=yt
Como Afiliado de Amazon, obtengo ingresos por las compras adscritas que cumplen los requisitos aplicables.

${capitulos.join('\n')}

#juegossinpantallas #actividadesparaniños #ideasparapadres

AJUSTES: vídeo normal (no Short) · NO creado para niños · solo YouTube
`;
fs.writeFileSync(mp4.replace('.mp4', '.txt'), txt);
console.log(`OK ${path.relative(raiz, mp4)} · ${(fs.statSync(mp4).size / 1e6).toFixed(1)} MB · ${dur(mp4).toFixed(1)} s`);
