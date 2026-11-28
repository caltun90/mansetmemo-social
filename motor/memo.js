// Manset Memo: ana haber bulteni spikeri. Canvas 2D ile cizilir, animasyonda da ayni fonksiyon kullanilir.
// Koordinatlar: (x, y) ayaklarin ortasi, s olcek. Acilar derece: 0 = asagi, 90 = ekranda saga, -90 = sola, 180 = yukari.
const MEMO = {
  ink: '#1E2235', skin: '#FFD23F', hair: '#FF6B35', torso: '#14B8A6', torsoDark: '#0E8F82',
  tie: '#FF3B5C', shoe: '#FF3B5C', nose: '#FF8A65', stache: '#5A3420', mouth: '#8E1F35',
  tongue: '#FF7A93', cheek: 'rgba(255, 92, 130, 0.42)', mic: '#7C5CFF', micHead: '#D5DAE3', micHandle: '#3A3F58'
};

const MEMO_POSES = {
  sunuyor: { la: [-40, -150], ra: [90, 140], ll: [-12, -6], rl: [14, 8], mic: 'la' },
  sok:     { la: [-105, -150], ra: [105, 150], ll: [-16, -10], rl: [16, 10], mic: null },
  kahkaha: { la: [-35, 60], ra: [35, -60], ll: [-14, -8], rl: [14, 8], mic: null },
  ciddi:   { la: [-15, -8], ra: [82, 88], ll: [-10, -6], rl: [10, 6], mic: 'la' },
  konusma: { la: [-45, 60], ra: [55, 105], ll: [-12, -6], rl: [12, 6], mic: 'la', micFront: true },
};

function memoDir(a) { const r = a * Math.PI / 180; return [Math.sin(r), Math.cos(r)]; }

function memoLimb(ctx, p0, a1, l1, a2, l2) {
  const d1 = memoDir(a1), p1 = [p0[0] + d1[0] * l1, p0[1] + d1[1] * l1];
  const d2 = memoDir(a2), p2 = [p1[0] + d2[0] * l2, p1[1] + d2[1] * l2];
  ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
  return { p1, p2 };
}

function memoCircle(ctx, x, y, r, fill, stroke, w) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = w; ctx.stroke(); }
}

function memoEllipse(ctx, x, y, rx, ry, rot, fill, stroke, w) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = w; ctx.stroke(); }
}

function memoMic(ctx, hand, ang) {
  // ang: mikrofonun yukari dogru egimi (derece, 0 = dik)
  ctx.save(); ctx.translate(hand[0], hand[1]); ctx.rotate(ang * Math.PI / 180);
  ctx.lineCap = 'round';
  ctx.strokeStyle = MEMO.ink; ctx.lineWidth = 24; ctx.beginPath(); ctx.moveTo(0, 24); ctx.lineTo(0, -58); ctx.stroke();
  ctx.strokeStyle = MEMO.micHandle; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(0, 24); ctx.lineTo(0, -58); ctx.stroke();
  // bayrak kup
  ctx.beginPath(); ctx.roundRect(-30, -62, 60, 30, 6); ctx.fillStyle = MEMO.mic; ctx.fill();
  ctx.strokeStyle = MEMO.ink; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = '700 15px Poppins'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('HABER', 0, -46);
  // kafa
  memoCircle(ctx, 0, -86, 24, MEMO.micHead, MEMO.ink, 6);
  ctx.save(); ctx.beginPath(); ctx.arc(0, -86, 21, 0, Math.PI * 2); ctx.clip();
  ctx.strokeStyle = 'rgba(30,34,53,0.35)'; ctx.lineWidth = 2;
  for (let i = -30; i <= 30; i += 9) { ctx.beginPath(); ctx.moveTo(i, -112); ctx.lineTo(i + 20, -60); ctx.stroke(); ctx.beginPath(); ctx.moveTo(i, -112); ctx.lineTo(i - 20, -60); ctx.stroke(); }
  ctx.restore();
  memoCircle(ctx, -8, -94, 5, 'rgba(255,255,255,0.8)');
  ctx.restore();
}

function memoShoe(ctx, foot, side) {
  const cx = foot[0] + side * 16, cy = foot[1] - 4;
  memoEllipse(ctx, cx, cy, 32, 17, 0, MEMO.shoe, MEMO.ink, 6);
  ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, 29, 14, 0, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = '#fff'; ctx.fillRect(cx - 40, cy + 6, 80, 12); ctx.restore();
  memoEllipse(ctx, cx, cy, 32, 17, 0, null, MEMO.ink, 6);
  memoCircle(ctx, cx + side * 10, cy - 6, 3.5, '#fff');
}

function memoBrow(ctx, side, inner, outer, lift) {
  ctx.beginPath();
  ctx.moveTo(side * 16, -64 + lift + inner);
  ctx.quadraticCurveTo(side * 37, -78 + lift, side * 58, -64 + lift + outer);
  ctx.stroke();
}

function memoEye(ctx, ex, ey, f, side) {
  const e = f.expr, lx = (f.look || [0, 0])[0], ly = (f.look || [0, 0])[1];
  if (e === 'kahkaha' || (e === 'goz' && side > 0) || f.blink >= 1) {
    ctx.strokeStyle = MEMO.ink; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(ex - 20, ey + 6); ctx.quadraticCurveTo(ex, ey - 22, ex + 20, ey + 6); ctx.stroke();
    return;
  }
  const big = e === 'sok';
  const rx = big ? 30 : 27, ry = big ? 39 : 33;
  memoEllipse(ctx, ex, ey, rx, ry, 0, '#fff', MEMO.ink, 6);
  const pr = big ? 8 : 12;
  const px = ex + lx * 9, py = ey + ly * 9 + (big ? 0 : 3);
  memoCircle(ctx, px, py, pr, MEMO.ink);
  memoCircle(ctx, px - pr * 0.35, py - pr * 0.4, pr * 0.33, '#fff');
  if (e === 'ciddi') {   // yari kapali goz kapagi
    ctx.save(); ctx.beginPath(); ctx.ellipse(ex, ey, rx - 3, ry - 3, 0, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = MEMO.skin; ctx.fillRect(ex - 40, ey - 50, 80, 38); ctx.restore();
    ctx.strokeStyle = MEMO.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(ex - rx + 2, ey - 12); ctx.lineTo(ex + rx - 2, ey - 12); ctx.stroke();
    memoEllipse(ctx, ex, ey, rx, ry, 0, null, MEMO.ink, 6);
  }
}

function memoMouth(ctx, f) {
  const e = f.expr;
  let m = f.mouth != null ? f.mouth : (e === 'kahkaha' ? 1 : e === 'ciddi' ? 0 : 0.45);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (e === 'sok') {
    const k = f.mouth != null ? 0.35 + 0.65 * f.mouth : 1;
    memoEllipse(ctx, 0, 62 + 14 * k, 9 + 6 * k, 6 + 14 * k, 0, MEMO.mouth, MEMO.ink, 6);
    memoEllipse(ctx, 0, 66 + 20 * k, 5 + 4 * k, 2 + 4 * k, 0, MEMO.tongue);
    return;
  }
  if (m < 0.08) {
    ctx.strokeStyle = MEMO.ink; ctx.lineWidth = 7; ctx.beginPath();
    if (e === 'ciddi') { ctx.moveTo(-22, 68); ctx.quadraticCurveTo(0, 64, 22, 68); }
    else { ctx.moveTo(-26, 62); ctx.quadraticCurveTo(0, 78, 26, 62); }
    ctx.stroke(); return;
  }
  const W = 30 + 6 * m, H = 12 + 40 * m, top = 54;
  const path = new Path2D();
  path.moveTo(-W, top); path.bezierCurveTo(-W * 0.6, top + H, W * 0.6, top + H, W, top); path.closePath();
  ctx.fillStyle = MEMO.mouth; ctx.fill(path);
  ctx.save(); ctx.clip(path);
  ctx.fillStyle = '#fff'; ctx.fillRect(-W, top, W * 2, 7 + 3 * m);
  memoEllipse(ctx, 6, top + H * 0.82, 16 + 4 * m, 9 + 6 * m, 0, MEMO.tongue);
  ctx.restore();
  ctx.strokeStyle = MEMO.ink; ctx.lineWidth = 6; ctx.stroke(path);
}

function memoStache(ctx) {
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(0, 26);
    ctx.bezierCurveTo(s * 20, 14, s * 46, 16, s * 63, 30);
    ctx.bezierCurveTo(s * 73, 38, s * 82, 33, s * 85, 20);
    ctx.bezierCurveTo(s * 94, 40, s * 78, 60, s * 58, 53);
    ctx.bezierCurveTo(s * 40, 60, s * 18, 54, 0, 45);
    ctx.closePath();
    ctx.fillStyle = MEMO.stache; ctx.fill();
    ctx.strokeStyle = MEMO.ink; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
    // tuy cizgileri
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(s * (14 + k * 14), 34 + k); ctx.lineTo(s * (24 + k * 14), 42 + k); ctx.stroke(); }
  }
}

function memoHead(ctx, cx, cy, f) {
  const R = 100;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate((f.tilt || 0) * Math.PI / 180);
  // kulaklar
  for (const s of [-1, 1]) memoEllipse(ctx, s * 97, 10, 19, 24, 0, MEMO.skin, MEMO.ink, 7);
  // sac kivrimi (arkada baslar)
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const curl = new Path2D();
  curl.moveTo(-6, -92); curl.bezierCurveTo(-36, -152, 32, -184, 50, -146);
  curl.bezierCurveTo(60, -120, 22, -104, 16, -126); curl.bezierCurveTo(12, -142, 32, -146, 34, -134);
  const sprig = new Path2D();
  sprig.moveTo(-30, -90); sprig.quadraticCurveTo(-54, -118, -40, -138);
  ctx.strokeStyle = MEMO.ink; ctx.lineWidth = 27; ctx.stroke(curl); ctx.lineWidth = 21; ctx.stroke(sprig);
  ctx.strokeStyle = MEMO.hair; ctx.lineWidth = 16; ctx.stroke(curl); ctx.lineWidth = 10; ctx.stroke(sprig);
  // kafa
  memoCircle(ctx, 0, 0, R, MEMO.skin, MEMO.ink, 9);
  memoEllipse(ctx, -40, -54, 26, 13, -0.55, 'rgba(255,255,255,0.4)');
  // yanaklar
  memoCircle(ctx, -68, 6, 15, MEMO.cheek); memoCircle(ctx, 68, 6, 15, MEMO.cheek);
  // gozler
  memoEye(ctx, -36, -20, f, -1); memoEye(ctx, 36, -20, f, 1);
  // kaslar
  const B = { normal: [0, 2, 0], mutlu: [0, 2, -5], sok: [2, 0, -20], ciddi: [9, -5, 2], kahkaha: [0, 2, -10], goz: [0, 2, -5] }[f.expr] || [0, 2, 0];
  ctx.strokeStyle = MEMO.ink; ctx.lineWidth = 9; ctx.lineCap = 'round';
  memoBrow(ctx, -1, B[0], B[1], B[2]); memoBrow(ctx, 1, B[0], B[1], f.expr === 'goz' ? 4 : B[2]);
  // agiz, biyik, burun
  memoMouth(ctx, f);
  memoStache(ctx);
  memoCircle(ctx, 0, 14, 17, MEMO.nose, MEMO.ink, 5);
  memoCircle(ctx, -5, 8, 5, 'rgba(255,255,255,0.7)');
  ctx.restore();
}

function drawMemo(ctx, x, y, s, o) {
  const P = typeof o.pose === 'string' ? MEMO_POSES[o.pose] : o.pose;
  const f = o.face || { expr: 'mutlu' };
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const hip = [0, -200], neck = [0, -362], sh = [0, -340];
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // bacaklar
  ctx.strokeStyle = MEMO.ink; ctx.lineWidth = 14;
  const L = memoLimb(ctx, hip, P.ll[0], 105, P.ll[1], 100);
  const Rl = memoLimb(ctx, hip, P.rl[0], 105, P.rl[1], 100);
  memoShoe(ctx, L.p2, -1); memoShoe(ctx, Rl.p2, 1);
  // govde (renkli kalin cubuk)
  ctx.strokeStyle = MEMO.ink; ctx.lineWidth = 36; ctx.beginPath(); ctx.moveTo(hip[0], hip[1]); ctx.lineTo(neck[0], neck[1]); ctx.stroke();
  ctx.strokeStyle = MEMO.torso; ctx.lineWidth = 24; ctx.stroke();
  ctx.strokeStyle = MEMO.torsoDark; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(7, -215); ctx.lineTo(7, -330); ctx.stroke();
  // papyon
  ctx.lineJoin = 'round';
  for (const sd of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(0, -346); ctx.lineTo(sd * 30, -362); ctx.lineTo(sd * 30, -330); ctx.closePath();
    ctx.fillStyle = MEMO.tie; ctx.fill(); ctx.strokeStyle = MEMO.ink; ctx.lineWidth = 5; ctx.stroke();
  }
  memoCircle(ctx, 0, -346, 8, MEMO.tie, MEMO.ink, 5);
  // kollar
  ctx.strokeStyle = MEMO.ink; ctx.lineWidth = 14; ctx.lineCap = 'round';
  const A = memoLimb(ctx, [-6, sh[1]], P.la[0], 85, P.la[1], 80);
  const B = memoLimb(ctx, [6, sh[1]], P.ra[0], 85, P.ra[1], 80);
  // mikrofon (elin arkasinda); micFront ise kafadan sonra, gogsun onunde cizilir
  const micHand = P.mic === 'la' ? A.p2 : P.mic === 'ra' ? B.p2 : null;
  const micA = o.micAng != null ? o.micAng : (P.mic === 'ra' ? 8 : -8);
  const drawMicHand = () => { memoMic(ctx, micHand, micA); memoCircle(ctx, micHand[0], micHand[1], 16, MEMO.skin, MEMO.ink, 6); };
  if (micHand && !P.micFront) drawMicHand();
  // eller
  if (micHand !== A.p2 || !P.micFront) memoCircle(ctx, A.p2[0], A.p2[1], 16, MEMO.skin, MEMO.ink, 6);
  if (micHand !== B.p2 || !P.micFront) memoCircle(ctx, B.p2[0], B.p2[1], 16, MEMO.skin, MEMO.ink, 6);
  // kafa
  memoHead(ctx, 0, -462, f);
  if (micHand && P.micFront) drawMicHand();
  ctx.restore();
  return { handL: A.p2, handR: B.p2 };
}

if (typeof module !== 'undefined') module.exports = { drawMemo, MEMO, MEMO_POSES };
