#!/bin/bash
# Depoyu kucuk tutar: yalnizca son 2 gunun kartlari ve bulten videolari kalir, git gecmisi tek commit'e indirilir.
# Gunde bir kez (Europe/Istanbul 03:xx calismasinda) calistirilir. Buffer'da bekleyen planli postlar en fazla 2 saat icinde
# gittigi icin 2 gunluk kartlar yeterlidir.
set -e
cd "$(dirname "$0")/.."
g1=$(TZ=Europe/Istanbul date +%F); g2=$(TZ=Europe/Istanbul date -d yesterday +%F)
for d in kartlar/*/ videolar/*/; do
  [ -d "$d" ] || continue
  n=$(basename "$d"); if [ "$n" != "$g1" ] && [ "$n" != "$g2" ]; then rm -rf "$d"; fi
done
git checkout -q --orphan temiz
git add -A
git commit -qm "Depo temizligi: yalnizca $g2 ve $g1 kartlari"
git branch -D main >/dev/null 2>&1 || true
git branch -m main
git push -q -f origin main
echo "temizlendi: $(git count-objects -vH | grep size-pack)"
