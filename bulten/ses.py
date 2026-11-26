# Kullanim: python3 ses.py <bulten_klasoru>
# ses/NN.wav dosyalarini kirpar, siraya dizer (voice.wav, anim.json), kodla muzik + efekt uretir, mix.wav yazar.
import numpy as np, soundfile as sf, json, subprocess, sys
D = sys.argv[1]; SR = 48000; FPS = 30
b = json.load(open(f'{D}/bulten.json')); S = b['satirlar']
def load(fn):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', fn, '-af', 'highpass=f=70,lowpass=f=9500', '-ar', str(SR), '-ac', '1', '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(float)
def trim(x, th=0.012):
    a = np.abs(x); w = int(0.01 * SR); m = np.convolve(a, np.ones(w) / w, 'same'); idx = np.where(m > th)[0]
    if len(idx) == 0: return x
    return x[max(0, idx[0] - int(0.03 * SR)): idx[-1] + int(0.08 * SR)]
def tempo(x, f):
    p = subprocess.run(['ffmpeg', '-loglevel', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-filter:a', f'atempo={f}', '-f', 'f32le', '-'], input=x.astype(np.float32).tobytes(), capture_output=True)
    return np.frombuffer(p.stdout, dtype=np.float32).astype(float)
def squeeze(x, th=0.012, maxsil=0.24):   # cumle arasi uzun sessizlikleri kisalt
    w = int(0.01 * SR); m = np.convolve(np.abs(x), np.ones(w) / w, 'same') > th
    out = []; i = 0; n = len(x)
    while i < n:
        if m[i]: j = i
        else:
            j = i
            while j < n and not m[j]: j += 1
            if j - i > maxsil * SR:
                h = int(maxsil * SR / 2); a, b = x[i:i + h].copy(), x[j - h:j].copy(); f = int(0.01 * SR)
                a[-f:] *= np.linspace(1, 0, f); b[:f] *= np.linspace(0, 1, f); out.append(a); out.append(b); i = j; continue
        k = j
        while k < n and (m[k] or k == j): k += 1
        out.append(x[i:k]); i = k
    return np.concatenate(out) if out else x
HEDEF = {'memo': 14.0}
parts = []
for i, s in enumerate(S):
    x = squeeze(trim(load(f'{D}/ses/{i:02d}.wav'))); x /= np.abs(x).max() + 1e-9
    rate = len(s['ses']) / (len(x) / SR)
    f = float(np.clip(HEDEF.get(s['kim'], 13.0) / rate, 1.0, 1.6))
    if i == 0: f = max(f, len(x) / SR / 1.8)   # kanca 2 sn altinda kalsin
    if f > 1.01: x = tempo(x, round(f, 3))
    fd = int(0.008 * SR); x = x.copy(); x[:fd] *= np.linspace(0, 1, fd); x[-fd:] *= np.linspace(1, 0, fd)   # tik onleyici
    print(i, s['kim'], 'hiz', round(rate, 1), 'carpan', round(f, 2), 'sure', round(len(x) / SR, 2))
    parts.append(x)
t = 0.05; times = []; voice = [np.zeros(int(0.05 * SR))]
for i, x in enumerate(parts):
    if i > 0:
        gap = 0.62 if S[i]['kim'] != S[i - 1]['kim'] else 0.28
        voice.append(np.zeros(int(gap * SR))); t += gap
    times.append([round(t, 3), round(t + len(x) / SR, 3)]); voice.append(x); t += len(x) / SR
voice.append(np.zeros(int(1.8 * SR))); v = np.concatenate(voice); DUR = len(v) / SR
sf.write(f'{D}/voice.wav', v, SR)
# dudak senkronu zarfi
n = int(np.ceil(DUR * FPS)); env = []
for i in range(n):
    c = i / FPS; s0 = v[int(max(0, c - 0.025) * SR): int((c + 0.025) * SR)]; db = 20 * np.log10(np.sqrt((s0 ** 2).mean() + 1e-12))
    env.append(float(np.clip((db + 44) / 26, 0, 1)))
sm = []; y = 0
for e in env: y = y + (e - y) * (0.75 if e > y else 0.45); sm.append(round(y, 3))
json.dump({'fps': FPS, 'dur': DUR, 'env': sm, 'times': times}, open(f'{D}/anim.json', 'w'))
# muzik
N = len(v); tt = np.arange(N) / SR; mus = np.zeros(N); BPM = 112; beat = 60 / BPM
note = lambda m: 440 * 2 ** ((m - 69) / 12)
def add(buf, sig, st):
    a = int(st * SR); z = min(N, a + len(sig))
    if 0 <= a < N: buf[a:z] += sig[:z - a]
ex = lambda L, k: np.exp(-np.arange(int(L * SR)) / SR * k)
def kick():
    q = np.arange(int(0.22 * SR)) / SR; f = 50 + 70 * np.exp(-q * 30); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-q * 14) * 0.9
rng = np.random.default_rng(1)
def hat(L=0.04): s = np.diff(rng.standard_normal(int(L * SR)), prepend=0); return s * ex(L, 90) * 0.06
def clap():
    s = rng.standard_normal(int(0.18 * SR)); s = np.convolve(s, np.ones(6) / 6, 'same') - np.convolve(s, np.ones(40) / 40, 'same'); return s * ex(0.18, 22) * 0.25
def pluck(m, L=0.25, vol=0.1):
    q = np.arange(int(L * SR)) / SR; f = note(m); return (np.sin(2 * np.pi * f * q) + 0.4 * np.sin(4 * np.pi * f * q)) * np.exp(-q * 9) * vol
def bass(m, L, vol=0.32):
    q = np.arange(int(L * SR)) / SR; f = note(m); return (np.sin(2 * np.pi * f * q) + 0.25 * np.sin(4 * np.pi * f * q)) * np.minimum(1, q / 0.01) * np.exp(-q * 3) * vol
chords = [(48, [60, 64, 67, 72]), (45, [57, 60, 64, 69]), (41, [57, 60, 65, 69]), (43, [55, 59, 62, 67])]
for bar in range(int(DUR / (4 * beat)) + 2):
    root, ch = chords[bar % 4]; b0 = bar * 4 * beat
    for k in range(4):
        tb = b0 + k * beat
        if k in (0, 2): add(mus, kick(), tb)
        if k in (1, 3): add(mus, clap(), tb)
        add(mus, hat(), tb + beat / 2); add(mus, hat(0.025), tb); add(mus, bass(root, beat * 0.9), tb + (beat / 2 if k == 3 else 0))
    for k in range(8): add(mus, pluck(ch[[0, 2, 1, 3, 2, 1, 3, 2][k]] + 12), b0 + k * beat / 2)
mus *= np.minimum(1, tt / 0.4) * np.clip((DUR - tt) / 1.2, 0, 1)
venv = np.interp(tt, np.arange(len(sm)) / FPS, sm); w = int(0.25 * SR); venv = np.convolve(venv, np.ones(w) / w, 'same')
mus *= 1 - 0.6 * np.clip(venv * 1.6, 0, 1)
# efektler
sfx = np.zeros(N)
def whoosh(L=0.4, vol=0.35):
    m = int(L * SR); s = rng.standard_normal(m); out = np.zeros(m); y = 0; q = np.arange(m) / m
    for i in range(m): y += (0.01 + 0.12 * q[i]) * (s[i] - y); out[i] = y
    return out * np.sin(np.pi * q) ** 2 * vol * 5
def sting():
    q = np.arange(int(0.9 * SR)) / SR; s = sum(np.sin(2 * np.pi * note(m) * q) + 0.3 * np.sin(4 * np.pi * note(m) * q) for m in [60, 64, 67, 72, 76]); return s / 5 * np.exp(-q * 4) * 0.5
def ding():
    q = np.arange(int(0.8 * SR)) / SR; return (np.sin(2 * np.pi * 1568 * q) + 0.5 * np.sin(2 * np.pi * 2352 * q)) * np.exp(-q * 5) * 0.12
def beep():   # baglanti sinyali
    q = np.arange(int(0.12 * SR)) / SR; one = np.sin(2 * np.pi * 1320 * q) * np.minimum(1, (0.12 - q) / 0.02) * 0.18
    return np.concatenate([one, np.zeros(int(0.06 * SR)), one, np.zeros(int(0.06 * SR)), np.sin(2 * np.pi * 1760 * np.arange(int(0.2 * SR)) / SR) * np.exp(-np.arange(int(0.2 * SR)) / SR * 10) * 0.2])
add(sfx, whoosh(0.35), 0.0); add(sfx, sting() * 0.8, 0.02)
if len(times) > 1: add(sfx, ding(), times[1][0] - 0.2)
for i in range(1, len(S)):
    if S[i]['kim'] != S[i - 1]['kim']: add(sfx, whoosh(0.45, 0.25), times[i][0] - 0.6)
    elif S[i]['ekran']['tip'] != S[i - 1]['ekran']['tip'] or i % 2 == 0: add(sfx, whoosh(0.35, 0.15), times[i][0] - 0.35)
    if S[i]['ekran']['tip'] == 'baglanti': add(sfx, beep(), times[i][0] + 0.2)
add(sfx, sting(), times[-1][1] + 0.15)
vo = v / (np.abs(v).max() + 1e-9); mus /= np.abs(mus).max() + 1e-9
mix = vo * 0.9 + mus * 0.2 + sfx * 0.5; mix /= np.abs(mix).max() / 0.8
sf.write(f'{D}/mix.wav', np.stack([mix, mix], 1), SR)
print('sure', round(DUR, 2), 'kanca', round(times[0][1] - times[0][0], 2), 'kare', n)
