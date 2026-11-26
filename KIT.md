# Manşet Memo KIT

@MansetMemo, Türkiye gündemini kısa ve kaynaklı paylaşan otomatik bir X haber sayfası. Spikeri çöp adam Manşet Memo. Bu dosya bulutta çalışan görevlerin kural kitabıdır. Görev talimatıyla çelişirse görev talimatındaki KESİN KURALLAR geçerlidir.

## Altyapı
- Supabase projesi sirket-ceo, project_id `eqqtmcmrapbgiscxncht` (Supabase bağlayıcısı, execute_sql). Sayfa kodu `manset`.
- Buffer anahtarı Supabase Vault'ta `buffer_api_manset` adıyla durur. Anahtarı okuma, yazma, hiçbir yere koyma. Gönderim yalnızca SQL fonksiyonlarıyla yapılır.
- Gönderme: `haber.buffer_planla(sayfa, metin, konu, kaynak_url, kaynak_hesap, gorsel_url, zaman, medya_url)` (aşağıda "Görsel" ve "Sayı ve zamanlama"). Metni dolar tırnağıyla ver (`$m$...$m$`). Kaynak medyası varsa `medya_url` verilir ve `gorsel_url` null olur; yoksa `gorsel_url` bu depodaki Memo kartının herkese açık linkidir.
- Sonuç: ~4 sn sonra `select haber.sonuclari_isle();` ve `select id, konu, durum, buffer_post_id, hata from haber.paylasimlar where sayfa='manset' order by id desc limit 5;`
- Depo: caltun90/mansetmemo-social (herkese açık). Kartlar `kartlar/YYYY-MM-DD/<konu>.jpg` altına konur, commit edilip `main`e push edilir. Herkese açık link: `https://raw.githubusercontent.com/caltun90/mansetmemo-social/main/kartlar/YYYY-MM-DD/<konu>.jpg`. Göndermeden önce `curl -s -o /dev/null -w "%{http_code}"` ile 200 döndüğünü kontrol et.

## Görsel: önce kaynağın foto/videosu (Cem 24-25.11.2026)
Hedef: haberlerin mümkün olduğunca hepsi kaynağın fotoğrafı ya da videosuyla gitsin, Memo kartı en son çare olsun (25.11 itibarıyla 70 haberin 54'ü kartla gitti, bu çok fazla). Haberi veren kaynağın X'teki fotoğraf ya da videosu alıntılanır: `medya_url` (`https://x.com/<hesap>/status/<id>/photo/1` ya da `/video/1`) metnin sonuna eklenir, X onu kaynak rozetiyle gösterir.
Her haber için sırayla dene, ilk uygun medyada dur:
1. Depo: `select * from haber.medya_ara('manset', array['Deniz Çakır','gözaltı'], 12);` (2-4 ayırt edici kelime: kişi adı, yer, kurum). Depoyu her çalışmanın başında `akis_topla` / `akis_isle` doldurur (AA, AFAD, Habertürk, CNN Türk); bilgisayar açıkken ayrıca X araması yapan toplayıcı varsa onun postları da buradadır.
2. Haber sayfalarındaki gömülü X postları: haberi 2-3 farklı siteden WebFetch ile aç (Medyascope, T24, BirGün, Evrensel, Sözcü, Habertürk, NTV, Hürriyet sık gömer). Sayfada `x.com/<hesap>/status/<id>` ya da `twitter.com/<hesap>/status/<id>` geçen gönderiler ve "pic.twitter.com" bağlantılı alıntılar ara. Bulunan numarayı doğrula: `select haber.tweet_bilgi_istek('<id>');` -> numara; `select pg_sleep(2); select * from haber.tweet_bilgi(<numara>);` durum 200 ve medya_url doluysa kullan.
3. Aynı kişinin ya da kurumun bugünkü başka bir haberine ait medya değil; yalnızca aynı olay ya da haberde adı geçen kişinin görüntüsü.
4. Hiçbiri yoksa Memo kartı.
Kabul edilen medya sahipleri: haber kuruluşları, ajanslar, resmi kurumlar, siyasetçilerin ve kamu kişilerinin resmi hesapları, tanınmış (mavi tikli) haber, son dakika ve asayiş haber hesapları. Anonim ya da kişisel hesap medyası kullanılmaz.
İçerik kuralı: kan, yaralı, ceset, şiddet anı, kaza yeri görüntüsü, çocukların yüzünün göründüğü hassas içerik, hassas işaretli (possibly_sensitive) medya kullanılmaz. Gözaltı ve tutuklama haberlerinde kişinin kelepçeli ya da polis eşliğinde görüntüsü kullanılmaz; olağan bir portresi ya da olay yerinin genel görüntüsü kullanılır.
Bir medya bir kez kullanılır (`buffer_planla` kullanımı sayar). Metindeki kaynak parantezi yine haberin kaynağıdır; medya başka bir kuruluşun olabilir.

## Haber kartı (yedek)
- Çizim: `NODE_PATH=/opt/npm-tools/node_modules node kart/kart.js '<json>' kartlar/YYYY-MM-DD/<konu>.jpg`
- json alanları: `manset` (en fazla ~70 karakter, haberin özü), `etiket` (GÜNDEM, SON DAKİKA, EKONOMİ, SPOR, DÜNYA, HAVA DURUMU, TEKNOLOJİ, SAĞLIK, EĞİTİM, KÜLTÜR SANAT), `kaynak` (AA, DHA, İHA, TRT Haber, kurum adı...), `tarih` (ör. "24 Kasım", Europe/Istanbul), `ifade` (mutlu: olumlu/hafif haber, sok: şaşırtıcı ya da son dakika, ciddi: ekonomi, siyaset, uyarılar).
- Playwright bulunamazsa: `npm i -g playwright-core` ve Chrome yolu `/usr/bin/google-chrome`. Font dosyaları depoda (`fonts/`).
- Kartı Read ile açıp bak: yazı taşmış, kesik ya da yanlışsa düzelt.

## Haber seçimi
- Kaynaklar: AA, DHA, İHA, TRT Haber, resmi kurumlar (bakanlıklar, valilikler, AFAD, Kandilli, MGM, TÜİK, TCMB, Resmi Gazete) ve farklı çizgilerden büyük yayın kuruluşları (Hürriyet, Sözcü, Habertürk, NTV, CNN Türk, Sabah, Cumhuriyet, BBC Türkçe, DW Türkçe vb.).
- Doğrulama: Haber ya bir ajansta ya resmi bir kurumda ya da en az iki büyük kaynakta olmalı. Tarihi bugüne ya da son saatlere ait olmalı. Rakam, tarih, isim ve alıntıları kaynakla birebir karşılaştır. Doğrulanamıyorsa paylaşma.
- Çeşitlilik: gündem, ekonomi (faiz, döviz, enflasyon, zam, vergi), hava ve afet uyarıları, eğitim, sağlık, teknoloji, dünya, büyük spor olayları. Bir çalışmada aynı türden en fazla bir haber.
- Asla alma: cinayet, istismar, intihar, ölümlü kaza ve şiddet haberleri ve görüntüleri; anonim hesapların iddiaları; doğrulanmamış "iddia" ya da "kulis" haberleri; kişisel saldırı, hakaret; deprem ve afette resmi olmayan rakamlar; yargı süreci devam eden kişiler hakkında suçlayıcı dil (sürecin kendisi, yani gözaltı, tutuklama, tahliye ve kararlar, haberdir ve paylaşılır).
- Siyaset ve yargı (Cem 24.11.2026'da istedi: siyasi haberler atlanmasın): Gündemdeki siyasi ve adli gelişmeler paylaşılır, atlanmaz. Örnek: gözaltı, tutuklama, tahliye, adli kontrol, iddianame, mahkeme kararı, görevden uzaklaştırma, kayyum, parti ve Meclis kararları, liderlerin önemli açıklamaları, seçim ve anket sonuçları (anketi yapan şirketle birlikte). Büyük kanallar "son dakika" geçtiyse en üste koy ve hemen gönder (zaman null).
  - Doğrulama: bir ajans (AA, DHA, İHA, ANKA), resmi kaynak (mahkeme, başsavcılık, bakanlık, parti açıklaması) ya da farklı çizgilerden en az iki büyük kaynak (ör. biri Sabah, Habertürk, CNN Türk, NTV gibi; biri Sözcü, Cumhuriyet, BirGün, Halk TV, Medyascope, T24 gibi).
  - Dil: yalnızca olgu. Kim, ne oldu, hangi soruşturma, hangi karar. "suçlamasıyla", "iddiasıyla", "... dedi" gibi aktarım dili; suçu kesinleşmemiş kişiye suçlu muamelesi yok. Sıfat, yorum, ironi, slogan, taraf tutan kelime ("masal", "hırsız", "kahraman", "skandal") yok. Bir kaynağın yorumunu haber gibi aktarma.
  - Denge: iktidar ve muhalefet, bütün partiler ve kişiler için aynı ölçüt. Benzer önemdeki bir gelişmeyi tarafına göre atlama ya da öne çıkarma.
  - Hukuk: TCK 217/A (dezenformasyon) ve hakaret riskine karşı yalnız doğrulanmış olguyu yaz. Rakam ve tarihlerde kaynaklar çelişiyorsa o ayrıntıyı yazma ("5 Kasım mı 6 Kasım mı" gibi).

## Metin
- Türkçe, başta tek emoji (📌 🚨 👀 💰 🌧️ ❄️ 📚 ⚽ 🌍 💻 gibi; aynı emojiyi üst üste kullanma), 1-2 kısa cümle.
- KAYNAK PARANTEZİ YOK (Cem 25.11.2026'da istedi): metnin sonuna ya da içine (AA), (MGM), (İstanbul Valiliği) gibi kaynak yazılmaz. Kaynak, alıntılanan foto/videonun altında X'in gösterdiği kanal adından, Memo kartında da kartın "Kaynak" satırından görünür. Haberi kaynağıyla doğrulama ve `kaynak_url`/`kaynak_hesap` alanlarını doldurma kuralları aynen sürer; yalnızca tweet metnine yazılmaz. Cümle içinde aktarım için kurum adı geçebilir ("Meteoroloji uyardı", "AFAD'a göre"), ama sona parantezli kaynak eklenmez.
- En fazla 240 karakter. Kaynağın cümlesini kopyalama, kendi cümlenle yaz. Hashtag yok, uzun tire (—) yok. Metne kendin link yazma; medya linkini fonksiyon ekler.
- Hafif bir haberde kısa ve sevimli bir kapanış olabilir ("Montları hazırlayın!"). Siyaset ve ciddi haberlerde yorum yok.

## Sayı ve zamanlama (Cem 25.11.2026: Buffer'ın 24 saatte 100 post sınırına göre günlük plan)
- Buffer X kanalına herhangi bir 24 saatte en fazla 100 post gönderiyor; pencere, postun planlanan saatinden (T) geriye 24 saattir. Mavi tik bunu değiştirmiyor; eski "saatte 10-15 haber" hedefi ve 300 tavanı geçersiz. 24-25.11'de saatte ~5,5 post gidince sınır 06:51'de doldu ve 12:47'ye kadar hiç post gidemedi; bu plan bunu önlemek için.
- Günlük plan (her gün aynı dağılım, böylece her 24 saatlik pencere ~95'te kalır):
  - 00:00-07:00: saatte en fazla 2 haber (gece yalnızca önemli ve son dakika).
  - 07:00-24:00: saatte en fazla 5 haber; 12:00 ve 16:00 saatlerinde en fazla 4, 19:00 saatinde en fazla 3.
  - Video bültenlerine günde 4 yer: 12:00, 16:00, 19:00, 19:05. Bu saatlerin 5 dakika öncesine ve sonrasına haber planlama, 18:50-19:30 arası boş kalır.
  - "Saat", postun planlanan saatidir (hemen gidiyorsa gönderim saati). Görev 05:49-23:49 arası her saat, gece ayrıca 01:49 ve 03:49'da çalışır (Cem 26.11.2026, token tasarrufu). 05:49-22:49 çalışmaları bir sonraki saatin haberlerini o saate yayar (ör. :00, :12, :24, :36, :48); 23:49, 01:49 ve 03:49 çalışmaları bir sonraki iki saate yayar (her saate en fazla 2).
- Açılan yeri doldurma: pencerede yer olsa bile saat sınırını aşma. Fazla aday varsa en önemlilerini seç (son dakika siyaset ve yargı önde), kalanı atla. Doğrulanmış yeni haber azsa daha az gönder; sayıyı doldurmak için asla tekrar, uydurma ya da zayıf haber koyma.
- Her post için iki kontrol (T = planlanan saat):
  - Saat sayısı: `select count(*) from haber.paylasimlar where sayfa='manset' and durum='gonderildi' and konu not like 'bulten%' and coalesce(planlanan, olusturma) >= date_trunc('hour', T) and coalesce(planlanan, olusturma) < date_trunc('hour', T) + interval '1 hour';` saat sınırına ulaştıysa o saate yeni haber koyma.
  - Pencere: `select count(*) from haber.paylasimlar where sayfa='manset' and durum='gonderildi' and coalesce(planlanan, olusturma) > T - interval '24 hours' and coalesce(planlanan, olusturma) <= T;` 95 ya da üstündeyse T'ye haber planlama (bültenlere yer kalsın); sonraki dakikalara kaydır ya da atla.
- Gönderim fonksiyonu: `select haber.buffer_planla('manset', metin, konu, kaynak_url, kaynak_hesap, gorsel_url, zaman);` zaman null ise hemen paylaşılır, doluysa Buffer o saatte paylaşır. Aynı konu 48 saat içinde ikinci kez gönderilemez (fonksiyon hata verir).
- Buffer ücretsiz planı aynı anda en fazla 10 planlı post tutar. Önce bekleyenleri say: `select count(*) from haber.paylasimlar where sayfa='manset' and planlanan > now();` Planlanabilecek = 9 - bekleyen. N haberden fazlası (N - planlanabilecek, en az 1) hemen, kalanlar saate yayılır: adım = 55 dakika (gece iki saatlik çalışmada 115 dakika) / planlı sayısı, zamanlar `now() + adım * i` (i = 1, 2, ...). Hemen gidenler arasında da en sert/son dakika olanı başa koy. İçinde bulunulan saatin sınırı dolmuşsa "hemen" gidecek haberi de bir sonraki saatin başına planla.
- Gece 03:xx çalışmasında (Europe/Istanbul) kart çizmeden önce `bash araclar/temizle.sh` çalıştır: depoda yalnızca son 2 günün kartları kalır, geçmiş tek commit'e iner. Sonra normal akışa devam et.

## Token tasarrufu (Cem 26.11.2026)
- WebSearch varsayılan "standard" mod; aynı turda birkaç aramayı birlikte gönder. "extended" yalnız standard sonuç boş, eski ya da konu dışı kalırsa ve çalışmada en fazla 3 kez.
- Alt ajan (web-fetch) pahalıdır (çağrı başına ~30-60 bin token): çalışma başına en fazla 2 çağrı, her birine en fazla 3 sayfa. İzin beklemesi (PROVENANCE_REQUIRED) ya da client_error veren siteyi aynı çalışmada tekrar deneme; "Öğrenilenler"de açılmadığı yazan siteleri hiç verme. Önce arama sonucundaki başlıklar, tarihli URL'ler ve AA X postunun tam metni (`haber.x_postlar.metin`, gerekirse tweet_bilgi) ile doğrula.
- Tekrar kontrolünde yalnız konu listesini çek ("Tekrar"); bir konunun metni gerekiyorsa yalnız onu sor.
- Gönderilebilecek haber yoksa (saat sınırı dolu, pencere 95, bekleyen 9) araştırma yapmadan bitir.
- Kartları tek kontakt sayfasında kontrol et.
- "Öğrenilenler"e yalnız gerçekten yeni ve kalıcı bir kural eklenir; günün haberine özgü gözlemler ("şu haber atlandı", "şu site bu kez açıldı") eklenmez. Bölüm 20 satırı geçerse benzer satırları birleştirerek kısalt.

## Toplu kart
- Bütün kartları tek seferde çiz: bir JSON dosyası yaz (`[{"dosya":"kartlar/YYYY-MM-DD/<konu>.jpg","manset":...,"etiket":...,"kaynak":...,"tarih":...,"ifade":...}, ...]`) ve `NODE_PATH=/opt/npm-tools/node_modules node kart/toplu.js <json>` çalıştır. Kartları Read ile kontrol et (bir kontakt sayfasında toplu bakmak yeterli), tek commit ve tek push yap, sonra her linkin 200 döndüğünü doğrula.

## Haber türleri (çeşitlilik)
- Gündem ve resmi açıklamalar, ekonomi verileri (TÜİK, TCMB, Resmi Gazete, zam ve vergi kararları), döviz-altın-borsa (günde en fazla 3 kez: sabah, öğle, akşam), hava ve afet uyarıları (MGM, AFAD, valilik), şehir haberleri (valilik ve belediye duyuruları: okul tatili, yol, su, ulaşım), eğitim (MEB, ÖSYM, YÖK), sağlık (Sağlık Bakanlığı duyuruları), teknoloji ve bilim, dünya (büyük gelişmeler), spor (resmi kulüp açıklamaları, sonuçlar, milli takım), kültür-sanat ve magazin (yalnızca kamuya açık, saygılı haberler).
- Bir çalışmada aynı türden en fazla 3 haber. Aynı olayın gelişmesi ancak gerçekten yeni bilgi varsa ayrı haber olur.

## Tekrar
- `select konu from haber.paylasimlar where sayfa='manset' and olusturma > now() - interval '48 hours' order by id desc;` Konu adlarından aynı olayı ve başka kaynaktan gelen kopyalarını tanı, tekrar paylaşma; emin değilsen yalnız o konunun metnine bak. Yeni bir gelişme varsa (ör. açıklama yapıldı, rakam değişti, karar çıktı) paylaşılabilir.

## Öğrenilenler (26.11.2026'da 43 satırdan sıkıştırıldı)
Git ve Buffer
- Raw linki push'tan önce sorgulama, GitHub 404'ü ~5 dk önbellekte tutuyor. Başka görev main'i değiştirdiyse (sığ klonda "unrelated histories") kartları yedekle, `git fetch --depth 1 origin main && git reset --hard FETCH_HEAD`, kartları geri koy ve commit et. temizle.sh force push'u "push negotiation failed" uyarısı verse de başarılı olabilir (git ls-remote ile sına).
- buffer_planla aynı kaynak_url'yi 48 saatte ikinci kez kabul etmiyor ("Bu kaynak zaten paylasildi"): kaynak_url genel son dakika sayfası değil, haberin kendi sayfası ya da kaynağın X postu olmalı.
- Buffer'ın 100 sınırı planlanan saatten (T) geriye 24 saate bakar: son 24 saat 100 iken hemen gönderme, pencere sayısı 99 ya da altı olan bir T'ye planla (kabul ediliyor). Sayılar yalnız durum='gonderildi' satırlarını sayar; her buffer_planla'dan sonra sonuclari_isle çalıştır. Kontrol ve gönderimi tek sorguda `case when saat<sinir and pencere<95 then haber.buffer_planla(...)::text else 'atlandi' end` ile yap.
- execute_sql birden çok sorguda yalnız son sorgunun sonucunu döndürür; birkaç medya_ara'yı `select 'a' q, * from haber.medya_ara(...) union all select 'b', * ...` ile tek sorguda çalıştır. Metin uzunluğunu emojiyle birlikte Postgres length() ile say (⚖️ 2 karakter).

Tarih ve doğrulama tuzakları
- Aramalar eski yılların haberlerini döndürür (yıllık olaylar, FIFA yasağı, kar tatili, "altın en düşükte" vb.). Yılı haber ID'siyle sına; Kasım 2026'da X status ~2125..., AA ~4138..., Hürriyet ~4338..., Habertürk ~3930..., NTV ~1752..., Cumhuriyet ~2559..., BirGün ~748..., sondakika.com ~20463... (daha küçükse eski; ANKA ~275xxx, BirGün ~389xxx, Türkiye Gazetesi 983804 eski çıktı). ID'siz linkte (NTV virgüllü kısa kod) tarihi sayfadan sına.
- foreks haber ID'sinin ilk 8 hanesi hex Unix zamanıdır (6b080019 = 26.11.2026 12:47 TSİ; `date -u -d @$((16#6b080019))`): sayfa açmadan yayın saatini ve gün tazeliğini verir; AA sayfalarında saat yoktur, saat için foreks ID'sine bak.
- Depodaki AA medyalı postlar ve ertesi gün başka sitelerde yeniden çıkan açıklamalar eski olayı yeniden verebilir; ilk yayın ya da resmi tarihi sına, güncel değilse atla.
- Yargı "son dakika"ları eski kararın bugün çıkan gerekçesi olabilir (İmamoğlu diploma); asıl tarihi Medyascope/Cumhuriyet'ten sına ve gerekçeyse öyle yaz. "Adliyeye sevk" ve "tutuklama talebi" ayrı haber değildir; karar iki kaynakta çıkınca paylaşılır (tek sitenin "tutuklandı" başlığı yetmez).
- Kaynaklarda rakam çelişirse (çekirdek PCE, akaryakıt indirimi, gol dakikası, AB bütçe toplamı) o rakamı yazma ya da çoğunluğu ve ayrıntılı (il il) kaynağı esas al. Wall Street kapanışında 00:00 TSİ sonrası yayımlanan AA metnini esas al, seans içi rakamı kapanış sanma. Güncel fiyat olmadan altın haberi verme. "Yarın okullar tatil mi" sayfaları SEO; valilik kararı yoksa verme.

Hızlı aday aramaları (WebSearch, standard)
- Günün listesi: "site:aa.com.tr/tr <gün> <ay> <yıl>" (bölüm için "aa.com.tr/tr/<dunya|ekonomi|politika> <gün> <ay> <yıl>"); "haberturk.com son dakika <gün> <ay> <yıl> <sabah|öğleden sonra|gece>"; "site:sabah.com.tr/gundem/<yıl>/<ay>/<gün>" (sabah gazete baskısı ve gün içi, kaynak ajans ve dakika yazıyor); "site:cumhuriyet.com.tr <gün> <ay> <yıl> son dakika" (siyaset ve yargı gündemi); "sondakika.com son dakika <gün> <ay> <yıl>"; "site:medyascope.tv/<yıl>/<ay>/<gün>".
- En verimli bugün taraması (26.11): WebSearch `allowed_domains:["foreks.com"]` ile "foreks AA <konu> <gg-aa-yy>" (ör. "foreks AA tutuklandı gözaltı 26-11-26", "foreks AA TBMM Genel Kurul 26-11-26", "foreks 26-11-26 SPK Resmi Gazete") ara; foreks URL'si tarih eki taşıdığı için yalnız bugünün AA ve PICNEWS (ForInvest) başlıkları gelir, tarihli aramaların eski yıl döndürmesi olmaz. foreks sayfaları alt ajanda açılıyor (AA metni, SPK bülteni, Resmi Gazete başlıkları); AA haberi ajans, SPK bülteni resmi kaynak sayılır.
- Günün programı: memurlar.net "<tarih>'dan önemli gündem başlıkları" (AA, ~00:06) ve ensondakika "GÜNDEM ÖZETİ / GÜNDEM ÖZETİNE EK / <tarih>" (AA, sabah). Resmi Gazete: "Resmi Gazete'de bugün <gg.aa.yyyy>" (Bloomberg HT, ~00:10), ayrıntı memurlar.net ya da foreks. Gece yarısı RG'de kararname ve AYM kararı, ~00:06'da TFF PFDK sevkleri çıkabilir.
- Akşam/gece: 23:00 Avrupa maçları gece yarısı çalışmasına yetişmez, sonraki gece çalışmasında "<takım> <rakip> sonuç" ya da "<turnuva> <hafta>. hafta toplu sonuçlar <tarih>" ile ara. Sabah Asya seansı: "Kospi <olay> <tarih>" (en.sedaily, koreajoongangdaily). CNN Türk "<tarih> gününün son dakika önemli gelişmeleri (16.30 bülteni)" günün başlıklarını verir. Newsquawk "Daily Asia-Pac Opening News" gece dünya başlıklarını verir ama tek başına kaynak sayılmaz.

Alt ajan ve medya
- Alt ajanda açılanlar: sabah.com.tr, CNN Türk haber sayfaları, memurlar.net, ensondakika, sondakika.com ve Habertürk haber sayfaları (kaynak ajansı ve dakikayı yazıyor), karar.com, star, aksam, canligaste, AA haber sayfaları (bazen SERVER_ERROR). Açılmayan ya da eski önbellek gösterenler: son dakika liste sayfaları (Habertürk, NTV, CNN Türk, Hürriyet, haber7, TRT, T24, sondakika.com/politika ve /gozalti), trthaber haber sayfaları (izin beklemesi), medyascope, t24, dunya.com, yenicag, oksijen, nefes, haber3, trtspor, fenerbahce.org, Variety, Deadline.
- Çok uzun foreks URL'leri (rakamlı uzun AA manşetleri) alt ajanda "url exceeds the maximum fetchable length" (403) verir, tekrar deneme; arama sonucundaki AA başlığı rakamları taşır, onu ve aynı olayın kısa URL'li PICNEWS sayfasını esas al. Tek başına PICNEWS (ForInvest) haberi doğrulama sayılmaz.
- Son haber listesi: memurlar.net/sonhaberler/ (saatli) ve ensondakika.com.tr ana sayfası alt ajanda açılır (ensondakika'da saat ve ajans yok, tek başına doğrulama sayılmaz). memurlar.net listesi 26.11 17:50'de önceki günün (25.11) önbelleğini "bugün" diye verdi: alt ajandan sayfadaki tarihi ve konuları istemeden önce konu adlarını "Tekrar" listesiyle sına; dünkü konular çıkıyorsa listeyi kullanma. Standard arama bugünün sayfasını vermezse başlık kalıbıyla ara ("Borsa güne yükselişle başladı -26 Kasım 2026", "Döviz ve altın güne nasıl başladı? (26 Kasım 2026)", "<gün> Kasım 2026'dan Önemli Gündem Başlıkları"); arama yalnız başlık döndürür, rakam için sayfa açmak gerekir.
- Gömülü X postu bulunan yerler: AA haber sayfaları (şirketlerin resmi postları), Cumhuriyet siyaset haberleri (liderlerin postları), Habertürk spor (HTSpor videoları). Maç sonucu sayfaları (Habertürk, Evrensel, Fanatik, Ajansspor, Sözcü), CNN Türk dünya/finans (AFP) ve sondakika/kantan sayfalarında gömülü post yok; bunlarda medya aramaya sayfa harcama.

Kapsam
- Ölüm içeren olaylar (şehit askerlerin helikopter kazası, rehine görüntüsü dahil) ve istismar iddiası içeren haberler atlanır. Yalnız tek çizgideki sitelerde (bianet, Medyascope vb.) olan, ajansın ya da farklı çizgiden ikinci kaynağın vermediği karar atlanır.
