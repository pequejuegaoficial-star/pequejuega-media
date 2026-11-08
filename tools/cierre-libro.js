// Escena final de venta para reels del embudo LIBRO (1080×1920).
// Uso en un guion basado en tools/plantilla-reel.js:
//   const { cierreLibro } = require('./cierre-libro');
//   scenes.push(cierreLibro());            // portada provisional dibujada en CSS
//   scenes.push(cierreLibro({ portadaUrl: 'file:///ruta/portada.png' }));  // cuando exista la portada real
// Reglas: el producto ya debe verse en los 3 primeros segundos del reel; esta escena
// solo cierra con UNA petición. Nada de "toca el enlace de abajo" (no es clicable).

const portadaCSS = `<div style="width:460px;height:610px;background:#7dd3fc;border:12px solid #1f2937;border-radius:18px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;transform:rotate(-4deg);box-shadow:20px 20px 0 #1f2937"><div style="font-size:40px;font-weight:700;letter-spacing:2px">MI PRIMER LIBRO</div><div style="font-size:96px;font-weight:700;line-height:1;color:#fff;-webkit-text-stroke:5px #1f2937">para<br>colorear</div><div style="background:#fff;border:6px solid #1f2937;border-radius:999px;padding:6px 28px;font-size:44px;font-weight:700">1–3 años</div></div>`;

function cierreLibro({ portadaUrl = null, fondo = '#fca5a5', palabra = 'LIBRO' } = {}) {
  const portada = portadaUrl
    ? `<img src="${portadaUrl}" style="width:460px;transform:rotate(-4deg);border:12px solid #1f2937;border-radius:18px;box-shadow:20px 20px 0 #1f2937">`
    : portadaCSS;
  const inner = `<div style="background:#1f2937;color:#fff;font-size:44px;font-weight:700;padding:14px 32px;border-radius:14px;letter-spacing:3px">NUESTRO CUADERNO</div>${portada}<div style="font-size:80px;font-weight:700;line-height:1.1;white-space:nowrap">Comenta <span style="background:#86efac;border:8px solid #1f2937;border-radius:22px;padding:0 24px;display:inline-block">${palabra}</span> 👇</div><div style="font-size:56px;font-weight:500;line-height:1.3">y te lo mando<br>o búscalo en el enlace del perfil</div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0}*{box-sizing:border-box}</style></head><body><div style="width:1080px;height:1920px;background:${fondo};font-family:Poppins;color:#1f2937;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:150px 80px 300px;gap:60px;text-align:center">${inner}</div></body></html>`;
}

module.exports = { cierreLibro };

// Vista previa: node tools/cierre-libro.js → cierre-libro.png
if (require.main === module) {
  const { chromium } = require('playwright');
  (async () => {
    const b = await chromium.launch();
    const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
    await p.setContent(cierreLibro());
    await p.waitForTimeout(200);
    await p.screenshot({ path: 'cierre-libro.png' });
    await b.close();
  })();
}
