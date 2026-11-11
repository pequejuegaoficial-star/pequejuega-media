#!/usr/bin/env node
/* Reels animados de Peque Juega.
   node tools/animado/reel.js fichas/mi-reel.json            → reels/<fecha>-<slug>.mp4
   node tools/animado/reel.js fichas/mi-reel.json --fotos    → una tira de fotogramas para revisar (no renderiza)
   node tools/animado/reel.js --catalogo                     → catalogo.jpg con todos los dibujos
   Requisitos: playwright y ffmpeg. La fuente Poppins va incluida (fuentes/). La música usa tools/musica.py
   (python3 con numpy y scipy); si falla, se usa una pista de music/. */
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');
const DIR = __dirname, REPO = path.join(DIR, '..', '..'), FPS = 30;

function iconos(ficha) {            // SVG de los iconos "icono:nombre" (Tabler Icons, licencia MIT)
  const out = {};
  for (const e of ficha.escenas) if (e.dibujo && e.dibujo.startsWith('icono:')) {
    const k = e.dibujo.slice(6);
    const cands = [path.join(DIR, 'iconos', k + '.svg')];
    try { cands.push(path.join(path.dirname(require.resolve('@tabler/icons/package.json')), 'icons', 'outline', k + '.svg')); } catch {}
    const f = cands.find(fs.existsSync);
    if (!f) throw new Error(`Icono "${k}" no está en tools/animado/iconos. Cópialo de @tabler/icons (npm i @tabler/icons) o usa otro.`);
    out[k] = fs.readFileSync(f, 'utf8');
  }
  return out;
}
function validar(f) {
  const err = [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f.fecha || '')) err.push('fecha AAAA-MM-DD');
  if (!/^[a-z0-9-]+$/.test(f.slug || '')) err.push('slug en minúsculas con guiones');
  const E = f.escenas || [];
  if (!E.length || E[0].tipo !== 'gancho') err.push('la primera escena debe ser tipo "gancho"');
  if (!E.length || E[E.length - 1].tipo !== 'cierre') err.push('la última escena debe ser tipo "cierre"');
  if (err.length) throw new Error('Ficha incorrecta: ' + err.join('; '));
}
async function abrir(b) {
  const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  pg.on('pageerror', e => { console.error('Error en la página:', e.message); process.exitCode = 1; });
  await pg.goto('file://' + path.join(DIR, 'pagina.html'));
  await pg.evaluate(async () => { await Promise.all([document.fonts.load('500 40px PoppinsPJ'), document.fonts.load('700 40px PoppinsPJ')]); await document.fonts.ready; });
  const okFuente = await pg.evaluate(() => document.fonts.check('700 40px Poppins') || document.fonts.check('700 40px PoppinsPJ'));
  if (!okFuente) throw new Error('No se pudo cargar la fuente Poppins (ni la del sistema ni tools/animado/fuentes/).');
  return pg;
}
const run = (cmd, args, stdin) => new Promise((res, rej) => { const p = spawn(cmd, args, { stdio: [stdin ? 'pipe' : 'ignore', 'inherit', 'inherit'] }); p.on('exit', c => c === 0 ? res() : rej(new Error(cmd + ' salió con ' + c))); if (stdin) stdin(p); });

(async () => {
  const args = process.argv.slice(2);
  const b = await chromium.launch();
  try {
    if (args[0] === '--catalogo') {
      const pg = await b.newPage({ viewport: { width: 1800, height: 1200 } });
      await pg.goto('file://' + path.join(DIR, 'pagina.html'));
      const n = await pg.evaluate(() => {
        const ks = Object.keys(DIBUJOS);
        document.body.style.cssText = 'width:1800px;height:auto;overflow:visible;background:#fffdf5';
        document.getElementById('app').innerHTML = '<div style="display:grid;grid-template-columns:repeat(8,1fr);gap:10px;padding:16px">' + ks.map(k => `<div style="background:#fde68a;border-radius:14px;padding:8px;text-align:center;font:600 17px Poppins"><div class="stage" style="width:100%;height:170px" data-t0="0">${arte(k, {})}</div>${k}</div>`).join('') + '</div>';
        document.querySelectorAll('[data-a]').forEach(el => { el._a = el.dataset.a.split(';').map(x => { const [n, r] = x.split(':'); return [n.trim(), (r || '').split(',').map(Number)]; }); el._t0 = 0; el._op = parseFloat(el.getAttribute('opacity') || 1); el.style.transformBox = 'fill-box'; el.style.transformOrigin = el.dataset.o || 'center'; if (el._a.some(a => a[0] === 'draw')) { el._L = el.getTotalLength(); el.style.strokeDasharray = el._L; } anima(el, 3.3, 3.3); });
        return ks.length;
      });
      const out = path.join(DIR, 'catalogo.jpg');
      await pg.screenshot({ path: out, type: 'jpeg', quality: 85, fullPage: true });
      console.log(n + ' dibujos →', out); return;
    }
    const ficha = JSON.parse(fs.readFileSync(args[0], 'utf8')); validar(ficha);
    const pg = await abrir(b);
    const info = await pg.evaluate(([f, ic]) => window.montar(f, ic), [ficha, iconos(ficha)]);
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'reel-'));
    if (args.includes('--fotos')) {       // 0 s (portada) + un instante con todo en pantalla de cada escena
      const ts = [0, ...info.cortes.slice(0, -1).map((c, i) => c + (info.cortes[i + 1] - c) * .8)];
      const fl = [];
      for (const [i, t] of ts.entries()) { await pg.evaluate(t => window.render(t), t); const f = path.join(tmp, `f${i}.jpg`); await pg.screenshot({ path: f, type: 'jpeg', quality: 80 }); fl.push(f); }
      const out = args[args.indexOf('--fotos') + 1] || path.join(os.tmpdir(), `fotos-${ficha.slug}.jpg`);
      execFileSync('ffmpeg', ['-v', 'error', '-y', ...fl.flatMap(f => ['-i', f]), '-filter_complex', `hstack=${fl.length},scale=${Math.min(2000, 330 * fl.length)}:-1`, out]);
      console.log(out); return;
    }
    const partes = [];
    for (let s = 0; s < info.cortes.length - 1; s++) {      // un archivo por escena; luego se unen sin recodificar
      const parcial = path.join(tmp, `sc${s}.parcial.mp4`), fin = path.join(tmp, `sc${s}.mp4`);
      const f0 = Math.round(info.cortes[s] * FPS), f1 = Math.round(info.cortes[s + 1] * FPS);
      await run('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-', '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', String(FPS), parcial], async p => {
        for (let f = f0; f < f1; f++) { await pg.evaluate(t => window.render(t), f / FPS); const buf = await pg.screenshot({ type: 'jpeg', quality: 92 }); if (!p.stdin.write(buf)) await new Promise(r => p.stdin.once('drain', r)); }
        p.stdin.end();
      });
      fs.renameSync(parcial, fin); partes.push(fin);
    }
    const lista = path.join(tmp, 'lista.txt'); fs.writeFileSync(lista, partes.map(f => `file '${f}'`).join('\n'));
    const mudo = path.join(tmp, 'mudo.mp4'), wav = path.join(tmp, 'm.wav');
    await run('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lista, '-c', 'copy', mudo]);
    // Música original: semilla ≡ 2 (mód 3) → 120 pulsos/min, los cortes caen a compás
    const semilla = ficha.semilla || 2 + 3 * (Math.abs([...ficha.slug].reduce((a, c) => a * 31 + c.charCodeAt(0) | 0, 7)) % 40);
    let audio = wav;
    try { await run('python3', [path.join(REPO, 'tools', 'musica.py'), wav, String(semilla), String(info.total)]); }
    catch (e) {   // sin numpy/scipy: usa una de las pistas originales ya guardadas en music/
      audio = path.join(REPO, 'music', `pista-0${1 + semilla % 5}.m4a`);
      console.error('AVISO: tools/musica.py falló (' + e.message + '). Se usa ' + path.basename(audio) + '.');
    }
    const out = args[1] || path.join(REPO, 'reels', `${ficha.fecha}-${ficha.slug}.mp4`);
    const parcial = out.replace(/\.mp4$/, '.parcial.mp4');
    await run('ffmpeg', ['-v', 'error', '-y', '-i', mudo, '-i', audio, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-af', `volume=0.35,afade=t=out:st=${info.total - 1}:d=1`, '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', '-t', String(info.total), parcial]);
    fs.renameSync(parcial, out);
    console.log(`${out}  (${info.total} s, música semilla ${semilla})`);
  } finally { await b.close(); }
})().catch(e => { console.error(e.message); process.exit(1); });
