// Kullanim: node render.js <bulten_klasoru> still 0,1.5,20   |   node render.js <klasor> video [parca] [parca_sayisi]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
(async () => {
  const dir = path.resolve(process.argv[2]), mode = process.argv[3] || 'still';
  const data = JSON.parse(fs.readFileSync(dir + '/anim.json', 'utf8')); data.b = JSON.parse(fs.readFileSync(dir + '/bulten.json', 'utf8'));
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('pageerror:', e.message));
  await p.goto('file://' + __dirname + '/bulten.html'); await p.waitForFunction(() => window.READY === true);
  await p.evaluate(d => { D = d; }, data);
  const grab = async t => Buffer.from((await p.evaluate(t => { draw(t); return document.getElementById('c').toDataURL('image/jpeg', 0.9); }, t)).split(',')[1], 'base64');
  if (mode === 'still') {
    fs.mkdirSync(dir + '/chk', { recursive: true });
    for (const t of (process.argv[4] || '0').split(',').map(Number)) fs.writeFileSync(`${dir}/chk/k_${t}.jpg`, await grab(t));
  } else {
    const part = +(process.argv[4] || 0), parts = +(process.argv[5] || 1), n = Math.ceil(data.dur * data.fps);
    const a = Math.floor(n * part / parts), z = Math.floor(n * (part + 1) / parts);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(data.fps), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p', `${dir}/parca_${part}.mp4`]);
    ff.stderr.on('data', d => process.stderr.write(d));
    const t0 = Date.now();
    for (let i = a; i < z; i++) {
      const buf = await grab(i / data.fps);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if ((i - a) % 300 === 0) console.log('parca', part, 'kare', i - a, '/', z - a, Math.round((Date.now() - t0) / 1000) + 's');
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await b.close(); console.log('ok');
})();
