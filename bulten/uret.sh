#!/bin/bash
# Kullanim: GEMINI_KEY=... bash bulten/uret.sh <bulten_klasoru>     (klasorde bulten.json olmali)
# Sesleri uretir ve kontrol eder, muzik ve efektleri ekler, videoyu cizer: <klasor>/video.mp4
# Cikis kodlari: 3 = ses kotasi bitti ya da hatali satir var, 4 = video 138 sn'den uzun (metni kisalt).
set -e
B="$(cd "$(dirname "$0")" && pwd)"; D="$(cd "$1" && pwd)"
python3 -c "import numpy, soundfile" 2>/dev/null || pip install -q --break-system-packages numpy soundfile
export NODE_PATH=${NODE_PATH:-/opt/npm-tools/node_modules}
python3 "$B/tts.py" "$D" | tee "$D/tts.log"
if ! tail -1 "$D/tts.log" | grep -q '^tamam'; then echo "SES HATASI: $D/ses/kontrol.json dosyasina bak"; exit 3; fi
python3 "$B/ses.py" "$D" | tee "$D/ses.log"
SURE=$(python3 -c "import json;print(json.load(open('$D/anim.json'))['dur'])")
python3 -c "import sys; sys.exit(0 if $SURE <= 138 else 1)" || { echo "VIDEO COK UZUN: $SURE sn"; exit 4; }
node "$B/render.js" "$D" video 0 2 > "$D/render_0.log" 2>&1 &
node "$B/render.js" "$D" video 1 2 > "$D/render_1.log" 2>&1 &
wait
grep -q '^ok' "$D/render_0.log" && grep -q '^ok' "$D/render_1.log" || { cat "$D"/render_*.log; exit 5; }
printf "file '%s'\nfile '%s'\n" "$D/parca_0.mp4" "$D/parca_1.mp4" > "$D/liste.txt"
ffmpeg -y -loglevel error -f concat -safe 0 -i "$D/liste.txt" -i "$D/mix.wav" -map 0:v -map 1:a -c:v copy \
  -af loudnorm=I=-14:TP=-2:LRA=11,alimiter=limit=0.84:level=false -c:a aac -b:a 128k -ar 48000 -shortest -movflags +faststart "$D/video.mp4"
ffprobe -v error -show_entries format=duration,size -of compact "$D/video.mp4"
