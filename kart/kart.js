// Kullanim: node kart/kart.js '<json>' cikti.png
// json: {"manset": "...", "etiket": "GÜNDEM", "kaynak": "AA", "tarih": "24 Kasım", "ifade": "mutlu"}
// Playwright yoksa: npm i playwright-core ; Chrome yolu: CHROME env ya da /usr/bin/google-chrome
const path = require('path'), fs = require('fs');
let pw; try { pw = require('playwright'); } catch (e) { pw = require('playwright-core'); }
(async () => {
  const d = JSON.parse(process.argv[2]); const out = process.argv[3];
  const exe = process.env.CHROME || ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(p => fs.existsSync(p));
  const b = await pw.chromium.launch({ executablePath: exe, args: ['--allow-file-access-from-files'] });
  const p = await b.newPage();
  p.on('pageerror', e => console.error('pageerror:', e.message));
  await p.goto('file://' + path.join(__dirname, 'kart.html'));
  await p.waitForFunction(() => window.READY === true);
  await p.evaluate(d => window.ciz(d), d);
  const u = await p.evaluate(() => document.getElementById('c').toDataURL('image/jpeg', 0.86));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(u.split(',')[1], 'base64'));
  await b.close(); console.log('kart:', out);
})();
