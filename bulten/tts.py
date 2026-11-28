# Kullanim: GEMINI_KEY=... python3 tts.py <bulten_klasoru>
# Bulteni bloklara boler (her blok: Memo + en fazla bir muhabir), her blogu TEK istekte iki sesli okutur,
# sessizliklerden satirlara boler (ses/NN.wav) ve her satiri yaziya dokup metinle karsilastirir.
# Ucretsiz katmanda model basina gunluk ~10 istek var; bu yuzden satir basina degil blok basina istek atilir.
import json, os, sys, base64, time, wave, difflib, re, subprocess, urllib.request, urllib.error
import numpy as np
KEY = os.environ['GEMINI_KEY']; D = sys.argv[1]; os.makedirs(f'{D}/ses', exist_ok=True)
TTSLER = ['gemini-3.8-flash-tts', 'gemini-3.8-flash-lite-tts', 'gemini-3.1-flash-tts-preview', 'gemini-2.5-flash-preview-tts']
STTLER = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-2.5-flash-lite', 'gemini-3.1-flash-lite']
OLU = set()
SES = {'memo': ('Memo', 'Puck'), 'senol': ('Senol', 'Achird'), 'pinar': ('Pinar', 'Laomedeia'), 'tarik': ('Tarik', 'Fenrir'), 'sinasi': ('Sinasi', 'Charon')}
SR = 24000

class Gunluk(Exception): pass
def post(model, body, tries=5):
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent'
    for k in range(tries):
        try:
            r = urllib.request.Request(url, data=json.dumps(body).encode(), headers={'x-goog-api-key': KEY, 'Content-Type': 'application/json'})
            return json.load(urllib.request.urlopen(r, timeout=150))
        except urllib.error.HTTPError as e:
            msg = e.read().decode()[:600]
            if e.code == 429 and 'per day' in msg: raise Gunluk(model)
            if e.code in (404,): raise Gunluk(model)
            if e.code in (429, 500, 503) and k < tries - 1: time.sleep(15 * (k + 1)); continue
            raise RuntimeError(f'{model} {e.code} {msg}')
        except (TimeoutError, urllib.error.URLError, ConnectionError) as e:
            if k < tries - 1: time.sleep(5); continue
            raise
def first_ok(models, body, alt=None):   # alt: model 400 (bicim hatasi) verirse ayni modelde denenecek ikinci govde
    for m in models:
        if m in OLU: continue
        for b in [body] + ([alt] if alt else []):
            try: return post(m, b), m
            except Gunluk: OLU.add(m); print('kota/erisim yok:', m, flush=True); break
            except RuntimeError as e:
                if ' 400 ' not in str(e): raise
                print('400 (bicim):', m, str(e)[:160].replace(chr(10), ' '), flush=True)
    raise RuntimeError('KOTA_BITTI' if all(m in OLU for m in models) else 'HICBIR_MODEL_KABUL_ETMEDI')
def stt(pcm_wav_path):
    body = {'contents': [{'parts': [{'inlineData': {'mimeType': 'audio/wav', 'data': base64.b64encode(open(pcm_wav_path, 'rb').read()).decode()}},
            {'text': 'Transcribe every word spoken in this audio verbatim, in the language it is spoken (it may contain English and Turkish). Output only the transcript.'}]}]}
    j, _ = first_ok(STTLER, body); return j['candidates'][0]['content']['parts'][0]['text'].strip()

BIR = 'sıfır bir iki üç dört beş altı yedi sekiz dokuz'.split(); ON = ' on yirmi otuz kırk elli altmış yetmiş seksen doksan'.split(' ')
def sayi(n):
    if n == 0: return 'sıfır'
    out = []
    if n >= 1000: k = n // 1000; out += ([] if k == 1 else sayi(k).split()) + ['bin']; n %= 1000
    if n >= 100: k = n // 100; out += ([] if k == 1 else [BIR[k]]) + ['yüz']; n %= 100
    if n >= 10: out.append(ON[n // 10]); n %= 10
    if n: out.append(BIR[n])
    return ' '.join(out)
def norm(s):
    s = s.replace('İ', 'i').replace('I', 'ı').lower()
    s = re.sub(r'(\d+)\.(\d{3})\b', r'\1\2', s)                       # 5.900 -> 5900
    s = re.sub(r'(\d+)[.:,](\d{1,2})\b', lambda m: m.group(1) + ' ' + m.group(2), s)   # 20.45 -> 20 45
    s = re.sub(r'\d+', lambda m: ' ' + sayi(int(m.group())) + ' ', s)
    return re.sub(r'[^a-zçğıöşü ]', ' ', s).split()
def benzer(a, b): return difflib.SequenceMatcher(None, norm(a), norm(b)).ratio()

# Sesletim duzeltmeleri. 25.11.2026 (Cem): ana haberde "basketbol" "battebol" gibi okundu.
# Anahtar: yazilis (kelime basi, ek alabilir), deger: TTS'e giden okunus. Ekrandaki altyazi (alt) degismez.
# Kontrol ayrica her anahtarin STT dokumunde gectigini arar; gecmezse satir HATALI sayilir ve yeniden okutulur.
# Yeni bir yanlis okuma gorulurse buraya ekle.
SESLETIM = {'basketbol': 'basket bol'}
def sesletim(s):
    for a, b in SESLETIM.items():
        s = re.sub(r'(?<![a-zçğıöşü])' + a, lambda m: (b[0].upper() + b[1:]) if m.group()[0].isupper() else b, s, flags=re.I)
    return s
def kritik_eksik(orj, duy):   # orjinal metindeki sesletim kelimeleri dokumde (bosluksuz) geciyor mu
    j = ''.join(norm(duy)); o = ' '.join(norm(orj))
    return [a for a in SESLETIM if re.search(r'(?<![a-zçğıöşü])' + a, o) and a not in j]

def bloklar(S):   # ardisik satirlari, en fazla iki konusmaci ve ~45 sn olacak sekilde grupla
    out, cur, kisiler, uz = [], [], set(), 0
    for i, s in enumerate(S):
        k2 = kisiler | {s['kim']}
        if cur and (len(k2) > 2 or uz + len(s['ses']) > 650): out.append(cur); cur, kisiler, uz = [], set(), 0; k2 = {s['kim']}
        cur.append(i); kisiler = k2; uz += len(s['ses'])
    if cur: out.append(cur)
    return out

def seslendir(S, idx):
    kim = []; [kim.append(S[i]['kim']) for i in idx if S[i]['kim'] not in kim]
    satir = '\n'.join(f"{SES[S[i]['kim']][0]}: {S[i]['ses']}" for i in idx)
    if len(kim) == 1:
        prompt = f"Say in Turkish, energetic and cheerful:\n{satir.split(': ', 1)[1] if len(idx) == 1 else chr(10).join(S[i]['ses'] for i in idx)}"
        sc = {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': SES[kim[0]][1]}}}
    else:
        prompt = f"TTS the following Turkish TV news conversation between {SES[kim[0]][0]} and {SES[kim[1]][0]}, lively and cheerful:\n{satir}"
        sc = {'multiSpeakerVoiceConfig': {'speakerVoiceConfigs': [{'speaker': SES[k][0], 'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': SES[k][1]}}} for k in kim]}}
    gc = {'responseModalities': ['AUDIO'], 'speechConfig': sc}
    body = {'contents': [{'parts': [{'text': prompt}]}], 'generationConfig': gc}
    if len(kim) == 1: j, m = first_ok(TTSLER, body)
    else:   # 25.11.2026: gemini-3.8 cok sesli istekte her metin parcasinda speechMetadata.speaker istiyor (yoksa 400); eski bicim yedek
        yeni = {'contents': [{'parts': [{'text': S[i]['ses'], 'speechMetadata': {'speaker': SES[S[i]['kim']][0]}} for i in idx]}], 'generationConfig': gc}
        j, m = first_ok(TTSLER, yeni, alt=body)
    parcalar = []
    for p in j['candidates'][0]['content']['parts']:
        if 'inlineData' not in p: continue
        part = p['inlineData']; raw = base64.b64decode(part['data'])
        if raw[:4] == b'RIFF':   # yeni modeller hazir WAV dosyasi doner (basligi ses diye okursak tik sesi olur)
            import io
            with wave.open(io.BytesIO(raw)) as w: sr0 = w.getframerate(); raw = w.readframes(w.getnframes())
        else:
            r = re.search(r'rate=(\d+)', part.get('mimeType', '')); sr0 = int(r.group(1)) if r else 24000
        pcm = np.frombuffer(raw, dtype=np.int16).astype(float) / 32768
        if sr0 != SR: pcm = np.interp(np.arange(int(len(pcm) * SR / sr0)) * sr0 / SR, np.arange(len(pcm)), pcm)
        parcalar += ([np.zeros(int(0.35 * SR))] if parcalar else []) + [pcm]
    print('ses parcasi:', (len(parcalar) + 1) // 2, 'model:', m, flush=True)
    return np.concatenate(parcalar), m

def wav(path, x):
    with wave.open(path, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())

def bol(x, metinler):   # sessizliklerden N parcaya bol (karakter sayisina orantili beklenen sinirlara en yakin sessizlikler)
    w = int(0.02 * SR); e = np.sqrt(np.convolve(x ** 2, np.ones(w) / w, 'same')); sesli = e > 0.01
    idx = np.where(sesli)[0]; a, z = idx[0], idx[-1]
    sil = []; i = a
    while i < z:
        if not sesli[i]:
            j = i
            while j < z and not sesli[j]: j += 1
            if j - i > 0.12 * SR: sil.append(((i + j) // 2, (j - i) / SR))
            i = j
        else: i += 1
    N = len(metinler)
    if N == 1: return [(a, z)]
    L = np.array([len(m) for m in metinler], float); hedef = a + (z - a) * np.cumsum(L)[:-1] / L.sum()
    # DP: N-1 sinir sec, sirali; maliyet = beklenen konumdan uzaklik - sessizlik uzunlugu odulu
    C = len(sil); INF = 1e18
    if C < N - 1: return None
    dp = np.full((N, C), INF); par = np.zeros((N, C), int)
    for c in range(C): dp[1, c] = abs(sil[c][0] - hedef[0]) / SR - 2.0 * sil[c][1]
    for k in range(2, N):
        for c in range(C):
            best = INF
            for p in range(c):
                v = dp[k - 1, p] + abs(sil[c][0] - hedef[k - 1]) / SR - 2.0 * sil[c][1]
                if v < best: best, par[k, c] = v, p
            dp[k, c] = best
    c = int(np.argmin(dp[N - 1])); sinir = [c]
    for k in range(N - 1, 1, -1): c = par[k, c]; sinir.append(c)
    sinir = [sil[c][0] for c in reversed(sinir)]
    kes = [a] + sinir + [z]
    return [(kes[k], kes[k + 1]) for k in range(N)]

d = json.load(open(f'{D}/bulten.json')); S = d['satirlar']
for s in S: s['ses_orj'] = s['ses']; s['ses'] = sesletim(s['ses'])   # TTS ve benzerlik okunusla, kritik kontrol orjinalle
rapor = json.load(open(f'{D}/ses/kontrol.json')) if os.path.exists(f'{D}/ses/kontrol.json') else {}
for blok in bloklar(S):
    if all(rapor.get(str(i), {}).get('ok') for i in blok): continue
    for deneme in range(3):
        x, model = seslendir(S, blok)
        parcalar = bol(x, [S[i]['ses'] for i in blok])
        if parcalar is None: print('blok', blok, 'bolunemedi, tekrar'); continue
        hepsi = True; gecici = {}
        for i, (p0, p1) in zip(blok, parcalar):
            fn = f'{D}/ses/{i:02d}.wav'; wav(fn, x[max(0, p0 - int(0.03 * SR)): p1 + int(0.06 * SR)])
            duy = stt(fn); oran = benzer(S[i]['ses'], duy); fazla = len(norm(duy)) - len(norm(S[i]['ses']))
            eksik = kritik_eksik(S[i]['ses_orj'], duy)
            ok = oran >= 0.75 and fazla <= 3 and not eksik
            gecici[str(i)] = {'ok': ok, 'oran': round(oran, 2), 'duyulan': duy, 'model': model, **({'kritik_eksik': eksik} if eksik else {})}
            print(i, S[i]['kim'], round(oran, 2), 'ok' if ok else 'HATALI', ('KRITIK:' + ','.join(eksik) + ' ') if eksik else '', duy[:80], flush=True)
            hepsi &= ok
        rapor.update(gecici); json.dump(rapor, open(f'{D}/ses/kontrol.json', 'w'), ensure_ascii=False, indent=1)
        if hepsi: break
print('tamam' if all(rapor.get(str(i), {}).get('ok') for i in range(len(S))) else 'HATALI SATIR VAR')
