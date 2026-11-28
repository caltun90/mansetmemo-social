// Toplu kart cizimi (tek tarayici oturumu).
// Kullanim: node kart/toplu.js kartlar.json
// kartlar.json: [{"dosya":"kartlar/2026-11-24/konu.jpg","manset":"...","etiket":"GÜNDEM","kaynak":"AA","tarih":"24 Kasım","ifade":"mutlu"}, ...]
const path = require('path'), fs = require('fs');
let pw; try { pw = require('playwright'); } catch (e) { pw = require('playwright-core'); }
(async () => {
  const liste = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const exe = process.env.CHROME || ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(p => fs.existsSync(p));
  const b = await pw.chromium.launch({ executablePath: exe, args: ['--allow-file-access-from-files'] });
  const p = await b.newPage();
  p.on('pageerror', e => console.error('pageerror:', e.message));
  for (const d of liste) {
    await p.goto('file://' + path.join(__dirname, 'kart.html'));
    await p.waitForFunction(() => window.READY === true);
    await p.evaluate(d => window.ciz(d), d);
    const u = await p.evaluate(() => document.getElementById('c').toDataURL('image/jpeg', 0.86));
    fs.mkdirSync(path.dirname(d.dosya), { recursive: true });
    fs.writeFileSync(d.dosya, Buffer.from(u.split(',')[1], 'base64'));
    console.log('kart:', d.dosya, Math.round(fs.statSync(d.dosya).size / 1024) + ' KB');
  }
  await b.close();
})();
