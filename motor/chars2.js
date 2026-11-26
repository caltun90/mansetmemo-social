// Saha muhabirleri: Piyasa Pinar (ekonomi), Semsiye Senol (hava ve sehir), Tribun Tarik (spor).
// memo.js ve chars.js'ten sonra yuklenir. Govde drawChar ile ortak.

function gEye(ctx, ex, ey, f, side, skin, o = {}) {
  const e = f.expr, lx = (f.look || [0, 0])[0], ly = (f.look || [0, 0])[1];
  ctx.lineCap = 'round';
  if (e === 'kahkaha' || f.blink >= 1) {
    ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(ex - 16, ey + 5); ctx.quadraticCurveTo(ex, ey - 16, ex + 16, ey + 5); ctx.stroke(); return;
  }
  const big = e === 'sok', rx = (big ? 23 : 20) * (o.s || 1), ry = (big ? 29 : 25) * (o.s || 1), pr = big ? 6 : 10;
  memoEllipse(ctx, ex, ey, rx, ry, 0, '#fff', INK, 5);
  const px = ex + lx * 7, py = ey + ly * 7 + (big ? 0 : 3);
  memoCircle(ctx, px, py, pr, INK); memoCircle(ctx, px - 3, py - 4, pr * 0.35, '#fff');
  if (e === 'ciddi') {
    ctx.save(); ctx.beginPath(); ctx.ellipse(ex, ey, rx - 2, ry - 2, 0, 0, 7); ctx.clip(); ctx.fillStyle = skin; ctx.fillRect(ex - 30, ey - 40, 60, ry * 0.75 + 12); ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(ex - rx + 2, ey - ry * 0.35); ctx.lineTo(ex + rx - 2, ey - ry * 0.35); ctx.stroke();
    memoEllipse(ctx, ex, ey, rx, ry, 0, null, INK, 5);
  }
  if (o.lash) { ctx.strokeStyle = INK; ctx.lineWidth = 4; for (let k = 0; k < 2; k++) { const a = -0.9 + k * 0.4; const sx = ex + side * Math.cos(a) * rx, sy = ey + Math.sin(a) * ry; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + side * 9, sy - 7); ctx.stroke(); } }
}
function gBrows(ctx, f, y0, w, thick) {
  const B = { mutlu: -2, normal: 0, sok: -12, ciddi: 4, kahkaha: -5 }[f.expr] || 0;
  ctx.strokeStyle = INK; ctx.lineWidth = thick || 7; ctx.lineCap = 'round';
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 16, y0 + B + (f.expr === 'ciddi' ? 5 : 0)); ctx.quadraticCurveTo(s * (16 + w / 2), y0 - 9 + B, s * (16 + w), y0 - 2 + B); ctx.stroke(); }
}
function gMouth(ctx, f, top, lip, gap) {
  const e = f.expr; let m = f.mouth != null ? f.mouth : (e === 'kahkaha' ? 1 : e === 'ciddi' ? 0 : 0.45);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (e === 'sok') { memoEllipse(ctx, 0, top + 14, 13, 17, 0, '#8E1F35', lip || INK, 6); return; }
  if (m < 0.08) { ctx.strokeStyle = lip || INK; ctx.lineWidth = 7; ctx.beginPath(); if (e === 'ciddi') { ctx.moveTo(-18, top + 10); ctx.quadraticCurveTo(0, top + 7, 18, top + 10); } else { ctx.moveTo(-24, top + 4); ctx.quadraticCurveTo(0, top + 20, 24, top + 4); } ctx.stroke(); return; }
  const W = 28 + 7 * m, H = 12 + 36 * m; const p = new Path2D();
  p.moveTo(-W, top); p.quadraticCurveTo(0, top - 5, W, top); p.bezierCurveTo(W * 0.6, top + H, -W * 0.6, top + H, -W, top); p.closePath();
  ctx.fillStyle = '#8E1F35'; ctx.fill(p); ctx.save(); ctx.clip(p);
  ctx.fillStyle = '#fff'; ctx.fillRect(-W, top - 8, W * 2, 13);
  if (gap) { ctx.fillStyle = '#8E1F35'; ctx.fillRect(-3, top - 8, 6, 14); }
  memoEllipse(ctx, 4, top + H * 0.8, 14 + 4 * m, 8 + 5 * m, 0, '#FF7A93'); ctx.restore();
  ctx.strokeStyle = lip || INK; ctx.lineWidth = lip ? 7 : 6; ctx.stroke(p);
}

// ---------- Piyasa Pinar (ekonomi) ----------
const PINAR = { skin: '#FFCFB8', hair: '#243B8C', hairHi: '#3B5BD9', torso: '#22C55E', torsoDark: '#15964A', shoe: '#243B8C', lip: '#E11D48', mic: '#22C55E', set: '#1E2235' };
function pinarHead(ctx, cx, cy, f) {
  const R = 100; ctx.save(); ctx.translate(cx, cy); ctx.rotate((f.tilt || 0) * Math.PI / 180); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // kakullu kisa kesim sac (arka kisim)
  ctx.beginPath(); ctx.moveTo(-118, 70); ctx.bezierCurveTo(-132, -40, -90, -128, 0, -128); ctx.bezierCurveTo(90, -128, 132, -40, 118, 70);
  ctx.quadraticCurveTo(100, 92, 78, 74); ctx.lineTo(-78, 74); ctx.quadraticCurveTo(-100, 92, -118, 70); ctx.closePath();
  ctx.fillStyle = PINAR.hair; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.stroke();
  // kafa
  memoCircle(ctx, 0, 6, R - 4, PINAR.skin, INK, 8);
  // kakul
  ctx.beginPath(); ctx.moveTo(-100, -10); ctx.bezierCurveTo(-96, -90, -40, -112, 10, -104); ctx.bezierCurveTo(60, -100, 98, -70, 100, -14);
  ctx.bezierCurveTo(80, -40, 60, -46, 40, -42); ctx.lineTo(28, -58); ctx.lineTo(12, -42); ctx.lineTo(-6, -58); ctx.lineTo(-22, -42); ctx.lineTo(-40, -56); ctx.lineTo(-58, -40); ctx.bezierCurveTo(-80, -40, -92, -28, -100, -10); ctx.closePath();
  ctx.fillStyle = PINAR.hair; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke();
  ctx.strokeStyle = PINAR.hairHi; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-60, -84); ctx.quadraticCurveTo(-20, -100, 20, -94); ctx.stroke();
  // kulaklik
  ctx.strokeStyle = INK; ctx.lineWidth = 13; ctx.beginPath(); ctx.arc(0, -8, 118, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
  ctx.strokeStyle = PINAR.set; ctx.lineWidth = 7; ctx.stroke();
  memoEllipse(ctx, -110, 8, 20, 28, 0, PINAR.set, INK, 5); memoEllipse(ctx, 110, 8, 20, 28, 0, PINAR.set, INK, 5);
  ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-104, 28); ctx.quadraticCurveTo(-96, 70, -48, 74); ctx.stroke();
  memoCircle(ctx, -44, 74, 9, RED_P(), INK, 4);
  // yanak, goz, kas, burun, agiz
  memoCircle(ctx, -60, 30, 14, 'rgba(255, 92, 130, 0.45)'); memoCircle(ctx, 60, 30, 14, 'rgba(255, 92, 130, 0.45)');
  gEye(ctx, -34, -6, f, -1, PINAR.skin, { lash: true }); gEye(ctx, 34, -6, f, 1, PINAR.skin, { lash: true });
  gBrows(ctx, f, -42, 34, 6);
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-2, 22); ctx.quadraticCurveTo(10, 34, -4, 38); ctx.stroke();
  gMouth(ctx, f, 50, PINAR.lip);
  ctx.restore();
}
function RED_P() { return '#FF3B5C'; }
const CH_PINAR = {
  name: 'Piyasa Pınar', tag: 'Ekonomi muhabiri · kulaklıklı, tabletli', beat: 'EKONOMİ',
  torso: PINAR.torso, torsoDark: PINAR.torsoDark, shoe: PINAR.shoe, mic: PINAR.mic, micLabel: 'SAHA', hand: PINAR.skin, head: pinarHead,
  pal: [PINAR.skin, PINAR.hair, PINAR.torso, PINAR.set, '#FFD23F', '#FF3B5C'],
  neck(ctx) { for (let k = -3; k <= 3; k++) memoCircle(ctx, k * 9, -352 + Math.abs(k) * -2.2 + 8, 5, '#fff', INK, 2.5); },
  prop(ctx, h) {   // tablet: yukselen grafik
    ctx.save(); ctx.translate(h[0] + 18, h[1] - 40); ctx.rotate(0.12);
    ctx.beginPath(); ctx.roundRect(-10, -50, 110, 80, 10); ctx.fillStyle = '#1E2235'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
    ctx.beginPath(); ctx.roundRect(-2, -42, 94, 64, 6); ctx.fillStyle = '#F0FDF4'; ctx.fill();
    ctx.strokeStyle = '#22C55E'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(6, 12); ctx.lineTo(28, -2); ctx.lineTo(44, 6); ctx.lineTo(78, -30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(66, -32); ctx.lineTo(80, -32); ctx.lineTo(80, -18); ctx.stroke();
    ctx.restore();
    memoCircle(ctx, h[0], h[1], 16, PINAR.skin, INK, 6);
  },
  propPose: { la: [-40, -150], ra: [40, 150], ll: [-12, -6], rl: [12, 6], mic: 'la' }
};

// ---------- Semsiye Senol (hava ve sehir) ----------
const SENOL = { skin: '#C9E8FF', coat: '#FFD23F', coatDark: '#E0B400', boot: '#FFD23F', umb: '#FF3B5C', mic: '#3B82F6' };
function senolHead(ctx, cx, cy, f) {
  const R = 100; ctx.save(); ctx.translate(cx, cy); ctx.rotate((f.tilt || 0) * Math.PI / 180); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // yagmurluk kapusonu (kafanin arkasinda ve cevresinde)
  ctx.beginPath(); ctx.moveTo(-122, 90); ctx.bezierCurveTo(-150, -60, -80, -150, 0, -150); ctx.bezierCurveTo(80, -150, 150, -60, 122, 90); ctx.quadraticCurveTo(0, 118, -122, 90); ctx.closePath();
  ctx.fillStyle = SENOL.coat; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.stroke();
  ctx.strokeStyle = SENOL.coatDark; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-108, 40); ctx.bezierCurveTo(-124, -60, -60, -128, 0, -130); ctx.stroke();
  // kafa
  memoCircle(ctx, 0, 6, R - 8, SENOL.skin, INK, 8);
  // kapuson bagcigi
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-40, 96); ctx.lineTo(-46, 128); ctx.moveTo(40, 96); ctx.lineTo(46, 128); ctx.stroke();
  memoCircle(ctx, -46, 132, 7, '#fff', INK, 4); memoCircle(ctx, 46, 132, 7, '#fff', INK, 4);
  // yanaklar (usumus pembe), gozler, kaslar
  memoCircle(ctx, -58, 34, 15, 'rgba(255, 92, 130, 0.5)'); memoCircle(ctx, 58, 34, 15, 'rgba(255, 92, 130, 0.5)');
  gEye(ctx, -32, -2, f, -1, SENOL.skin, { s: 1.05 }); gEye(ctx, 32, -2, f, 1, SENOL.skin, { s: 1.05 });
  gBrows(ctx, f, -40, 32, 8);
  // kirmizi usumus burun
  memoCircle(ctx, 0, 26, 14, '#FF6B6B', INK, 5); memoCircle(ctx, -4, 21, 4, 'rgba(255,255,255,0.7)');
  // kecisakal
  gMouth(ctx, f, 52);
  ctx.beginPath(); ctx.moveTo(-10, 88); ctx.quadraticCurveTo(0, 108, 10, 88); ctx.fillStyle = '#5A3420'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
  ctx.restore();
}
const CH_SENOL = {
  name: 'Şemsiye Şenol', tag: 'Hava ve şehir muhabiri · yağmurluklu', beat: 'HAVA · ŞEHİR',
  torso: SENOL.coat, torsoDark: SENOL.coatDark, shoe: SENOL.boot, mic: SENOL.mic, micLabel: 'SAHA', hand: SENOL.skin, head: senolHead,
  pal: [SENOL.skin, SENOL.coat, SENOL.umb, SENOL.mic, '#5A3420', '#1E2235'],
  neck(ctx) { memoCircle(ctx, 0, -320, 6, '#fff', INK, 3); memoCircle(ctx, 0, -290, 6, '#fff', INK, 3); memoCircle(ctx, 0, -260, 6, '#fff', INK, 3); },
  prop(ctx, h) {   // ters donmus semsiye
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(h[0], h[1] + 20); ctx.lineTo(h[0] + 8, h[1] - 210); ctx.stroke();
    ctx.beginPath(); ctx.arc(h[0] - 10, h[1] + 20, 10, 0, Math.PI); ctx.stroke();
    const tx = h[0] + 8, ty = h[1] - 210, W = 95;
    ctx.save(); ctx.translate(tx, ty); ctx.rotate(0.18);
    ctx.beginPath(); ctx.moveTo(-W, -56); ctx.quadraticCurveTo(-W / 2, -8, 0, 0); ctx.quadraticCurveTo(W / 2, -8, W, -56);
    ctx.quadraticCurveTo(W * 0.66, -32, W * 0.33, -50); ctx.quadraticCurveTo(W * 0.16, -24, 0, -46); ctx.quadraticCurveTo(-W * 0.16, -24, -W * 0.33, -50); ctx.quadraticCurveTo(-W * 0.66, -32, -W, -56); ctx.closePath();
    ctx.fillStyle = SENOL.umb; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke(); ctx.restore();
    // yagmur damlalari
    ctx.fillStyle = '#60A5FA';
    for (const [dx, dy] of [[-150, -150], [-110, -60], [120, -120], [150, -20], [-170, 20], [90, -230]]) {
      ctx.beginPath(); ctx.moveTo(h[0] + dx, h[1] + dy - 16); ctx.quadraticCurveTo(h[0] + dx + 9, h[1] + dy, h[0] + dx, h[1] + dy + 4); ctx.quadraticCurveTo(h[0] + dx - 9, h[1] + dy, h[0] + dx, h[1] + dy - 16); ctx.fill(); }
    ctx.restore();
    memoCircle(ctx, h[0], h[1], 16, SENOL.skin, INK, 6);
  },
  propPose: { la: [-40, -150], ra: [100, 150], ll: [-12, -6], rl: [12, 6], mic: 'la' }
};

// ---------- Tribun Tarik (spor) ----------
const TARIK = { skin: '#F2B48C', cap: '#14B8A6', capDark: '#0E8F82', torso: '#F97316', torsoDark: '#C2570C', shoe: '#14B8A6', mic: '#F97316' };
function tarikHead(ctx, cx, cy, f) {
  const R = 100; ctx.save(); ctx.translate(cx, cy); ctx.rotate((f.tilt || 0) * Math.PI / 180); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  for (const s of [-1, 1]) memoEllipse(ctx, s * 97, 12, 18, 23, 0, TARIK.skin, INK, 6);
  memoCircle(ctx, 0, 0, R, TARIK.skin, INK, 9);
  // ters kasket
  ctx.beginPath(); ctx.moveTo(-98, -18); ctx.bezierCurveTo(-96, -110, 96, -110, 98, -18); ctx.quadraticCurveTo(0, -40, -98, -18); ctx.closePath();
  ctx.fillStyle = TARIK.cap; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(60, -40); ctx.quadraticCurveTo(120, -46, 138, -20); ctx.quadraticCurveTo(110, -8, 86, -22); ctx.closePath(); ctx.fillStyle = TARIK.capDark; ctx.fill(); ctx.stroke();
  memoCircle(ctx, 0, -92, 9, TARIK.capDark, INK, 4);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-60, -70); ctx.quadraticCurveTo(-20, -86, 20, -82); ctx.stroke();
  // ter bandi yerine sakal golgesi noktalari
  ctx.fillStyle = 'rgba(90,52,32,0.35)'; for (let k = 0; k < 14; k++) { const a = Math.PI * (0.2 + 0.6 * k / 13); memoCircle(ctx, Math.cos(a) * 70, 20 + Math.sin(a) * 58, 2.5, 'rgba(90,52,32,0.4)'); }
  memoCircle(ctx, -62, 26, 14, 'rgba(255, 92, 130, 0.4)'); memoCircle(ctx, 62, 26, 14, 'rgba(255, 92, 130, 0.4)');
  gEye(ctx, -33, -4, f, -1, TARIK.skin); gEye(ctx, 33, -4, f, 1, TARIK.skin);
  // kalin tek kas
  const B = { mutlu: -2, sok: -12, ciddi: 5, kahkaha: -5 }[f.expr] || 0;
  ctx.strokeStyle = '#3B2A20'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(-56, -38 + B); ctx.quadraticCurveTo(0, -50 + B - (f.expr === 'ciddi' ? -10 : 0), 56, -38 + B); ctx.stroke();
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-4, 20); ctx.quadraticCurveTo(14, 34, -2, 40); ctx.stroke();
  gMouth(ctx, f, 54, null, true);
  ctx.restore();
}
const CH_TARIK = {
  name: 'Tribün Tarık', tag: 'Spor muhabiri · kasketli, düdüklü', beat: 'SPOR',
  torso: TARIK.torso, torsoDark: TARIK.torsoDark, shoe: TARIK.shoe, mic: TARIK.mic, micLabel: 'SAHA', hand: TARIK.skin, head: tarikHead,
  pal: [TARIK.skin, TARIK.cap, TARIK.torso, '#FFFFFF', '#3B2A20', '#FFD23F'],
  neck(ctx) {   // dudu ipi + duduk
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-14, -360); ctx.lineTo(0, -310); ctx.lineTo(14, -360); ctx.stroke();
    ctx.save(); ctx.translate(0, -300); ctx.beginPath(); ctx.roundRect(-14, -8, 32, 18, 8); ctx.fillStyle = '#FFD23F'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke(); memoCircle(ctx, -4, 1, 4, INK); ctx.restore();
  },
  prop(ctx, h) {   // kol bandi yerine top
    ctx.save(); ctx.translate(h[0] + 6, h[1] - 34); memoCircle(ctx, 0, 0, 30, '#fff', INK, 5);
    ctx.fillStyle = INK; ctx.beginPath(); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 - Math.PI / 2; ctx.lineTo(Math.cos(a) * 11, Math.sin(a) * 11); } ctx.closePath(); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 3; for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 - Math.PI / 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 11, Math.sin(a) * 11); ctx.lineTo(Math.cos(a) * 27, Math.sin(a) * 27); ctx.stroke(); }
    ctx.restore(); memoCircle(ctx, h[0], h[1], 16, TARIK.skin, INK, 6);
  },
  propPose: { la: [-40, -150], ra: [70, 165], ll: [-12, -6], rl: [16, 10], mic: 'la' }
};

// ---------- Siyasi Sinasi (siyaset ve yargi) ----------
// Renkler bilincli olarak hicbir partiyi cagristirmaz: lacivert takim, gri, camgobegi kravat.
const SINASI = { skin: '#F1C27D', hair: '#3F4654', hairHi: '#9CA3AF', torso: '#1E3A8A', torsoDark: '#172554', tie: '#0EA5E9', shoe: '#334155', mic: '#0EA5E9', frame: '#1E2235' };
function sinasiHead(ctx, cx, cy, f) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate((f.tilt || 0) * Math.PI / 180); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  for (const s of [-1, 1]) memoEllipse(ctx, s * 96, 10, 17, 22, 0, SINASI.skin, INK, 6);
  memoCircle(ctx, 0, 0, 100, SINASI.skin, INK, 9);
  // yandan ayrilmis duzgun sac, kirlasmis favoriler
  ctx.beginPath(); ctx.moveTo(-98, -6); ctx.bezierCurveTo(-104, -96, -30, -122, 20, -112); ctx.bezierCurveTo(70, -104, 104, -70, 98, -8);
  ctx.bezierCurveTo(88, -40, 70, -58, 40, -62); ctx.lineTo(-10, -66); ctx.bezierCurveTo(-50, -64, -80, -48, -98, -6); ctx.closePath();
  ctx.fillStyle = SINASI.hair; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.stroke();
  ctx.strokeStyle = SINASI.hairHi; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-30, -108); ctx.quadraticCurveTo(-36, -84, -26, -66); ctx.stroke();   // ayrik cizgisi
  for (const s of [-1, 1]) { ctx.fillStyle = SINASI.hairHi; ctx.beginPath(); ctx.moveTo(s * 98, -6); ctx.quadraticCurveTo(s * 102, 14, s * 92, 26); ctx.lineTo(s * 86, -4); ctx.closePath(); ctx.fill(); }
  memoCircle(ctx, -60, 30, 13, 'rgba(255, 92, 130, 0.35)'); memoCircle(ctx, 60, 30, 13, 'rgba(255, 92, 130, 0.35)');
  gEye(ctx, -34, -4, f, -1, SINASI.skin); gEye(ctx, 34, -4, f, 1, SINASI.skin);
  // gozluk
  ctx.strokeStyle = SINASI.frame; ctx.lineWidth = 6;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.roundRect(s * 34 - 30, -30, 60, 50, 12); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-4, -8); ctx.quadraticCurveTo(0, -14, 4, -8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-64, -12); ctx.lineTo(-92, -16); ctx.moveTo(64, -12); ctx.lineTo(92, -16); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 34 - 18, -24); ctx.lineTo(s * 34 - 6, -24); ctx.lineTo(s * 34 - 20, 8); ctx.closePath(); ctx.fill(); }
  // kalin kaslar, sag kas hep biraz kalkik (soru soran muhabir bakisi)
  const B = { mutlu: -2, normal: 0, sok: -12, ciddi: 3, kahkaha: -5 }[f.expr] || 0;
  ctx.strokeStyle = INK; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(-60, -40 + B); ctx.quadraticCurveTo(-36, -50 + B, -12, -42 + B); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(12, -48 + B); ctx.quadraticCurveTo(36, -62 + B, 60, -50 + B); ctx.stroke();
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-2, 22); ctx.quadraticCurveTo(12, 36, -4, 40); ctx.stroke();
  gMouth(ctx, f, 56);
  ctx.strokeStyle = 'rgba(30,34,53,0.35)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 92, 8, 0.2, Math.PI - 0.2); ctx.stroke();   // cene gamzesi
  ctx.restore();
}
const CH_SINASI = {
  name: 'Siyasi Şinasi', tag: 'Siyaset ve yargı muhabiri · gözlüklü, basın kartlı', beat: 'SİYASET',
  torso: SINASI.torso, torsoDark: SINASI.torsoDark, shoe: SINASI.shoe, mic: SINASI.mic, micLabel: 'SAHA', hand: SINASI.skin, head: sinasiHead,
  pal: [SINASI.skin, SINASI.hair, SINASI.torso, SINASI.tie, '#E2E8F0', SINASI.frame],
  neck(ctx) {
    // gomlek yakasi, kravat, basin karti
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, -352); ctx.lineTo(s * 26, -364); ctx.lineTo(s * 20, -336); ctx.closePath(); ctx.fillStyle = '#F8FAFC'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-7, -350); ctx.lineTo(7, -350); ctx.lineTo(9, -300); ctx.lineTo(0, -288); ctx.lineTo(-9, -300); ctx.closePath(); ctx.fillStyle = SINASI.tie; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
    ctx.strokeStyle = '#E11D48'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-18, -360); ctx.lineTo(-24, -300); ctx.stroke();
    ctx.save(); ctx.translate(-26, -292); ctx.rotate(0.08); ctx.beginPath(); ctx.roundRect(-16, -2, 32, 40, 5); ctx.fillStyle = '#F8FAFC'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#E11D48'; ctx.fillRect(-14, 0, 28, 9); ctx.fillStyle = INK; ctx.font = '700 9px Poppins'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('BASIN', 0, 22); ctx.restore();
  },
  prop(ctx, h) {   // not defteri ve kalem
    ctx.save(); ctx.translate(h[0] + 10, h[1] - 44); ctx.rotate(0.14);
    ctx.beginPath(); ctx.roundRect(-30, -46, 64, 84, 6); ctx.fillStyle = '#FDE68A'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = INK; for (let k = 0; k < 5; k++) memoCircle(ctx, -22 + k * 12, -46, 3.5, INK);
    ctx.strokeStyle = '#64748B'; ctx.lineWidth = 3; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-20, -26 + k * 16); ctx.lineTo(k % 2 ? 10 : 22, -26 + k * 16); ctx.stroke(); }
    ctx.restore();
    ctx.save(); ctx.translate(h[0] + 34, h[1] - 70); ctx.rotate(-0.6); ctx.beginPath(); ctx.roundRect(-4, -40, 9, 52, 3); ctx.fillStyle = '#0EA5E9'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
    memoCircle(ctx, h[0], h[1], 16, SINASI.skin, INK, 6);
  },
  propPose: { la: [-40, -150], ra: [60, 150], ll: [-12, -6], rl: [12, 6], mic: 'la' }
};
