// Manset Memo bulten motoru (bulten/BULTEN.md). Veri: D = {fps, dur, env, times, b: bulten.json}. draw(t) tek kare cizer (1080x1920).
// Ust buyuk ekran sabit; alt kisim: Memo masada (studyo) ya da muhabir sahada.
const W = 1080, H = 1920, K = INK;
const NAVY = '#161A36', NAVY2 = '#262B66', YEL = '#FFD23F', RED = '#FF3B5C', TEAL = '#14B8A6', PUR = '#7C5CFF', GRN = '#22C55E', BLU = '#3B82F6', ORN = '#F97316';
const CHARS = { memo: CH_MEMO, senol: CH_SENOL, pinar: CH_PINAR, tarik: CH_TARIK, sinasi: CH_SINASI };
const KIMLIK = { senol: ['ŞEMSİYE ŞENOL', BLU], pinar: ['PİYASA PINAR', GRN], tarik: ['TRİBÜN TARIK', ORN], sinasi: ['SİYASİ ŞİNASİ', '#1E40AF'] };
// Ust ekran sahneleri 960x700'luk sanal alanda (VS) cizilir ve SK oraninda kucultulup SCR'ye yerlestirilir.
// 25.11.2026 (Cem): X tam ekranda videonun ust ~135 px'i telefonun durum cubugu ve kamera adasinin altinda kaliyor;
// baslik bilgileri HEADER_Y kadar asagi alindi, ust ekran da yer acmak icin kucultuldu.
const VS = { x: 0, y: 0, w: 960, h: 700 }, SK = 634 / 700;
const SCR = { x: (W - 960 * SK) / 2, y: 262, w: 960 * SK, h: 634 }, LOW = { y0: 910, y1: 1668 };
// Telefonlar 9:16 videoyu ekrani dolduracak sekilde buyutup yanlardan kirpiyor (X'te ~55 px, tam ekranda ~100 px).
// Butun yazilar bu yatay guvenli alanin icinde kalir. Ust bilgiler durum cubugunun altinda (y >= 140) baslar.
const SAFE = 100, HEADER_Y = 94;
let D = null;

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eo = x => 1 - Math.pow(1 - clamp(x), 3);
const eob = x => { x = clamp(x); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
const L = i => D.b.satirlar[i];
function lineAt(t) { let i = 0; for (let k = 0; k < D.times.length; k++) if (t >= D.times[k][0] - 0.15) i = k; return i; }
function lineStart(i) { return i === 0 ? 0 : D.times[i][0] - 0.15; }
function mouthAt(t) { const f = Math.floor(t * D.fps); return D.env[Math.max(0, Math.min(D.env.length - 1, f))]; }
function talkingAt(t, i) { return t >= D.times[i][0] - 0.05 && t <= D.times[i][1] + 0.05; }

function txt(s, x, y, size, color, align = 'center', weight = 700) {
  ctx.font = `${weight} ${size}px Poppins`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y);
}
function fit(s, maxW, size, weight = 700) { ctx.font = `${weight} ${size}px Poppins`; const w = ctx.measureText(s).width; return w > maxW ? size * maxW / w : size; }
function txtOut(s, x, y, size, color, stroke, sw, align = 'center') {
  ctx.font = `700 ${size}px Poppins`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.strokeText(s, x, y); ctx.fillStyle = color; ctx.fillText(s, x, y);
}
function rr(x, y, w, h, r, fill, stroke, sw) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.stroke(); } }
function wrap(s, maxW, size) {
  ctx.font = `700 ${size}px Poppins`; const words = s.split(' '); const lines = []; let cur = '';
  for (const w of words) { const tr = cur ? cur + ' ' + w : w; if (ctx.measureText(tr).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tr; }
  if (cur) lines.push(cur); return lines;
}
function shade(hex, k) {   // k<0 koyulastir
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = v => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k);
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}

// ---------- ikonlar (merkez x,y; olcek s) ----------
function snowflake(x, y, r, rot = 0, col = '#fff') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineWidth = r * 0.14;
  for (let k = 0; k < 6; k++) { ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r); ctx.moveTo(0, -r * 0.55); ctx.lineTo(-r * 0.25, -r * 0.8); ctx.moveTo(0, -r * 0.55); ctx.lineTo(r * 0.25, -r * 0.8); ctx.stroke(); }
  ctx.restore();
}
function cloud(x, y, s, col = '#fff') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.strokeStyle = K; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.arc(-50, 10, 40, Math.PI * 0.5, Math.PI * 1.5); ctx.arc(-10, -25, 50, Math.PI * 1.1, Math.PI * 1.9); ctx.arc(45, 0, 42, Math.PI * 1.4, Math.PI * 0.5); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}
function sun(x, y, r, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.strokeStyle = '#F59E0B'; ctx.lineWidth = r * 0.16; ctx.lineCap = 'round';
  for (let k = 0; k < 10; k++) { ctx.rotate(Math.PI / 5); ctx.beginPath(); ctx.moveTo(0, -r * 1.25); ctx.lineTo(0, -r * 1.6); ctx.stroke(); }
  ctx.restore(); memoCircle(ctx, x, y, r, '#FFD23F', K, r * 0.1);
}
function wIcon(kind, x, y, s, t) {
  if (kind === 'gunes') sun(x, y, 42 * s, t * 0.6);
  else if (kind === 'kar') { cloud(x, y - 10 * s, 0.8 * s); for (let k = 0; k < 3; k++) snowflake(x - 40 * s + k * 40 * s, y + 50 * s + ((t * 30 + k * 9) % 20) * s, 12 * s, t + k, '#BFE3FF'); }
  else { sun(x + 30 * s, y - 30 * s, 26 * s, t * 0.6); cloud(x - 6 * s, y + 10 * s, 0.8 * s); }
}
function lion(x, y, r) {
  ctx.save(); ctx.translate(x, y); ctx.lineJoin = 'round';
  ctx.beginPath(); for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2, q = i % 2 ? r : r * 1.22; ctx.lineTo(Math.cos(a) * q, Math.sin(a) * q); }
  ctx.closePath(); ctx.fillStyle = '#E8871E'; ctx.fill(); ctx.strokeStyle = K; ctx.lineWidth = r * 0.07; ctx.stroke();
  for (const s of [-1, 1]) memoCircle(ctx, s * r * 0.55, -r * 0.55, r * 0.2, '#F7C04A', K, r * 0.06);
  memoCircle(ctx, 0, 0, r * 0.72, '#F7C04A', K, r * 0.07);
  for (const s of [-1, 1]) { memoCircle(ctx, s * r * 0.26, -r * 0.12, r * 0.1, '#fff', K, r * 0.04); memoCircle(ctx, s * r * 0.26, -r * 0.1, r * 0.05, K); }
  ctx.beginPath(); ctx.moveTo(-r * 0.12, r * 0.12); ctx.lineTo(r * 0.12, r * 0.12); ctx.lineTo(0, r * 0.26); ctx.closePath(); ctx.fillStyle = '#7A3B1E'; ctx.fill();
  ctx.restore();
}
function icon(kind, x, y, s, lt) {
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (kind === 'ogretmen') {
    rr(x - 170 * s, y - 120 * s, 340 * s, 220 * s, 14 * s, '#14532D', K, 10 * s);
    rr(x - 186 * s, y - 136 * s, 372 * s, 252 * s, 20 * s, null, '#A16207', 14 * s);
    ctx.globalAlpha = clamp(lt * 1.5); txt('A B C', x, y - 40 * s, 70 * s, '#fff'); txt('1 + 1 = 2', x, y + 40 * s, 50 * s, '#FDE68A'); ctx.globalAlpha = 1;
    const ay = y + 150 * s - Math.abs(Math.sin(lt * 4)) * 14 * s;
    memoCircle(ctx, x + 150 * s, ay, 46 * s, RED, K, 7 * s); ctx.strokeStyle = K; ctx.lineWidth = 7 * s; ctx.beginPath(); ctx.moveTo(x + 150 * s, ay - 44 * s); ctx.lineTo(x + 156 * s, ay - 68 * s); ctx.stroke();
    memoEllipse(ctx, x + 176 * s, ay - 58 * s, 18 * s, 9 * s, -0.4, GRN, K, 4 * s);
  } else if (kind === 'aslan') {
    lion(x, y, 120 * s); ctx.strokeStyle = RED; ctx.lineWidth = 26 * s; const q = 140 * s * eo(seg(lt, 0.4, 0.7));
    ctx.beginPath(); ctx.moveTo(x - q, y - q); ctx.lineTo(x + q, y + q); ctx.moveTo(x + q, y - q); ctx.lineTo(x - q, y + q); ctx.stroke();
  } else if (kind === 'kar') {
    cloud(x, y - 30 * s, 1.5 * s); for (let k = 0; k < 5; k++) snowflake(x - 120 * s + k * 60 * s, y + 90 * s + ((lt * 60 + k * 23) % 60) * s, 20 * s, lt + k, '#BFE3FF');
  } else if (kind === 'gunes') {
    sun(x, y, 100 * s, lt * 0.5);
  } else if (kind === 'tv') {
    rr(x - 170 * s, y - 110 * s, 340 * s, 230 * s, 24 * s, '#1E2235', K, 10 * s);
    ctx.save(); ctx.beginPath(); ctx.roundRect(x - 145 * s, y - 88 * s, 290 * s, 186 * s, 14 * s); ctx.clip();
    ctx.fillStyle = '#1F8A4C'; ctx.fillRect(x - 145 * s, y - 88 * s, 290 * s, 186 * s);
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.arc(x, y + 5 * s, 40 * s, 0, 7); ctx.moveTo(x, y - 88 * s); ctx.lineTo(x, y + 98 * s); ctx.stroke();
    memoCircle(ctx, x + Math.sin(lt * 3) * 90 * s, y + 5 * s + Math.cos(lt * 5) * 30 * s, 16 * s, '#fff', K, 3 * s); ctx.restore();
    ctx.strokeStyle = K; ctx.lineWidth = 8 * s; ctx.beginPath(); ctx.moveTo(x - 40 * s, y - 110 * s); ctx.lineTo(x - 90 * s, y - 180 * s); ctx.moveTo(x + 40 * s, y - 110 * s); ctx.lineTo(x + 90 * s, y - 180 * s); ctx.stroke();
    rr(x - 60 * s, y + 120 * s, 120 * s, 26 * s, 8 * s, '#1E2235', K, 6 * s);
  } else if (kind === 'altin') {
    for (const [dx, dy] of [[-80, 40], [80, 40], [0, -40]]) {
      ctx.save(); ctx.translate(x + dx * s, y + dy * s); ctx.beginPath(); ctx.moveTo(-70 * s, 36 * s); ctx.lineTo(70 * s, 36 * s); ctx.lineTo(50 * s, -36 * s); ctx.lineTo(-50 * s, -36 * s); ctx.closePath();
      ctx.fillStyle = '#F5B700'; ctx.fill(); ctx.strokeStyle = K; ctx.lineWidth = 7 * s; ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(-36 * s, -26 * s, 30 * s, 8 * s); ctx.restore();
    }
    for (let k = 0; k < 3; k++) { const a = lt * 2 + k * 2.1; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(a * 2); snowflake(x + Math.cos(a) * 140 * s, y - 90 * s + Math.sin(a) * 30 * s, 14 * s, a, '#FFF3B0'); ctx.globalAlpha = 1; }
  } else if (kind === 'para') {
    memoCircle(ctx, x, y, 110 * s, '#22C55E', K, 10 * s); memoCircle(ctx, x, y, 82 * s, null, 'rgba(255,255,255,0.5)', 6 * s); txt('₺', x, y + 6 * s, 120 * s, '#fff');
  } else { // megafon
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.2);
    ctx.beginPath(); ctx.moveTo(-120, -30); ctx.lineTo(60, -110); ctx.lineTo(60, 110); ctx.lineTo(-120, 30); ctx.closePath(); ctx.fillStyle = RED; ctx.fill(); ctx.strokeStyle = K; ctx.lineWidth = 10; ctx.stroke();
    rr(-160, -36, 50, 72, 12, '#fff', K, 8);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 9; for (let k = 0; k < 3; k++) { ctx.globalAlpha = (Math.sin(lt * 6 - k) + 1) / 2; ctx.beginPath(); ctx.arc(80, 0, 50 + k * 30, -0.6, 0.6); ctx.stroke(); } ctx.globalAlpha = 1;
    ctx.restore();
  }
  ctx.restore();
}
function rays(S, col, lt) {
  ctx.save(); ctx.translate(S.x + S.w / 2, S.y + S.h / 2); ctx.rotate(lt * 0.2);
  for (let k = 0; k < 16; k++) { ctx.rotate(Math.PI / 8); if (k % 2) { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(900, -130); ctx.lineTo(900, 130); ctx.closePath(); ctx.fill(); } }
  ctx.restore();
}
function snowfall(S, t, n, col = 'rgba(255,255,255,0.85)', sz = 7) {
  ctx.fillStyle = col;
  for (let i = 0; i < n; i++) { const x = S.x + ((i * 137 + Math.sin(t + i) * 30) % S.w + S.w) % S.w, y = S.y + ((i * 211 + t * (70 + (i % 5) * 20)) % S.h);
    ctx.beginPath(); ctx.arc(x, y, sz * (0.5 + (i % 3) * 0.35), 0, 7); ctx.fill(); }
}
function pitch(S) {
  ctx.fillStyle = '#1F8A4C'; ctx.fillRect(S.x, S.y, S.w, S.h);
  for (let i = 0; i < 8; i++) if (i % 2) { ctx.fillStyle = '#23964F'; ctx.fillRect(S.x + i * S.w / 8, S.y, S.w / 8, S.h); }
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 6; ctx.strokeRect(S.x + 40, S.y + 40, S.w - 80, S.h - 80);
  ctx.beginPath(); ctx.moveTo(S.x + S.w / 2, S.y + 40); ctx.lineTo(S.x + S.w / 2, S.y + S.h - 40); ctx.stroke(); ctx.beginPath(); ctx.arc(S.x + S.w / 2, S.y + S.h / 2, 90, 0, 7); ctx.stroke();
}
function ball(x, y, r, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); memoCircle(ctx, 0, 0, r, '#fff', K, r * 0.12);
  ctx.fillStyle = K; ctx.beginPath(); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 - Math.PI / 2; ctx.lineTo(Math.cos(a) * r * 0.38, Math.sin(a) * r * 0.38); } ctx.closePath(); ctx.fill();
  ctx.restore();
}
function clock(x, y, r, t) {
  memoCircle(ctx, x, y, r, '#fff', K, 10);
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; ctx.strokeStyle = K; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8); ctx.lineTo(x + Math.cos(a) * r * 0.92, y + Math.sin(a) * r * 0.92); ctx.stroke(); }
  ctx.lineCap = 'round'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + r * 0.45); ctx.stroke();
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI * 7 / 6); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, r * 0.62); ctx.stroke(); ctx.restore();
  ctx.lineWidth = 8; ctx.strokeStyle = RED; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(t * 2) * r * 0.68, y - Math.cos(t * 2) * r * 0.68); ctx.stroke();
  memoCircle(ctx, x, y, 12, K);
}
function confetti(S, t) {
  const cols = [YEL, RED, TEAL, PUR, '#fff'];
  for (let i = 0; i < 70; i++) { const x = S.x + ((i * 149) % S.w), y = S.y - 40 + ((i * 97 + t * 260) % (S.h + 80));
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * 3 + i); ctx.fillStyle = cols[i % 5]; ctx.fillRect(-9, -5, 18, 10); ctx.restore(); }
}

// ---------- ust ekran sahneleri ----------
function screenScene(e, t, lt) {
  const S = VS, cx = S.x + S.w / 2;
  if (e.tip === 'kanca') {
    const g = ctx.createLinearGradient(0, S.y, 0, S.y + S.h); g.addColorStop(0, '#0B1A4A'); g.addColorStop(1, '#2A4C9A'); ctx.fillStyle = g; ctx.fillRect(S.x, S.y, S.w, S.h);
    const p = eob(seg(t, 0, 0.35)), sh = Math.sin(t * 50) * 6 * (1 - seg(t, 0.3, 0.9));
    if (!e.ikon || e.ikon === 'kar') { snowfall(S, t, 70); snowflake(S.x + 200, S.y + 360, 120 * p, t * 0.8, '#BFE3FF'); }
    else { ctx.save(); ctx.translate(S.x + 200, S.y + 370); ctx.scale(0.85 * p, 0.85 * p); icon(e.ikon, 0, 0, 1, t); ctx.restore(); }   // kar disi kancada kar yagmaz
    ctx.save(); ctx.translate(S.x + 610 + sh, S.y + 380); ctx.scale(p, p); txtOut(e.yazi, 0, 0, 330, '#fff', K, 22); ctx.restore();
    if (e.ust) { ctx.font = '700 46px Poppins'; const w = ctx.measureText(e.ust).width + 60; rr(cx - w / 2, S.y + 40, w, 76, 38, YEL, K, 6); txt(e.ust, cx, S.y + 80, 46, K); }
    if (Math.floor(t * 4) % 2 === 0) { rr(S.x + 44, S.y + S.h - 92, 330, 68, 14, RED, K, 6); txt('SON DAKİKA', S.x + 209, S.y + S.h - 56, 44, '#fff'); }
  } else if (e.tip === 'acilis') {
    const g = ctx.createLinearGradient(S.x, S.y, S.x + S.w, S.y + S.h); g.addColorStop(0, '#3A2E9E'); g.addColorStop(1, '#7C3AED'); ctx.fillStyle = g; ctx.fillRect(S.x, S.y, S.w, S.h);
    rays(S, 'rgba(255,255,255,0.06)', lt);
    const p = eob(seg(lt, 0, 0.45)); ctx.save(); ctx.translate(cx, S.y + 300); ctx.scale(p, p);
    const fs = fit(e.yazi, 640, 118); rr(-370, -110, 740, 220, 30, YEL, K, 12); txt(e.yazi, 0, 4, fs, K); ctx.restore();
    ctx.globalAlpha = eo(seg(lt, 0.3, 0.7)); txt(e.alt || 'BÜLTENİ', cx, S.y + 470, 64, '#fff'); txt(D.b.tarih + ' ' + (D.b.yil || '2026'), cx, S.y + 560, 46, YEL, 'center', 500); ctx.globalAlpha = 1;
  } else if (e.tip === 'haber') {
    const c = e.renk || PUR, g = ctx.createLinearGradient(S.x, S.y, S.x + S.w, S.y + S.h); g.addColorStop(0, shade(c, -0.55)); g.addColorStop(1, shade(c, -0.15));
    ctx.fillStyle = g; ctx.fillRect(S.x, S.y, S.w, S.h); rays(S, 'rgba(255,255,255,0.05)', lt);
    if (e.ikon === 'kar') snowfall(S, t, 40, 'rgba(255,255,255,0.5)', 6);
    const p = eob(seg(lt, 0.05, 0.45)); ctx.save(); ctx.translate(cx, S.y + 290); ctx.scale(p, p); icon(e.ikon, 0, 0, 1.15, lt); ctx.restore();
    const p2 = eo(seg(lt, 0.25, 0.6)); ctx.save(); ctx.globalAlpha = p2; ctx.translate(0, (1 - p2) * 40);
    const fs = fit(e.baslik, S.w - 140, 84); rr(S.x + 40, S.y + 500, S.w - 80, 120, 22, '#fff', K, 8); txt(e.baslik, cx, S.y + 562, fs, K); ctx.restore();
    if (e.alt) { ctx.globalAlpha = eo(seg(lt, 0.5, 0.8)); ctx.font = '700 34px Poppins'; const w = ctx.measureText(e.alt).width + 44; rr(S.x + S.w - w - 50, S.y + 36, w, 60, 14, YEL, K, 5); txt(e.alt, S.x + S.w - w / 2 - 50, S.y + 67, 34, K); ctx.globalAlpha = 1; }
  } else if (e.tip === 'baglanti') {
    const [ad, col] = KIMLIK[e.kim], C = CHARS[e.kim];
    ctx.fillStyle = '#0D1030'; ctx.fillRect(S.x, S.y, S.w, S.h);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 2; for (let x = S.x; x < S.x + S.w; x += 48) { ctx.beginPath(); ctx.moveTo(x, S.y); ctx.lineTo(x, S.y + S.h); ctx.stroke(); } for (let y = S.y; y < S.y + S.h; y += 48) { ctx.beginPath(); ctx.moveTo(S.x, y); ctx.lineTo(S.x + S.w, y); ctx.stroke(); }
    rr(S.x, S.y, S.w, 110, 0, col); txt('CANLI BAĞLANTI', cx, S.y + 58, 60, '#fff');
    const p = eob(seg(lt, 0.1, 0.5));
    ctx.save(); ctx.beginPath(); ctx.arc(S.x + 290, S.y + 380, 190 * p, 0, 7); ctx.fillStyle = shade(col, 0.55); ctx.fill(); ctx.clip();
    ctx.translate(S.x + 290, S.y + 410); ctx.scale(1.25 * p, 1.25 * p); C.head(ctx, 0, 0, { expr: 'mutlu', mouth: 0.3, tilt: Math.sin(t * 3) * 6, look: [0.3, 0] }); ctx.restore();
    ctx.beginPath(); ctx.arc(S.x + 290, S.y + 380, 190 * p, 0, 7); ctx.strokeStyle = K; ctx.lineWidth = 10; ctx.stroke();
    const p2 = eo(seg(lt, 0.3, 0.7)); ctx.globalAlpha = p2;
    const fs = fit(ad, 380, 62); txt(ad, S.x + 720, S.y + 300, fs, '#fff');
    rr(S.x + 540, S.y + 350, 360, 70, 16, YEL, K, 5); txt('📍 ' + e.yer, S.x + 720, S.y + 386, fit('📍 ' + e.yer, 330, 38), K);
    for (let k = 0; k < 4; k++) { const on = (Math.floor(t * 5) % 5) > k; rr(S.x + 640 + k * 34, S.y + 520 - k * 22, 22, 30 + k * 22, 5, on ? GRN : 'rgba(255,255,255,0.2)'); }
    if (Math.floor(t * 3) % 2 === 0) txt('● BAĞLANIYOR', S.x + 720, S.y + 600, 38, RED);
    ctx.globalAlpha = 1;
  } else if (e.tip === 'hava') {
    const g = ctx.createLinearGradient(0, S.y, 0, S.y + S.h); g.addColorStop(0, '#1E3A8A'); g.addColorStop(1, '#60A5FA'); ctx.fillStyle = g; ctx.fillRect(S.x, S.y, S.w, S.h);
    snowfall(S, t, 35, 'rgba(255,255,255,0.45)', 6);
    txt(e.sehir + ' · HAVA DURUMU', cx, S.y + 70, 52, '#fff');
    e.gunler.forEach((gn, k) => {
      const p = eob(seg(lt, 0.15 + k * 0.25, 0.55 + k * 0.25)), x = cx + (k - (e.gunler.length - 1) / 2) * 295, y = S.y + 380;
      ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
      rr(-135, -230, 270, 470, 28, '#fff', K, 8); txt(gn[0], 0, -180, fit(gn[0], 230, 40), '#334155');
      wIcon(gn[3], 0, -60, 1.1, t);
      txt(gn[2], 0, 80, 86, '#F97316'); txt(gn[1], 0, 170, 66, '#2563EB');
      ctx.restore();
    });
    txt('en yüksek / en düşük', cx, S.y + S.h - 36, 28, 'rgba(255,255,255,0.85)', 'center', 500);
  } else if (e.tip === 'sayi') {
    const g = ctx.createLinearGradient(S.x, S.y, S.x + S.w, S.y + S.h); g.addColorStop(0, '#062A1E'); g.addColorStop(1, '#0F4C3A'); ctx.fillStyle = g; ctx.fillRect(S.x, S.y, S.w, S.h);
    ctx.strokeStyle = 'rgba(34,197,94,0.35)'; ctx.lineWidth = 6; ctx.beginPath();
    for (let x = 0; x <= S.w; x += 20) { const y = S.y + S.h - 120 - x * 0.25 - Math.sin(x * 0.03 + lt * 2) * 30; x ? ctx.lineTo(S.x + x, y) : ctx.moveTo(S.x + x, y); } ctx.stroke();
    txt(e.baslik, cx, S.y + 70, 50, '#fff');
    const n = e.kalemler.length;
    if (e.ikon) { const p = eob(seg(lt, 0.05, 0.45)); ctx.save(); ctx.translate(S.x + 250, S.y + 380); ctx.scale(p * 1.2, p * 1.2); icon(e.ikon, 0, 0, 1, lt); ctx.restore(); }
    e.kalemler.forEach((k, j) => {
      const p = eo(seg(lt, 0.2 + j * 0.3, 0.6 + j * 0.3));
      const bx = e.ikon ? S.x + 480 : S.x + 80, bw = e.ikon ? 420 : S.w - 160, by = n === 1 ? S.y + 240 : S.y + 160 + j * 250, bh = n === 1 ? 300 : 210;
      ctx.save(); ctx.globalAlpha = p; ctx.translate((1 - p) * 80, 0);
      rr(bx, by, bw, bh, 26, '#fff', K, 8); rr(bx, by, 22, bh, [26, 0, 0, 26], k[2]);
      txt(k[0], bx + bw / 2 + 10, by + (n === 1 ? 80 : 58), 44, '#475569');
      txt(k[1], bx + bw / 2 + 10, by + (n === 1 ? 190 : 140), fit(k[1], bw - 80, n === 1 ? 110 : 96), K);
      ctx.restore();
    });
  } else if (e.tip === 'mac') {
    pitch(S); ball(cx + Math.sin(lt * 2.2) * 300, S.y + 560 - Math.abs(Math.sin(lt * 5)) * 120, 46, lt * 6);
    txt('ŞAMPİYONLAR LİGİ', cx, S.y + 90, 48, '#fff');
    const p = eob(seg(lt, 0.1, 0.5)), p2 = eob(seg(lt, 0.3, 0.7));
    for (const [nm, cols0, y, pp] of [[e.ev, e.renk1, 230, p], [e.dep, e.renk2, 440, p2]]) {
      const tb = takimBul(nm), cols = cols0 || (tb ? [tb[0], tb[1]] : ['#64748B', '#1E293B']);
      ctx.save(); ctx.translate(cx, S.y + y); ctx.scale(pp, pp); const gg = ctx.createLinearGradient(-420, 0, 420, 0); gg.addColorStop(0, cols[0]); gg.addColorStop(1, cols[1]);
      rr(-420, -60, 840, 120, 20, gg, K, 8); txt(nm, 0, 6, fit(nm, 780, 80), '#fff'); ctx.restore();
    }
    txtOut('vs', cx, S.y + 335, 56, YEL, K, 10);
    rr(cx - 300, S.y + S.h - 100, 600, 70, 16, K); txt(e.alt, cx, S.y + S.h - 64, fit(e.alt, 560, 40), YEL);
  } else { // kapanis
    const g = ctx.createLinearGradient(S.x, S.y, S.x + S.w, S.y + S.h); g.addColorStop(0, '#0F766E'); g.addColorStop(1, '#14B8A6'); ctx.fillStyle = g; ctx.fillRect(S.x, S.y, S.w, S.h);
    confetti(S, lt); const p = eob(seg(lt, 0, 0.45)); clock(S.x + 230, S.y + 330, 150 * p, lt);
    txt(e.yazi || 'ANA HABER', S.x + 640, S.y + 220, fit(e.yazi || 'ANA HABER', 520, 70), '#fff'); txtOut(e.saat, S.x + 640, S.y + 350, 170, YEL, K, 16);
    rr(S.x + 120, S.y + S.h - 160, S.w - 240, 110, 24, '#fff', K, 8); const al = e.alt || 'GÖRÜŞMEK ÜZERE!'; txt(al, cx, S.y + S.h - 104, fit(al, S.w - 300, 62), K);
  }
}
function screenFrame(t) {
  const S = SCR, V = VS, i = lineAt(t), st = lineStart(i), lt = t - st;
  rr(S.x - 14, S.y - 14, S.w + 28, S.h + 28, 40, '#0A0C1E', '#000', 4);
  ctx.save(); ctx.beginPath(); ctx.roundRect(S.x, S.y, S.w, S.h, 28); ctx.clip();
  ctx.translate(S.x, S.y); ctx.scale(SK, SK);
  screenScene(L(i).ekran, t, lt);
  if (i > 0 && lt < 0.32) { const k = lt / 0.32; ctx.fillStyle = [YEL, RED, TEAL, PUR][i % 4]; ctx.fillRect(V.x + V.w * k - 40, V.y, V.w * (1 - k) + 40, V.h); }
  ctx.restore();
  rr(S.x, S.y, S.w, S.h, 28, null, K, 10); rr(S.x + 6, S.y + 6, S.w - 12, S.h - 12, 24, null, 'rgba(255,255,255,0.12)', 4);
}

// ---------- alt kisim: studyo ----------
function studioBack(t) {
  const g = ctx.createLinearGradient(0, LOW.y0, 0, LOW.y1 + 300); g.addColorStop(0, '#1B2050'); g.addColorStop(1, '#2E3480'); ctx.fillStyle = g; ctx.fillRect(-300, LOW.y0 - 300, W + 600, 1400);
  // arka duvar panelleri
  for (let k = 0; k < 7; k++) { const x = -60 + k * 180; rr(x, 940, 150, 560, 18, k % 2 ? 'rgba(124,92,255,0.18)' : 'rgba(20,184,166,0.14)'); }
  ctx.save(); ctx.globalAlpha = 0.09; for (let i = 0; i < 6; i++) { const x = 90 + i * 180 + Math.sin(t * 0.7 + i) * 30; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x - 20, LOW.y0); ctx.lineTo(x + 20, LOW.y0); ctx.lineTo(x + 140, 1700); ctx.lineTo(x - 140, 1700); ctx.closePath(); ctx.fill(); } ctx.restore();
  // arkadaki MM logosu
  memoCircle(ctx, 540, 1180, 250, 'rgba(255,210,63,0.10)'); memoCircle(ctx, 540, 1180, 250, null, 'rgba(255,210,63,0.35)', 6);
  ctx.globalAlpha = 0.25; txt('MM', 540, 1190, 220, YEL); ctx.globalAlpha = 1;
}
function desk(t) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(540, 1540, 470, 40, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(70, 1525); ctx.lineTo(1010, 1525); ctx.lineTo(1060, 1720); ctx.lineTo(20, 1720); ctx.closePath();
  const g = ctx.createLinearGradient(0, 1525, 0, 1720); g.addColorStop(0, '#FFD23F'); g.addColorStop(1, '#F59E0B'); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = K; ctx.lineWidth = 8; ctx.stroke();
  rr(50, 1500, 980, 40, 14, '#FFF4C7', K, 8);   // masa ustu
  rr(330, 1565, 420, 84, 18, NAVY, K, 6); txt('MANŞET MEMO', 540, 1608, 50, YEL);
  // kupa ve kagitlar
  rr(830, 1440, 66, 66, 12, '#fff', K, 6); ctx.strokeStyle = K; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(900, 1472, 18, -1.2, 1.2); ctx.stroke(); txt('M', 863, 1474, 34, RED);
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 4; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(850 + k * 14, 1430 - (t * 30 + k * 10) % 30); ctx.quadraticCurveTo(860 + k * 14, 1410 - (t * 30 + k * 10) % 30, 850 + k * 14, 1395 - (t * 30 + k * 10) % 30); ctx.stroke(); }
  ctx.save(); ctx.translate(200, 1490); ctx.rotate(-0.06); rr(-70, -14, 140, 22, 4, '#fff', K, 4); rr(-60, -26, 140, 22, 4, '#F1F5F9', K, 4); ctx.restore();
  ctx.restore();
}
// Masadaki Memo mikrofon tutmaz (yaka mikrofonu var), sol elinde not kagitlari olur.
const POSES = {
  sok:    { la: [-105, -150], ra: [105, 150], ll: [-16, -10], rl: [16, 10], mic: null },
  sun:    { la: [-20, 120], ra: [90, 140], ll: [-12, -6], rl: [14, 8], mic: null },
  goster: { la: [-20, 120], ra: [105, 145], ll: [-12, -6], rl: [12, 6], mic: null },
  usu:    { la: [-45, 60], ra: [35, -62], ll: [-8, -4], rl: [8, 4], mic: null },
  zafer:  { la: [-20, 120], ra: [90, 152], ll: [-14, -8], rl: [14, 8], mic: null },
  dur:    { la: [-20, 120], ra: [30, -40], ll: [-12, -6], rl: [12, 6], mic: null },
};
function papers(ctx, h, t) {   // elde not kagitlari (karakter koordinatlari)
  ctx.save(); ctx.translate(h[0] + 4, h[1] - 6); ctx.rotate(-0.18 + Math.sin(t * 1.3) * 0.02); ctx.lineJoin = 'round';
  for (const [dx, dy, r] of [[10, -8, 0.10], [5, -4, 0.05], [0, 0, 0]]) {
    ctx.save(); ctx.translate(dx, dy); ctx.rotate(r);
    ctx.beginPath(); ctx.rect(-8, -92, 72, 96); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke(); ctx.restore();
  }
  ctx.strokeStyle = '#94A3B8'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(2, -78 + k * 15); ctx.lineTo(k % 2 ? 40 : 52, -78 + k * 15); ctx.stroke(); }
  ctx.fillStyle = '#FF3B5C'; ctx.fillRect(2, -86, 22, 5);
  ctx.restore();
  memoCircle(ctx, h[0], h[1], 16, MEMO.skin, INK, 6);   // kagidi tutan el onde
}
function lapel(ctx) { memoCircle(ctx, 26, -322, 8, '#1E2235', INK, 3); memoCircle(ctx, 24, -324, 2.5, '#94A3B8'); }
function prevMemo(i) { for (let k = i - 1; k >= 0; k--) if (L(k).kim === 'memo') return k; return i; }
function memoPose(t, i) {
  const st = lineStart(i), j = prevMemo(i), k = j === i - 1 ? eo(seg(t, st, st + 0.35)) : 1;
  const cur = POSES[L(i).poz || 'sun'], prev = POSES[L(j).poz || 'sun'];
  const mix = a => [lerp(prev[a][0], cur[a][0], k), lerp(prev[a][1], cur[a][1], k)];
  return { la: mix('la'), ra: mix('ra'), ll: mix('ll'), rl: mix('rl'), mic: null };
}
function memoDesk(t, i) {
  const pl = L(i), st = D.times[i][0], lt = t - st, talking = talkingAt(t, i);
  let expr = pl.ifade || 'mutlu';
  if (pl.laughAt != null && lt > pl.laughAt && lt < (pl.laughEnd || 1e9)) expr = 'kahkaha';
  if (pl.wink && t > D.times[i][1] + 0.1) expr = 'goz';
  const blink = (t % 3.3 > 3.18 && expr !== 'kahkaha') ? 1 : 0;
  const face = { expr, mouth: talking ? mouthAt(t) : (expr === 'mutlu' ? 0.25 : expr === 'goz' ? null : 0), look: pl.look || [0.15, 0], blink, tilt: Math.sin(t * 1.7) * 3 };
  const P = memoPose(t, i); let y = 1895 + Math.sin(t * 2.4) * 4;
  if (pl.poz === 'zafer') y -= Math.abs(Math.sin(t * 6)) * 14;
  const h = drawChar(ctx, 540, y, 1.5, { pose: P, face, pointR: pl.point && seg(t, lineStart(i), lineStart(i) + 0.35) > 0.6, extraNeck: lapel }, CH_MEMO);
  ctx.save(); ctx.translate(540, y); ctx.scale(1.5, 1.5); papers(ctx, h.handL, t); ctx.restore();
  if (pl.poz === 'sun') { ctx.strokeStyle = '#fff'; ctx.lineWidth = 7; ctx.lineCap = 'round'; const a = Math.sin(t * 9) * 0.25; for (const r of [50, 75]) { ctx.beginPath(); ctx.arc(540 + h.handR[0] * 1.5, y + h.handR[1] * 1.5, r, -1.1 + a, 0.1 + a); ctx.stroke(); } }
}

// ---------- takim renkleri ----------
// 25.11.2026 (Cem): Fenerbahce haberinde Tarik'in stadyumu sari-kirmizi (Galatasaray) bayraklarla cizildi. Stadyum artik
// anlatilan Turk takiminin renklerini alir: [acik renk (serit, bayrak), koyu renk (tribun, bayrak)].
// Ayni satirda iki takim (derbi) ya da hic takim yoksa notr, cok renkli stadyum cizilir. Acik secim: ekran.takim.
const TAKIMLAR = [
  [['GALATASARAY'], ['#FDB912', '#A90432']],
  [['FENERBAHÇE'], ['#FFED00', '#0B2A6B']],
  [['BEŞİKTAŞ'], ['#FFFFFF', '#111111']],
  [['TRABZONSPOR'], ['#6CC5F0', '#7A1E35']],
  [['BAŞAKŞEHİR'], ['#F37021', '#1C2C5B']],
  [['ANADOLU EFES', 'EFES'], ['#FFFFFF', '#0A2D6E']],
  [['VAKIFBANK'], ['#FFD200', '#111111']],
  [['MİLLİ TAKIM', 'MİLLİLER', 'AY-YILDIZ', 'FİLENİN SULTANLARI', '12 DEV ADAM'], ['#FFFFFF', '#E30A17']],
];
const NOTR = null;
function takimlarIn(s) {   // metinde gecen takimlar (indeks kumesi)
  const u = (s || '').toLocaleUpperCase('tr-TR'), out = new Set();
  // kelime basi sarti: "NEFES" Efes sayilmaz; ek alabilir ("FENERBAHÇE'NİN", "GALATASARAYLI")
  TAKIMLAR.forEach(([adlar], k) => { if (adlar.some(a => new RegExp('(^|[^A-ZÇĞİÖŞÜ0-9])' + a.replace(/[-]/g, '\\-')).test(u))) out.add(k); });
  return out;
}
function takimBul(s) { const f = [...takimlarIn(s)]; return f.length === 1 ? TAKIMLAR[f[0]][1] : null; }
function takimCoz(v) {   // ekran.takim: "FENERBAHÇE" | ["#FFED00","#0B2A6B"] | "notr"
  if (Array.isArray(v)) return v;
  return String(v).toLowerCase() === 'notr' ? NOTR : takimBul(v);
}
function satirMetni(k) { const s = L(k), e = s.ekran || {}; return [s.alt, s.ses, e.baslik, e.alt, e.ev, e.dep, e.yazi].filter(Boolean).join(' '); }
function takimRenk(i) {   // satir i icin stadyum renkleri; geriye dogru bolumun baglanti satirina kadar bakar
  D._tr = D._tr || {}; if (i in D._tr) return D._tr[i];
  let r = NOTR;
  for (let k = i; k >= 0; k--) {
    const e = L(k).ekran || {};
    if (e.takim) { r = takimCoz(e.takim); break; }
    const f = takimlarIn(satirMetni(k));
    if (f.size === 1) { r = TAKIMLAR[[...f][0]][1]; break; }
    if (f.size > 1) { r = NOTR; break; }
    if (e.tip === 'baglanti') break;
  }
  return (D._tr[i] = r);
}

// ---------- alt kisim: saha ----------
function city(t, sky1, sky2, win) {
  const g = ctx.createLinearGradient(0, LOW.y0 - 200, 0, LOW.y1); g.addColorStop(0, sky1); g.addColorStop(1, sky2); ctx.fillStyle = g; ctx.fillRect(-300, LOW.y0 - 300, W + 600, 1400);
  const bw = [120, 90, 150, 100, 130, 95, 160, 110, 120, 140];
  let x = -120; bw.forEach((w, i) => { const h = 300 + (i * 97) % 260, top = 1560 - h; ctx.fillStyle = i % 2 ? '#26305C' : '#1E2750'; ctx.fillRect(x, top, w - 8, h + 200);
    ctx.fillStyle = win; for (let yy = top + 30; yy < 1540; yy += 50) for (let xx = x + 16; xx < x + w - 30; xx += 34) if ((xx * 7 + yy * 3 + i) % 5 > 1) ctx.fillRect(xx, yy, 14, 22); x += w; });
}
function fieldBack(kim, t, i) {
  if (kim === 'senol') {
    city(t, '#7D8FB8', '#C9D6EA', 'rgba(255,232,163,0.75)');
    // Galata kulesi silueti
    ctx.fillStyle = '#3A4668'; ctx.fillRect(806, 1090, 90, 500); ctx.beginPath(); ctx.moveTo(792, 1090); ctx.lineTo(851, 960); ctx.lineTo(910, 1090); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFE8A3'; for (let k = 0; k < 4; k++) ctx.fillRect(822 + k * 18, 1130, 9, 30);
    ctx.fillStyle = '#EEF4FB'; ctx.beginPath(); ctx.moveTo(-300, 1560); ctx.quadraticCurveTo(540, 1520, 1400, 1560); ctx.lineTo(1400, 1800); ctx.lineTo(-300, 1800); ctx.fill();
    snowfall({ x: -100, y: LOW.y0 - 100, w: W + 200, h: 900 }, t, 110, 'rgba(255,255,255,0.9)', 8);
  } else if (kim === 'pinar') {
    city(t, '#2A1E5C', '#4C3BA0', 'rgba(150,230,255,0.55)');
    rr(90, 990, 900, 150, 18, '#0B0F1E', K, 8);
    ctx.save(); ctx.beginPath(); ctx.rect(104, 1004, 872, 122); ctx.clip();
    // arka bant: bultenin kendi 'sayi' ekranlarindaki rakamlar (sabit/eski rakam yazilmaz)
    const kal = D.b.satirlar.flatMap(x => x.ekran && x.ekran.tip === 'sayi' ? x.ekran.kalemler.map(k => k[0] + ' ' + k[1]) : []);
    const s = (kal.length ? kal.join('   •   ') : 'PİYASALAR') + '   •   ', w = (ctx.font = '700 64px Poppins', ctx.measureText(s).width), x0 = 104 - ((t * 160) % w);
    for (const dx of [0, w]) { ctx.fillStyle = '#4ADE80'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(s, x0 + dx, 1066); }
    ctx.restore();
    ctx.fillStyle = '#C7CCE0'; ctx.fillRect(-300, 1560, W + 600, 300);
  } else if (kim === 'sinasi') {
    // Ankara: kolonlu resmi bina, bayrak, basin kameralari (hicbir partiyi cagristirmaz)
    const g = ctx.createLinearGradient(0, LOW.y0 - 200, 0, LOW.y1); g.addColorStop(0, '#5B7DB1'); g.addColorStop(1, '#C7D7EE'); ctx.fillStyle = g; ctx.fillRect(-300, LOW.y0 - 300, W + 600, 1400);
    for (let i = 0; i < 4; i++) { const cx2 = -100 + ((i * 330 + t * 25) % (W + 400)); memoEllipse(ctx, cx2, 980 + (i % 2) * 40, 110, 32, 0, 'rgba(255,255,255,0.7)'); }
    ctx.fillStyle = '#E7E2D6'; ctx.strokeStyle = '#8B8578'; ctx.lineWidth = 4;
    ctx.fillRect(330, 1000, 420, 120); ctx.strokeRect(330, 1000, 420, 120);   // orta kule
    for (let k = 0; k < 6; k++) { ctx.fillStyle = '#B9B2A2'; ctx.fillRect(352 + k * 68, 1020, 30, 80); }
    ctx.fillStyle = '#EFEBE1'; ctx.fillRect(-60, 1120, 1200, 330); ctx.strokeRect(-60, 1120, 1200, 330);
    ctx.fillStyle = '#D9D3C4'; ctx.fillRect(-60, 1120, 1200, 34);
    for (let k = 0; k < 12; k++) { const x = -20 + k * 100; ctx.fillStyle = '#F8F6F0'; ctx.fillRect(x, 1160, 40, 280); ctx.strokeStyle = '#B9B2A2'; ctx.lineWidth = 3; ctx.strokeRect(x, 1160, 40, 280); }
    for (let k = 0; k < 5; k++) { ctx.fillStyle = k % 2 ? '#D6D0C1' : '#E4DFD2'; ctx.fillRect(-100, 1440 + k * 24, 1300, 24); }
    // bayrak
    ctx.strokeStyle = '#CBD5E1'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(540, 1000); ctx.lineTo(540, 900); ctx.stroke();
    const wv = Math.sin(t * 4) * 8; ctx.beginPath(); ctx.moveTo(544, 904); ctx.quadraticCurveTo(600, 896 + wv, 660, 906); ctx.lineTo(660, 966 + wv * 0.5); ctx.quadraticCurveTo(600, 958 + wv, 544, 964); ctx.closePath(); ctx.fillStyle = '#E30A17'; ctx.fill();
    memoCircle(ctx, 588, 934 + wv * 0.3, 15, '#fff'); memoCircle(ctx, 594, 934 + wv * 0.3, 12, '#E30A17');
    ctx.save(); ctx.translate(615, 934 + wv * 0.3); ctx.fillStyle = '#fff'; ctx.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 4 : 9, a = k * Math.PI / 5 - Math.PI / 2; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.restore();
    // basin kameralari
    for (const cx2 of [80, 990]) { ctx.strokeStyle = '#1E2235'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cx2, 1420); ctx.lineTo(cx2 - 30, 1560); ctx.moveTo(cx2, 1420); ctx.lineTo(cx2 + 30, 1560); ctx.moveTo(cx2, 1420); ctx.lineTo(cx2, 1560); ctx.stroke();
      rr(cx2 - 46, 1370, 92, 54, 10, '#1E2235', K, 4); rr(cx2 + 40, 1382, 30, 30, 6, '#334155', K, 4); memoCircle(ctx, cx2 - 50, 1397, 4, Math.floor(t * 2) % 2 ? RED : '#7F1D1D'); }
    ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-300, 1560, W + 600, 300);
  } else {
    const g = ctx.createLinearGradient(0, LOW.y0 - 200, 0, LOW.y1); g.addColorStop(0, '#0B1030'); g.addColorStop(1, '#2B2F6B'); ctx.fillStyle = g; ctx.fillRect(-300, LOW.y0 - 300, W + 600, 1400);
    // stadyum
    ctx.beginPath(); ctx.moveTo(-100, 1560); ctx.lineTo(-60, 1160); ctx.quadraticCurveTo(540, 1040, 1140, 1160); ctx.lineTo(1180, 1560); ctx.closePath();
    const tr = takimRenk(i), koyu = tr ? tr[1] : '#475569';
    const bayrak = tr ? [tr[0], tr[1]] : [TEAL, PUR, '#FFFFFF', BLU];   // notr: hicbir kulubu cagristirmayan cok renk
    const sg = ctx.createLinearGradient(0, 1100, 0, 1560); sg.addColorStop(0, shade(koyu, 0.12)); sg.addColorStop(1, shade(koyu, -0.4)); ctx.fillStyle = sg; ctx.fill(); ctx.strokeStyle = K; ctx.lineWidth = 8; ctx.stroke();
    ctx.fillStyle = tr ? tr[0] : '#FFFFFF'; ctx.fillRect(-80, 1250, 1240, 26);
    for (let k = 0; k < 12; k++) { ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(-40 + k * 100, 1300, 60, 200); }
    for (const lx of [80, 1000]) { ctx.fillStyle = '#334155'; ctx.fillRect(lx - 6, 930, 12, 260); rr(lx - 60, 900, 120, 60, 8, '#E2E8F0', K, 5);
      const rg = ctx.createRadialGradient(lx, 930, 10, lx, 930, 380); rg.addColorStop(0, 'rgba(255,255,220,0.6)'); rg.addColorStop(1, 'rgba(255,255,220,0)'); ctx.fillStyle = rg; ctx.fillRect(lx - 400, 600, 800, 800); }
    // bayraklar
    for (let k = 0; k < 6; k++) { const fx = 60 + k * 190, fy = 1460, wv = Math.sin(t * 6 + k) * 10; ctx.strokeStyle = '#E2E8F0'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(fx, fy + 120); ctx.lineTo(fx, fy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(fx, fy); ctx.quadraticCurveTo(fx + 40, fy - 10 + wv, fx + 80, fy + wv); ctx.lineTo(fx + 80, fy + 50 + wv); ctx.quadraticCurveTo(fx + 40, fy + 40 + wv, fx, fy + 50); ctx.closePath(); ctx.fillStyle = bayrak[k % bayrak.length]; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 3; ctx.stroke(); }
    ctx.fillStyle = '#1F2937'; ctx.fillRect(-300, 1560, W + 600, 300);
    confetti({ x: 0, y: LOW.y0, w: W, h: 700 }, t);
  }
}
function reporter(kim, t, i) {
  const C = CHARS[kim], pl = L(i), talking = talkingAt(t, i);
  let expr = pl.ifade || 'mutlu'; const lt = t - D.times[i][0];
  if (expr === 'kahkaha' && talking && lt > 0.8) expr = 'mutlu';   // gulerek baslar, sonra konusur
  const blink = (t % 2.9 > 2.78 && expr !== 'kahkaha') ? 1 : 0;
  const face = { expr, mouth: talking ? mouthAt(t) : (expr === 'mutlu' ? 0.25 : 0), look: [0.15, 0], blink, tilt: Math.sin(t * 2) * 4 };
  let x = 500, y = 1880 + Math.sin(t * 2.6) * 5;
  if (kim === 'senol') x += Math.sin(t * 60) * 2.5;
  if (kim === 'tarik') y -= Math.abs(Math.sin(t * 5)) * 12;
  const s = 1.42, h = drawChar(ctx, x, y, s, { pose: C.propPose, face, micAng: -10 }, C);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); C.prop(ctx, h.handR); ctx.restore();
}
function nameplate(kim, t, i) {
  const [ad, col] = KIMLIK[kim], yer = sahaYer(i), st = lineStart(i), p = eo(seg(t, st + 0.15, st + 0.5));
  ctx.save(); ctx.globalAlpha = p; ctx.translate((1 - p) * -60, 0);
  const Y0 = 1478, X0 = SAFE;
  rr(X0, Y0, 150, 54, 12, RED, K, 4); if (Math.floor(t * 2) % 2 === 0) memoCircle(ctx, X0 + 28, Y0 + 27, 9, '#fff'); txt('CANLI', X0 + 84, Y0 + 29, 30, '#fff');
  ctx.font = '700 38px Poppins'; const w = ctx.measureText(ad).width + 44; rr(X0, Y0 + 62, w, 62, 12, col, K, 4); txt(ad, X0 + w / 2, Y0 + 94, 38, '#fff');
  if (yer) { const fy = fit('📍 ' + yer, W - SAFE - (X0 + w + 10) - 36, 28); ctx.font = `700 ${fy}px Poppins`; const w2 = ctx.measureText('📍 ' + yer).width + 36; rr(X0 + w + 10, Y0 + 69, w2, 48, 10, YEL, K, 4); txt('📍 ' + yer, X0 + w + 10 + w2 / 2, Y0 + 94, fy, K); }
  ctx.restore();
}
function sahaYer(i) { for (let k = i; k >= 0; k--) if (L(k).ekran.tip === 'baglanti') return L(k).ekran.yer; return ''; }

// ---------- kamera ----------
function shotFor(i) {
  const kim = L(i).kim; let n = 0; for (let k = 0; k < i; k++) if (L(k).kim === kim) n++;
  if (kim === 'memo') return [[540, 1290, 1], [540, 1205, 1.35], [600, 1240, 1.18]][n % 3];
  return [[540, 1290, 1], [520, 1220, 1.25]][n % 2];
}
function lower(t) {
  const i = lineAt(t), kim = L(i).kim, st = lineStart(i), lt = t - st;
  const [fx, fy, z0] = shotFor(i), z = z0 * (1 + 0.012 * lt);
  ctx.save(); ctx.beginPath(); ctx.rect(0, LOW.y0, W, LOW.y1 - LOW.y0); ctx.clip();
  ctx.save();
  let sx = 0, sy = 0; if (kim !== 'memo') { sx = Math.sin(t * 1.3) * 5 + Math.sin(t * 3.1) * 2; sy = Math.cos(t * 1.7) * 4; }
  ctx.translate(540 + sx, 1289 + sy); ctx.scale(z, z); ctx.translate(-fx, -fy);
  if (kim === 'memo') { studioBack(t); memoDesk(t, i); desk(t); }
  else { fieldBack(kim, t, i); reporter(kim, t, i); }
  ctx.restore();
  if (kim !== 'memo') nameplate(kim, t, i);
  // konusmaci degisince silme gecisi
  const prev = i > 0 ? L(i - 1).kim : kim;
  if (i > 0 && prev !== kim && lt < 0.45) {
    const k = lt / 0.45, cols = [YEL, RED, BLU, PUR];
    for (let b = 0; b < 4; b++) { const kk = clamp(k * 1.6 - b * 0.18); const x = lerp(-300, W + 300, kk);
      ctx.fillStyle = cols[b]; ctx.beginPath(); ctx.moveTo(x - 500, LOW.y0); ctx.lineTo(x + 100, LOW.y0); ctx.lineTo(x - 100, LOW.y1); ctx.lineTo(x - 700, LOW.y1); ctx.closePath(); ctx.fill(); }
  }
  ctx.restore();
}

// ---------- ust baslik, alt bant ----------
function background(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, NAVY); g.addColorStop(1, NAVY2); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; for (let x = 30; x < W; x += 60) for (let y = 200; y < 900; y += 60) { ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill(); }
}
function header(t) {
  rr(0, 0, W, 246, 0, 'rgba(10,12,30,0.65)');
  const X0 = SAFE, X1 = W - SAFE, Y = HEADER_Y;
  rr(X0, 52 + Y, 190, 70, 35, RED); if (Math.floor(t * 2) % 2 === 0) memoCircle(ctx, X0 + 40, 87 + Y, 12, '#fff'); txt('CANLI', X0 + 112, 89 + Y, 36, '#fff');
  const b = (D.b.baslik || 'ANA HABER') + (D.b.bolum ? ' · ' + D.b.bolum : ''); rr(X0 + 210, 46 + Y, 370, 82, 16, YEL, K, 6); txt(b, X0 + 395, 90 + Y, fit(b, 330, 50), K);
  txt(D.b.saat, X1, 74 + Y, 50, '#fff', 'right'); txt(D.b.tarih, X1, 114 + Y, 30, YEL, 'right', 500);
  ctx.globalAlpha = 0.6; txt('Yapay zekâ ile hazırlanmıştır', X1, 142 + Y, 20, '#fff', 'right', 500); ctx.globalAlpha = 1;
}
function band(t) {
  const i = lineAt(t), st = lineStart(i), k = i === 0 ? 1 : eo(seg(t, st, st + 0.3)), s = L(i);
  const Y = 1668; rr(0, Y, W, 176, 0, 'rgba(10,12,30,0.94)'); rr(0, Y, W, 8, 0, YEL);
  const [tag, col] = s.etiket; ctx.font = '700 32px Poppins'; const tw = ctx.measureText(tag).width + 44;
  rr(SAFE, Y - 30, tw, 56, 12, col, K, 5); txt(tag, SAFE + tw / 2, Y - 1, 32, '#fff');
  const AW = W - 2 * SAFE; let fs = 50, lines = wrap(s.alt, AW, fs);
  if (lines.length > 2) { fs = 44; lines = wrap(s.alt, AW, fs); }
  if (lines.length > 2) { fs = 40; lines = wrap(s.alt, AW, fs); }
  if (lines.length > 3) { fs = 36; lines = wrap(s.alt, AW, fs); }
  const lh = fs * (lines.length > 2 ? 1.15 : 1.22), y0 = Y + 92 - (Math.min(3, lines.length) - 1) * lh / 2 + (lines.length > 2 ? 8 : 4);
  ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - k) * 30); lines.slice(0, 3).forEach((l, j) => txt(l, SAFE, y0 + j * lh, fs, '#fff', 'left')); ctx.restore();
  rr(0, 1844, W, 76, 0, YEL);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 1844, W, 76); ctx.clip();
  ctx.font = '700 34px Poppins'; const w = ctx.measureText(D.b.ticker).width, x = -((t * 170) % w);
  txt(D.b.ticker, x, 1884, 34, K, 'left'); txt(D.b.ticker, x + w, 1884, 34, K, 'left'); ctx.restore();
}
function draw(t) { background(t); screenFrame(t); lower(t); header(t); band(t); }
