// Spiker adaylari: ortak cop adam govdesi + karaktere ozel kafa. memo.js'ten sonra yuklenir.
const INK = '#1E2235';

function micGen(ctx, hand, ang, color, label) {
  ctx.save(); ctx.translate(hand[0], hand[1]); ctx.rotate(ang * Math.PI / 180); ctx.lineCap = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = 24; ctx.beginPath(); ctx.moveTo(0, 24); ctx.lineTo(0, -58); ctx.stroke();
  ctx.strokeStyle = '#3A3F58'; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(0, 24); ctx.lineTo(0, -58); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(-30, -62, 60, 30, 6); ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = '700 15px Poppins'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label || 'HABER', 0, -46);
  memoCircle(ctx, 0, -86, 24, '#D5DAE3', INK, 6);
  ctx.save(); ctx.beginPath(); ctx.arc(0, -86, 21, 0, Math.PI * 2); ctx.clip();
  ctx.strokeStyle = 'rgba(30,34,53,0.35)'; ctx.lineWidth = 2;
  for (let i = -30; i <= 30; i += 9) { ctx.beginPath(); ctx.moveTo(i, -112); ctx.lineTo(i + 20, -60); ctx.stroke(); ctx.beginPath(); ctx.moveTo(i, -112); ctx.lineTo(i - 20, -60); ctx.stroke(); }
  ctx.restore(); memoCircle(ctx, -8, -94, 5, 'rgba(255,255,255,0.8)'); ctx.restore();
}

function shoeGen(ctx, foot, side, color) {
  const cx = foot[0] + side * 16, cy = foot[1] - 4;
  memoEllipse(ctx, cx, cy, 32, 17, 0, color, INK, 6);
  ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, 29, 14, 0, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = '#fff'; ctx.fillRect(cx - 40, cy + 6, 80, 12); ctx.restore();
  memoEllipse(ctx, cx, cy, 32, 17, 0, null, INK, 6);
  memoCircle(ctx, cx + side * 10, cy - 6, 3.5, '#fff');
}

function drawChar(ctx, x, y, s, o, C) {
  const P = typeof o.pose === 'string' ? MEMO_POSES[o.pose] : o.pose;
  const f = o.face || { expr: 'mutlu' };
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const hip = [0, -200], neck = [0, -362], sh = [0, -340];
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = 14;
  const L = memoLimb(ctx, hip, P.ll[0], 105, P.ll[1], 100), R = memoLimb(ctx, hip, P.rl[0], 105, P.rl[1], 100);
  shoeGen(ctx, L.p2, -1, C.shoe); shoeGen(ctx, R.p2, 1, C.shoe);
  ctx.strokeStyle = INK; ctx.lineWidth = 36; ctx.beginPath(); ctx.moveTo(hip[0], hip[1]); ctx.lineTo(neck[0], neck[1]); ctx.stroke();
  ctx.strokeStyle = C.torso; ctx.lineWidth = 24; ctx.stroke();
  ctx.strokeStyle = C.torsoDark; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(7, -215); ctx.lineTo(7, -330); ctx.stroke();
  C.neck(ctx);
  if (o.extraNeck) o.extraNeck(ctx);
  ctx.strokeStyle = INK; ctx.lineWidth = 14; ctx.lineCap = 'round';
  const A = memoLimb(ctx, [-6, sh[1]], P.la[0], 85, P.la[1], 80), B = memoLimb(ctx, [6, sh[1]], P.ra[0], 85, P.ra[1], 80);
  const micHand = P.mic === 'la' ? A.p2 : P.mic === 'ra' ? B.p2 : null;
  const micA = o.micAng != null ? o.micAng : (P.mic === 'ra' ? 8 : -8);
  const drawMicHand = () => { micGen(ctx, micHand, micA, C.mic, C.micLabel); memoCircle(ctx, micHand[0], micHand[1], 16, C.hand, INK, 6); };
  if (micHand && !P.micFront) drawMicHand();
  if (micHand !== A.p2 || !P.micFront) memoCircle(ctx, A.p2[0], A.p2[1], 16, C.hand, INK, 6);
  if (micHand !== B.p2 || !P.micFront) memoCircle(ctx, B.p2[0], B.p2[1], 16, C.hand, INK, 6);
  if (o.pointR) {   // isaret parmagi: sag on kol yonunde
    const d = memoDir(P.ra[1]); const h = B.p2;
    ctx.strokeStyle = INK; ctx.lineWidth = 15; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(h[0], h[1]); ctx.lineTo(h[0] + d[0] * 30, h[1] + d[1] * 30); ctx.stroke();
    ctx.strokeStyle = C.hand; ctx.lineWidth = 7; ctx.stroke();
    memoCircle(ctx, h[0], h[1], 16, C.hand, INK, 6);
  }
  C.head(ctx, 0, -462, f);
  if (micHand && P.micFront) drawMicHand();
  ctx.restore();
  return { handL: A.p2, handR: B.p2 };
}

// ---------- A: Manset Memo ----------
const CH_MEMO = {
  name: 'Manşet Memo', tag: 'Bıyıklı, perçemli, papyonlu', torso: MEMO.torso, torsoDark: MEMO.torsoDark, shoe: MEMO.shoe,
  mic: MEMO.mic, hand: MEMO.skin, head: memoHead,
  pal: [MEMO.skin, MEMO.hair, MEMO.torso, MEMO.tie, MEMO.mic, MEMO.stache],
  neck(ctx) {
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, -346); ctx.lineTo(sd * 30, -362); ctx.lineTo(sd * 30, -330); ctx.closePath(); ctx.fillStyle = MEMO.tie; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke(); }
    memoCircle(ctx, 0, -346, 8, MEMO.tie, INK, 5);
  }
};

// ---------- B: Haber Hale ----------
const HALE = { skin: '#FFC2A8', hair: '#6D28D9', hairHi: '#8B5CF6', glass: '#14B8A6', torso: '#FFC93C', torsoDark: '#E0A800', fular: '#FF3B5C', shoe: '#7C5CFF', lip: '#E11D48', mic: '#14B8A6', ear: '#FFD23F' };

function haleEye(ctx, ex, ey, f, side) {
  const e = f.expr, lx = (f.look || [0, 0])[0], ly = (f.look || [0, 0])[1];
  ctx.lineCap = 'round';
  if (e === 'kahkaha' || f.blink >= 1) {
    ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(ex - 15, ey + 5); ctx.quadraticCurveTo(ex, ey - 15, ex + 15, ey + 5); ctx.stroke();
  } else {
    const big = e === 'sok', rx = big ? 21 : 18, ry = big ? 27 : 22, pr = big ? 6 : 9;
    memoEllipse(ctx, ex, ey, rx, ry, 0, '#fff', INK, 5);
    const px = ex + lx * 6, py = ey + ly * 6 + (big ? 0 : 2);
    memoCircle(ctx, px, py, pr, INK); memoCircle(ctx, px - 3, py - 3, pr * 0.35, '#fff');
    if (e === 'ciddi') {
      ctx.save(); ctx.beginPath(); ctx.ellipse(ex, ey, rx - 2, ry - 2, 0, 0, 7); ctx.clip(); ctx.fillStyle = HALE.skin; ctx.fillRect(ex - 30, ey - 40, 60, 31); ctx.restore();
      ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(ex - rx + 2, ey - 9); ctx.lineTo(ex + rx - 2, ey - 9); ctx.stroke();
      memoEllipse(ctx, ex, ey, rx, ry, 0, null, INK, 5);
    }
    // kirpikler
    ctx.strokeStyle = INK; ctx.lineWidth = 4;
    for (let k = 0; k < 2; k++) { const a = -0.9 + k * 0.4; const sx = ex + side * Math.cos(a) * rx, sy = ey + Math.sin(a) * ry; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + side * 9, sy - 7); ctx.stroke(); }
  }
}

function haleHead(ctx, cx, cy, f) {
  const R = 100; ctx.save(); ctx.translate(cx, cy); ctx.rotate((f.tilt || 0) * Math.PI / 180);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // topuz + kalem
  memoCircle(ctx, 0, -124, 52, HALE.hair, INK, 8);
  ctx.strokeStyle = HALE.hairHi; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, -124, 32, -2.6, -1.2); ctx.stroke();
  ctx.save(); ctx.translate(4, -138); ctx.rotate(-0.42);
  ctx.beginPath(); ctx.moveTo(56, -9); ctx.lineTo(84, 0); ctx.lineTo(56, 9); ctx.closePath(); ctx.fillStyle = '#F5D0A9'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(76, -3); ctx.lineTo(84, 0); ctx.lineTo(76, 3); ctx.closePath(); ctx.fillStyle = INK; ctx.fill();
  ctx.beginPath(); ctx.rect(-70, -9, 126, 18); ctx.fillStyle = '#FFC93C'; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.rect(-80, -9, 12, 18); ctx.fillStyle = '#B8BECC'; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(-98, -9, 20, 18, [6, 0, 0, 6]); ctx.fillStyle = '#FF8FAB'; ctx.fill(); ctx.stroke();
  ctx.restore();
  // kulaklar ve kupeler
  for (const s of [-1, 1]) {
    memoEllipse(ctx, s * 97, 12, 17, 22, 0, HALE.skin, INK, 6);
    ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(s * 99, 32); ctx.lineTo(s * 99, 44); ctx.stroke();
    memoCircle(ctx, s * 99, 54, 11, HALE.ear, INK, 5);
  }
  // kafa
  memoCircle(ctx, 0, 0, R, HALE.skin, null, 0);
  // sac (kafanin ust kismi + yana yatik kakul)
  const fringe = new Path2D();
  fringe.moveTo(-112, 10); fringe.lineTo(-112, -120); fringe.lineTo(112, -120); fringe.lineTo(112, 10);
  fringe.bezierCurveTo(98, -40, 80, -70, 52, -74); fringe.bezierCurveTo(30, -60, 6, -66, -10, -84);
  fringe.bezierCurveTo(-30, -66, -66, -60, -84, -44); fringe.bezierCurveTo(-98, -30, -104, -10, -112, 10); fringe.closePath();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R - 1, 0, 7); ctx.clip();
  ctx.fillStyle = HALE.hair; ctx.fill(fringe);
  ctx.strokeStyle = HALE.hairHi; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-50, -86); ctx.quadraticCurveTo(-20, -96, 10, -92); ctx.stroke();
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath();
  ctx.moveTo(112, 10); ctx.bezierCurveTo(98, -40, 80, -70, 52, -74); ctx.bezierCurveTo(30, -60, 6, -66, -10, -84);
  ctx.bezierCurveTo(-30, -66, -66, -60, -84, -44); ctx.bezierCurveTo(-98, -30, -104, -10, -112, 10); ctx.stroke();
  ctx.restore();
  memoCircle(ctx, 0, 0, R, null, INK, 9);
  // yanaklar
  memoCircle(ctx, -62, 24, 15, 'rgba(255, 92, 130, 0.45)'); memoCircle(ctx, 62, 24, 15, 'rgba(255, 92, 130, 0.45)');
  // gozler + gozluk
  haleEye(ctx, -34, -12, f, -1); haleEye(ctx, 34, -12, f, 1);
  ctx.strokeStyle = HALE.glass; ctx.lineWidth = 8;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 34, -12, 32, 0, 7); ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fill(); }
  ctx.strokeStyle = INK; ctx.lineWidth = 13; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 34, -12, 32, 0, 7); ctx.stroke(); }
  ctx.strokeStyle = HALE.glass; ctx.lineWidth = 7; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 34, -12, 32, 0, 7); ctx.stroke(); }
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-6, -18); ctx.quadraticCurveTo(0, -24, 6, -18); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-66, -16); ctx.lineTo(-92, -8); ctx.moveTo(66, -16); ctx.lineTo(92, -8); ctx.stroke();
  memoEllipse(ctx, -44, -24, 8, 4, -0.6, 'rgba(255,255,255,0.7)'); memoEllipse(ctx, 24, -24, 8, 4, -0.6, 'rgba(255,255,255,0.7)');
  // kaslar
  const B = { mutlu: -2, normal: 0, sok: -10, ciddi: 4, kahkaha: -4 }[f.expr] || 0;
  ctx.strokeStyle = INK; ctx.lineWidth = 6;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 18, -58 + B + (f.expr === 'ciddi' ? 4 : 0)); ctx.quadraticCurveTo(s * 34, -66 + B, s * 52, -60 + B); ctx.stroke(); }
  // burun
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-2, 14); ctx.quadraticCurveTo(10, 26, -4, 30); ctx.stroke();
  // agiz
  const e = f.expr; let m = f.mouth != null ? f.mouth : (e === 'kahkaha' ? 1 : e === 'ciddi' ? 0 : 0.45);
  if (e === 'sok') { memoEllipse(ctx, 0, 56, 13, 17, 0, '#8E1F35', HALE.lip, 7); }
  else if (m < 0.08) { ctx.strokeStyle = HALE.lip; ctx.lineWidth = 8; ctx.beginPath(); if (e === 'ciddi') { ctx.moveTo(-18, 52); ctx.quadraticCurveTo(0, 49, 18, 52); } else { ctx.moveTo(-22, 46); ctx.quadraticCurveTo(0, 60, 22, 46); } ctx.stroke(); }
  else {
    const W = 28 + 6 * m, H = 10 + 34 * m, top = 42; const p = new Path2D();
    p.moveTo(-W, top); p.quadraticCurveTo(0, top - 6, W, top); p.bezierCurveTo(W * 0.6, top + H, -W * 0.6, top + H, -W, top); p.closePath();
    ctx.fillStyle = '#8E1F35'; ctx.fill(p); ctx.save(); ctx.clip(p); ctx.fillStyle = '#fff'; ctx.fillRect(-W, top - 8, W * 2, 13); memoEllipse(ctx, 4, top + H * 0.8, 14 + 4 * m, 8 + 5 * m, 0, '#FF7A93'); ctx.restore();
    ctx.strokeStyle = HALE.lip; ctx.lineWidth = 7; ctx.stroke(p);
  }
  ctx.restore();
}

const CH_HALE = {
  name: 'Haber Hale', tag: 'Topuzlu, kalemli, gözlüklü', torso: HALE.torso, torsoDark: HALE.torsoDark, shoe: HALE.shoe,
  mic: HALE.mic, hand: HALE.skin, head: haleHead,
  pal: [HALE.skin, HALE.hair, HALE.glass, HALE.torso, HALE.fular, HALE.shoe],
  neck(ctx) {
    ctx.beginPath(); ctx.moveTo(-30, -360); ctx.lineTo(30, -360); ctx.lineTo(4, -318); ctx.closePath(); ctx.fillStyle = HALE.fular; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-2, -348); ctx.lineTo(-22, -312); ctx.lineTo(-6, -314); ctx.closePath(); ctx.fill(); ctx.stroke();
    memoCircle(ctx, 0, -352, 8, HALE.fular, INK, 5);
    memoCircle(ctx, 2, -340, 3, '#fff'); memoCircle(ctx, 10, -332, 3, '#fff'); memoCircle(ctx, -8, -336, 3, '#fff');
  }
};

// ---------- C: Ekran Ekrem ----------
const EKREM = { tv: '#FF7A1A', tvDark: '#D65F00', screen: '#12304A', glow: '#5EEAD4', torso: '#7C5CFF', torsoDark: '#5B3FE0', tie: '#FFD23F', shoe: '#14B8A6', mic: '#FF3B5C', ball: '#FF3B5C' };

function ekremHead(ctx, cx, cy, f) {
  ctx.save(); ctx.translate(cx, cy + 14); ctx.rotate((f.tilt || 0) * Math.PI / 180);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // antenler
  ctx.strokeStyle = INK; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(-12, -90); ctx.lineTo(-58, -168); ctx.moveTo(12, -90); ctx.lineTo(70, -176); ctx.stroke();
  memoCircle(ctx, -58, -168, 12, EKREM.ball, INK, 6); memoCircle(ctx, 70, -176, 12, EKREM.ball, INK, 6);
  memoEllipse(ctx, 0, -92, 26, 12, 0, '#3A3F58', INK, 6);
  // govde
  ctx.beginPath(); ctx.roundRect(-122, -92, 244, 184, 30); ctx.fillStyle = EKREM.tv; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.roundRect(-122, -92, 244, 184, 30); ctx.clip();
  ctx.fillStyle = EKREM.tvDark; ctx.fillRect(-130, 66, 260, 40); ctx.restore();
  ctx.beginPath(); ctx.roundRect(-122, -92, 244, 184, 30); ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.stroke();
  memoEllipse(ctx, -84, -70, 22, 8, -0.3, 'rgba(255,255,255,0.45)');
  // ekran
  const SX = -100, SY = -70, SW = 156, SH = 136, fx = SX + SW / 2, fy = SY + SH / 2;
  ctx.beginPath(); ctx.roundRect(SX, SY, SW, SH, 24); ctx.fillStyle = EKREM.screen; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.roundRect(SX + 3, SY + 3, SW - 6, SH - 6, 21); ctx.clip();
  ctx.fillStyle = 'rgba(94,234,212,0.06)'; for (let yy = SY; yy < SY + SH; yy += 7) ctx.fillRect(SX, yy, SW, 3);
  // yuz (parlayan)
  ctx.shadowColor = EKREM.glow; ctx.shadowBlur = 14; ctx.fillStyle = EKREM.glow; ctx.strokeStyle = EKREM.glow; ctx.lineCap = 'round';
  const e = f.expr, lx = (f.look || [0, 0])[0] * 5, ly = (f.look || [0, 0])[1] * 5;
  for (const s of [-1, 1]) {
    const ex = fx + s * 32 + lx, ey = fy - 16 + ly;
    if (e === 'kahkaha' || f.blink >= 1) { ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(ex - 13, ey + 5); ctx.lineTo(ex, ey - 8); ctx.lineTo(ex + 13, ey + 5); ctx.stroke(); }
    else if (e === 'sok') { ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(ex, ey, 17, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(ex, ey, 5, 0, 7); ctx.fill(); }
    else if (e === 'ciddi') { ctx.beginPath(); ctx.roundRect(ex - 15, ey - 4, 30, 10, 5); ctx.fill(); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(ex - s * 14, ey - 18); ctx.lineTo(ex + s * 12, ey - 13); ctx.stroke(); }
    else { ctx.fillStyle = EKREM.glow; ctx.beginPath(); ctx.ellipse(ex, ey, 12, 17, 0, 0, 7); ctx.fill(); ctx.shadowBlur = 0; memoCircle(ctx, ex - 3, ey - 6, 4, EKREM.screen); ctx.shadowBlur = 14; ctx.fillStyle = EKREM.glow; }
  }
  ctx.shadowBlur = 0; memoCircle(ctx, fx - 54, fy + 14, 9, 'rgba(255,122,160,0.55)'); memoCircle(ctx, fx + 54, fy + 14, 9, 'rgba(255,122,160,0.55)');
  ctx.shadowBlur = 14;
  let m = f.mouth != null ? f.mouth : (e === 'kahkaha' ? 1 : e === 'ciddi' ? 0 : 0.4);
  const my = fy + 22;
  if (e === 'sok') { ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(fx, my + 8, 11, 15, 0, 0, 7); ctx.stroke(); }
  else if (m < 0.08) { ctx.lineWidth = 7; ctx.beginPath(); if (e === 'ciddi') { ctx.moveTo(fx - 20, my + 6); ctx.lineTo(fx + 20, my + 6); } else { ctx.moveTo(fx - 24, my); ctx.quadraticCurveTo(fx, my + 18, fx + 24, my); } ctx.stroke(); }
  else { const W = 26 + 6 * m, H = 10 + 26 * m; ctx.beginPath(); ctx.moveTo(fx - W, my); ctx.lineTo(fx + W, my); ctx.bezierCurveTo(fx + W * 0.7, my + H, fx - W * 0.7, my + H, fx - W, my); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = EKREM.screen; ctx.beginPath(); ctx.ellipse(fx + 3, my + H * 0.55, W * 0.45, H * 0.25, 0, 0, 7); ctx.fill(); }
  ctx.restore();
  ctx.shadowBlur = 0;
  // dugmeler ve hoparlor
  memoCircle(ctx, 86, -44, 15, '#FFD23F', INK, 6); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(86, -44); ctx.lineTo(93, -54); ctx.stroke();
  memoCircle(ctx, 86, -2, 15, '#14B8A6', INK, 6); ctx.beginPath(); ctx.moveTo(86, -2); ctx.lineTo(78, -12); ctx.stroke();
  ctx.lineWidth = 5; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(72, 26 + k * 10); ctx.lineTo(100, 26 + k * 10); ctx.stroke(); }
  ctx.restore();
}

const CH_EKREM = {
  name: 'Ekran Ekrem', tag: 'Antenli, televizyon kafalı', torso: EKREM.torso, torsoDark: EKREM.torsoDark, shoe: EKREM.shoe,
  mic: EKREM.mic, hand: '#FFFFFF', head: ekremHead,
  mainPose: { la: [-45, 60], ra: [80, 125], ll: [-12, -6], rl: [14, 8], mic: 'la', micFront: true }, mainMicAng: -6,
  pal: [EKREM.tv, EKREM.glow, EKREM.screen, EKREM.torso, EKREM.tie, EKREM.shoe],
  neck(ctx) {
    ctx.beginPath(); ctx.moveTo(-11, -360); ctx.lineTo(11, -360); ctx.lineTo(8, -344); ctx.lineTo(-8, -344); ctx.closePath(); ctx.fillStyle = EKREM.tie; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-8, -344); ctx.lineTo(8, -344); ctx.lineTo(16, -280); ctx.lineTo(0, -262); ctx.lineTo(-16, -280); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#FF7A1A'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-9, -326); ctx.lineTo(11, -318); ctx.moveTo(-12, -304); ctx.lineTo(13, -294); ctx.stroke();
  }
};
