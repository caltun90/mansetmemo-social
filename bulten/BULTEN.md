# Manşet Memo video bültenleri

Bulutta çalışan bülten görevlerinin kural kitabı. Haber seçimi, doğrulama, tarafsızlık ve "asla alma" listesi için `KIT.md` geçerlidir. Görev talimatıyla çelişirse görev talimatındaki KESİN KURALLAR geçerlidir.

## Takvim
| Bülten | Görev başlar | Yayın | Süre | Saha muhabiri |
|---|---|---|---|---|
| Gün ortası 1 | 11:25 | 12:00 | 70-110 sn | Piyasa Pınar (ekonomi: döviz, altın, borsa, zam, faiz) |
| Gün ortası 2 | 15:25 | 16:00 | 70-110 sn | Şemsiye Şenol (hava, trafik, şehir, valilik ve belediye duyuruları). O akşam büyük maç varsa Tribün Tarık da eklenebilir. |
| Ana haber | 18:05 | 19:00 ve 19:05 | 2 bölüm, her biri 110-135 sn | Memo + en az iki muhabir (konuya göre Pınar, Şenol, Tarık, Şinasi) |

Günün önemli bir siyasi ya da adli gelişmesi varsa, hangi bülten olursa olsun Siyasi Şinasi bağlantısı eklenir (gün ortasında slotun muhabirine ek olarak). Bağlantı sırası: Memo "Ankara'dan Siyasi Şinasi bağlanıyor, Şinasi son durum ne?" der, Şinasi 2-3 satırda olguyu anlatır ve "Söz sende Memo!" ile bitirir.

Saatler Europe/Istanbul. X'e Buffer üzerinden en fazla 140 sn video gidiyor, bu yüzden her video 138 sn'yi geçemez (`uret.sh` kontrol eder). Ana haber iki ayrı videodur: 1. bölümün kapanışı "İkinci bölüm birazdan" der, 2. bölüm kendi kancasıyla açılır.

## Karakterler ve sesler
- `memo`: Manşet Memo, stüdyoda masada. Elinde mikrofon yok (yaka mikrofonu var), sol elinde not kağıtları tutar. El mikrofonunu yalnız sahadaki muhabirler tutar. Ses Puck. Haberleri bağlar, muhabire "... bağlanıyoruz, durum nasıl?" diye söz verir.
- `pinar`: Piyasa Pınar, ekonomi. Ses Laomedeia. Rakamları sade söyler.
- `senol`: Şemsiye Şenol, hava ve şehir. Ses Achird. Üşüyen, komik ama bilgiyi doğru veren muhabir.
- `tarik`: Tribün Tarık, spor. Ses Fenrir. Heyecanlı.
- `sinasi`: Siyasi Şinasi, siyaset ve yargı muhabiri, Ankara'dan bağlanır (`yer`: "ANKARA" ya da olayın yeri, ör. "İSTANBUL ADLİYESİ"). Ses Charon. Cem'in isteğiyle (24.11.2026) siyasi ve adli haberleri (gözaltı, tutuklama, tahliye, mahkeme kararı, parti ve Meclis kararları, önemli açıklamalar) Memo değil Şinasi anlatır. Ton ciddi ve tarafsız, `ifade` ciddi ya da mutlu; şaka, ironi, yorum yok. Renkleri bilerek hiçbir partiyi çağrıştırmaz.
- Muhabir bölümü her zaman Memo'nun bağlantı satırıyla başlar (`ekran.tip = "baglanti"`) ve muhabirin "Söz sende Memo!" demesiyle biter.

## bulten.json
Örnek: `bulten/ornek/gun-ortasi.json`. Alanlar:
- `tur` ("ogle" ya da "aksam"), `baslik` ("GÜN ORTASI" ya da "ANA HABER"), `bolum` (yalnız ana haberde "1/2" ya da "2/2"), `tarih` ("25 KASIM"), `saat` ("12:00"), `ticker` (alt bantta kayan 3-4 kısa başlık, " • " ile ayrılmış, sonu "   •   ").
- `satirlar`: sırayla her satır:
  - `kim`: memo | pinar | senol | tarik | sinasi
  - `alt`: ekranda görünen altyazı (en fazla ~80 karakter, rakamlar rakamla: "50,6 lira", "20.45"). Yazılar yanlardan 100 px güvenli alanda durur; daha uzun altyazı 3 satıra düşer ve küçülür.
  - `ses`: seslendirilecek metin. Yanlış okunan kelimeler `tts.py` SESLETIM sözlüğüyle otomatik düzeltilir ("basketbol" -> "basket bol"); yeni bir yanlış okuma görülürse oraya ekle. Rakamları, saatleri ve kısaltmaları YAZIYLA yaz ("elli lira altmış kuruş", "saat yirmi kırk beşte", "TRT Bir"). Kısa cümleler, satır başına 1-2 cümle, en fazla ~130 karakter.
  - `etiket`: ["HAVA DURUMU", "#3B82F6"] gibi. Renkler: gündem/açılış #7C5CFF, son dakika/şehir #FF3B5C, hava #3B82F6, ekonomi #22C55E, spor #F97316, eğitim #7C5CFF, siyaset/yargı #1E40AF.
  - Memo için: `poz` (sun: el sallar, goster: ekranı gösterir, sok: iki kol havada, zafer: sevinç), `ifade` (mutlu, sok, ciddi, kahkaha), `point` (true: ekranı işaret eder), `laughAt`/`laughEnd` (sn), `wink` (true: satır sonunda göz kırpar).
  - Muhabir için: `ifade` (mutlu, sok, ciddi, kahkaha).
  - `ekran` (üstteki büyük ekran):
    - `{"tip":"kanca","yazi":"0°","ust":"İSTANBUL","ikon":"kar"}`: ilk satır için. `yazi` çok kısa ve büyük olmalı (en fazla 5-6 karakter).
    - `{"tip":"acilis","yazi":"GÜN ORTASI","alt":"BÜLTENİ"}`
    - `{"tip":"haber","ikon":"...","baslik":"...","alt":"...","renk":"#..."}`: ikonlar: ogretmen, aslan, kar, gunes, tv, altin, para, megafon. Uygun ikon yoksa megafon.
    - `{"tip":"baglanti","kim":"senol","yer":"İSTANBUL"}`: Memo'nun muhabire bağlandığı satır.
      Tarık için isteğe bağlı `"takim"`: "FENERBAHÇE" gibi takım adı, `["#FFED00","#0B2A6B"]` gibi [açık, koyu] renk ya da "notr". Verilmezse Tarık'ın stadyumu (tribün, şerit, bayraklar) satırda geçen Türk takımının renklerini kendisi alır (`bulten.js` TAKIMLAR: Galatasaray sarı-kırmızı, Fenerbahçe sarı-lacivert, Beşiktaş siyah-beyaz, Trabzonspor bordo-mavi, Başakşehir turuncu-lacivert, Anadolu Efes lacivert-beyaz, VakıfBank sarı-siyah, milli takım kırmızı-beyaz). İki takım (derbi) ya da tanınmayan takımda nötr, çok renkli stadyum çizilir. Listede olmayan bir takım anlatılıyorsa `takim` alanına doğru renkleri yaz.
    - `{"tip":"hava","sehir":"İSTANBUL","gunler":[["BUGÜN","6°","9°","bulut"],["ÇARŞAMBA","0°","9°","kar"],["PERŞEMBE","1°","13°","gunes"]]}`: [gün, en düşük, en yüksek, bulut|kar|gunes]
    - `{"tip":"sayi","baslik":"PİYASALAR · SABAH","kalemler":[["DOLAR","50,6 ₺","#22C55E"],["EURO","55,3 ₺","#3B82F6"]],"ikon":"altin"}`: en fazla 2 kalem; tek kalemde `ikon` verilebilir.
    - `{"tip":"mac","ev":"GALATASARAY","dep":"ASTON VILLA","renk1":["#FDB912","#C8102E"],"renk2":["#7A003C","#5DADE2"],"alt":"BU AKŞAM 20.45 · RAMS PARK"}`
      `renk1`/`renk2` takımın gerçek renkleri olmalı (Fenerbahçe ["#FFED00","#0B2A6B"], Galatasaray ["#FDB912","#A90432"]); verilmezse TAKIMLAR listesinden alınır.
    - `{"tip":"kapanis","saat":"19:00","yazi":"ANA HABER","alt":"GÖRÜŞMEK ÜZERE!"}`

## Metin kuralları
- İlk satır kancadır: 2 saniyenin altında, şaşırtıcı ve doğru bir cümle ("İstanbul'a sıfır derece geliyor!"). Tık tuzağı ya da abartı yok.
- İkinci satır selam: "Merhaba, ben Manşet Memo. Gün ortası bülteniyle karşınızdayım!" (akşam: "İyi akşamlar, ben Manşet Memo. Ana haber bülteni başlıyor!").
- Her haber KIT.md'deki doğrulama kurallarından geçmiş olmalı (ajans, resmi kurum ya da en az iki büyük kaynak, bugünün tarihi). Rakamları kaynakla birebir karşılaştır, yuvarlarken "civarında, dolaylarında" de ve saatini söyle ("bu sabah").
- Mizah karakterlerden ve sahneden gelir, haberin kendisiyle dalga geçilmez. Ölüm, şiddet ve kaza bültene girmez. Günün büyük siyasi ve adli gelişmeleri (tutuklama, tahliye, mahkeme kararı, önemli açıklamalar) bültene girer ve Siyasi Şinasi anlatır; KIT.md "Siyaset ve yargı" kurallarıyla, olgu diliyle ve ciddi tonla (şaka yok). Polemik ve yorum yok.
- Uzun tire (—) yok. Gün ortası 12-16 satır, ana haber bölümü 16-20 satır.

## Üretim
1. Klasör: `b/YYYY-MM-DD-<ad>/bulten.json` (ad: ogle-12, ogle-16, aksam-1, aksam-2). `b/` klasörü commit edilmez.
2. `GEMINI_KEY=<anahtar> bash bulten/uret.sh b/<klasor>` (2-4 dk). Çıkış:
   - 0: `video.mp4` hazır.
   - 3: ses hatası. `ses/kontrol.json` dosyasına bak. "KOTA_BITTI" görürsen o gün ses üretilemez: bülteni atla, video paylaşma. Hatalı satır varsa satırın `ses` metnini sadeleştir ve komutu bir kez daha çalıştır (yalnız hatalı bloklar yeniden üretilir).
   - 4: video 138 sn'den uzun. Satır sil ya da kısalt, `ses/` klasörünü sil, tekrar çalıştır. (Ses kotasını korumak için önce metnin uzunluğunu tahmin et: toplam `ses` karakteri / 14 + satır sayısı x 0.4 sn.)
3. Kontrol: `ffmpeg -ss <t> -i video.mp4 -frames:v 1` ile 5-6 kare al (kanca, bağlantı, muhabir, kapanış) ve Read ile bak. `ses/kontrol.json` içindeki her satırın `duyulan` metnini oku: satırda İngilizce talimat, fazladan ya da eksik cümle olmamalı.
4. Yayın: videoyu `videolar/YYYY-MM-DD/<ad>.mp4` olarak kopyala, commit + push (çakışırsa `git pull --rebase` ve tekrar push). Raw linkin 200 döndüğünü doğrula, sonra:
   `select haber.buffer_video('manset', $m$<metin>$m$, 'bulten-<ad>-YYYY-MM-DD', '<raw link>', '<başlık>', '<YYYY-MM-DD HH:MI>+03');`
   Yayın saati geçmişse ya da 2 dakikadan yakınsa son parametreyi `null` ver (hemen paylaşılır).
5. ~5 sn sonra `select haber.sonuclari_isle();` ve `select id, konu, durum, buffer_post_id, hata from haber.paylasimlar where sayfa='manset' order by id desc limit 3;`

## Paylaşım metni
Başta tek emoji (🎙️), 1-2 kısa cümle: bültenin en dikkat çekici 2-3 başlığı ve bağlanılan muhabirler. Sonda "(Yapay zekâ ile hazırlanmıştır)". Hashtag, link ve uzun tire yok, en fazla 260 karakter. Ana haber 1. bölüm: "... 2. bölüm 19.05'te." 2. bölüm: "Ana haber 2. bölüm: ...".

## Öğrenilenler
- 24.11.2026: TTS'e uzun İngilizce stil talimatı verince model talimatı da sesli okudu. Talimat kısa tutulur ve her satır "her dilde" yazıya dökülerek kontrol edilir (tts.py bunu yapar).
- 24.11.2026: Ücretsiz katmanda her ses modeli günde ~10 istek veriyor ve kota 11:00'de (TR) sıfırlanıyor. tts.py bu yüzden satır başına değil blok başına (Memo + bir muhabir, ~45 sn) istek atar ve kota biten modelden sonrakine geçer.
- 24.11.2026: gemini-3.8 ses modelleri ham PCM değil hazır WAV dosyası döndürüyor. Başlığı ses diye okuyunca her satırın başında ve sonunda cızırtı oldu. tts.py artık WAV'ı açıp içindeki sesi alıyor; ses.py her satıra kısa giriş/çıkış yumuşatması ve hafif filtre uyguluyor, geçiş efektleri kısıldı.
- 24.11.2026: Telefonda X oynatıcısı 9:16 videoyu ekranı dolduracak şekilde büyütüp yanlardan ~55 px kırptı, altyazı, isim kartı ve saat/yapay zekâ etiketinin baş ve son harfleri kesildi. bulten.js'de bütün yazılar yanlardan `SAFE = 100` px içeride; yeni yazı eklerken bu sınırı kullan.
- 25.11.2026: gemini-3.8-flash-tts çok sesli istekte her metin parçasında `speechMetadata.speaker` istiyor (yoksa 400); tts.py artık satırları konuşmacı etiketli parçalar halinde gönderiyor, 400'de eski biçime ve sonraki modele geçiyor. Bölücü satırları kaydırırsa ses/ wav'larını birleştirip doğru duraktan elle bölmek kota harcamaz. bulten.js'de Pınar'ın arka bandı artık bültenin `sayi` rakamlarını gösteriyor (eskiden sabit 55,3 / 5.900). Buffer 100 sınırı planlanan saatten geriye 24 saate bakıyor: son 24 saat 100 iken ilk yerin açıldığı saatten sonrasına (25.11: 12:55) planlanan video kabul edildi.
- 25.11.2026 16:00: Tek satırlık tek konuşmacılı istekte model "Say in Turkish, energetic and cheerful" talimatını da sesli okudu ve satırın tamamını yazıya döken kontrol bunu kaçırdı (yalnız Türkçe kısmı yazdı); her satırın süresini beklenenle (karakter/14 sn) karşılaştır, uzunsa sessizlikten iki parçaya ayırıp ayrı yazıya dök ve talimat kısmını kes (kota harcamaz). Kontrol tersine satır sonunu da kaçırabiliyor (oran 0,8 ile geçen satır aslında tamdı), şüpheli satırı tek başına yeniden yazıya dök. "Taksim istasyonu" iki kez "Taksi mi istasyonu" okundu; kancada m+i gibi birleşen kelime sınırlarından kaçın.
- 25.11.2026 19:00: Kısa kritik kelimeler yanlış okundu ("Fon" STT'de "Foş/Fuhuş", kancadaki "hoca" dört dökümde de "koca", "Merz" "Merkel", "fazlasını" "azlasını"); oran geçse bile özel isim ve anlamı değiştiren kelimeleri tek başına yeniden yazıya dök, riskli kelimeyi kancaya koyma. Hatalı satırı atıp sonundaki "Söz sende Memo" parçasını önceki satırın wav'ına eklemek kota harcamadı. `ses` alanında â kullanma (hâkim, hâlâ, zekâ): norm harfi siliyor, oran düşüyor. Kanca ekranında "23.00" taştı, `yazi` en fazla 3-4 karakter. Ses hızı ~18 karakter/sn: 1500 karakter ~100 sn, ana haber bölümü için ~1800 karakter gerekir.
- 25.11.2026 20:40 (Cem): X'te tam ekranda videonun üst ~135 px'i telefonun durum çubuğu ve kamera adasının altında kalıyordu (CANLI, başlık ve saat çakışıyordu); başlık bilgileri `HEADER_Y = 94` ile aşağı alındı, üst ekran sahneleri 960x700 sanal alanda çizilip 0,906 oranında küçültülerek yerleştiriliyor (SCR y=262). Yeni yazıyı y<140 bölgesine koyma. Fenerbahçe haberinde Tarık'ın stadyumu sarı-kırmızı (Galatasaray) çizilmişti, artık takım renklerini alıyor (yukarıda `takim`). Tarık'ın sesinde "basketbol" "battebol" gibi duyuldu ve kontrol kaçırdı; tts.py artık bu kelimeyi "basket bol" diye okutuyor ve dökümde "basketbol" yoksa satırı HATALI sayıp yeniden okutuyor.
- 26.11.2026 12:00: "saat on dörtte", "akşam yedide" STT'de "14.00'te", "7.00'de", "Milli" de "Millî" diye döküldü; norm bunlardan "sıfır" fazlası ve eksik harf sayıp tam ve doğru satırı HATALI saydı (oran 0,68-0,81) ve blok boşuna iki kez daha okutuldu. Kod 3'te önce `duyulan` metnini oku, tam ve doğruysa kontrol.json'da `ok: true` yapıp yeniden çalıştır (kota harcamaz). Tersine tam satır dökümünde "Piyasa Pınar" "Pınar Pınar", "oyuncak" "oyuncu" çıktı ama sessizlikten bölünmüş parçaların ayrı dökümü doğruydu; anlamı değiştiren kelimeyi parça parça dök.
- 26.11.2026 16:00: tts.py satırları en fazla 650 karakterlik bloklara topluyor; son muhabir bloğu dolunca kapanış tek başına kaldı ve tek konuşmacılı istekte "Say in Turkish..." talimatı yine okundu (talimatı sessizlikten kesmek kota harcamadı). Son muhabir bölümü + kapanışın `ses` toplamını 650'nin altında tut ki kapanış çok sesli bloğa girsin. 1 sn'den kısa parçaların STT dökümü anlamsız çıktı; şüpheli kelimede tam satırı `ffmpeg -af atempo=0.75` ile yavaşlatıp iki STT modeline (gemini-flash-lite-latest, gemini-3.5-flash-lite) dökmek tutarlı sonuç verdi.
