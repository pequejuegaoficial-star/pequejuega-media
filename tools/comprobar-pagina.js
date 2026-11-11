#!/usr/bin/env node
/* Comprueba la página de enlaces (docs/index.html) sin salir a internet: la abre en local y lista
   cada producto con su botón y su enlace. Uso: node tools/comprobar-pagina.js [ig|tt|yt]
   Sale con error si algún producto con ASIN no enlaza a amazon.es con el tag de la red. */
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const red = process.argv[2] || 'ig';
  const b = await chromium.launch(); const p = await b.newPage();
  const errores = []; p.on('pageerror', e => errores.push(e.message));
  await p.goto('file://' + path.join(__dirname, '..', 'docs', 'index.html') + '?r=' + red);
  const cartas = await p.$$eval('#lista .card', els => els.map(e => ({ id: e.id, clave: e.querySelector('.kw')?.textContent, titulo: e.querySelector('h2')?.textContent, boton: e.querySelector('.cta')?.textContent, enlace: e.getAttribute('href') })));
  const publi = await p.$eval('#aviso-publi', e => !e.hidden);
  await b.close();
  console.log(JSON.stringify({ red, avisoPublicidadVisible: publi, productos: cartas }, null, 1));
  const tag = { ig: 'pequejuega-ig-21', tt: 'pequejuega-tt-21', yt: 'pequejuega-yt-21' }[red] || 'pequejuega-21';
  for (const c of cartas) if (c.enlace && !(c.enlace.startsWith('https://www.amazon.es/dp/') && c.enlace.endsWith('tag=' + tag))) errores.push('Enlace incorrecto en ' + c.id + ': ' + c.enlace);
  if (!cartas.length) errores.push('La página no muestra ningún producto');
  if (errores.length) { console.error('ERRORES:\n' + errores.join('\n')); process.exit(1); }
})();
