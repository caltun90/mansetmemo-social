// Lottie hava ikonları (Meteocons, meteo-ikonlar.js) ve GSAP yumuşatmaları.
// draw(t) her kare için çağrılır; Lottie animasyonu zamandan hesaplanır (goToAndStop), bu yüzden render parça parça
// yapılsa da aynı kare çıkar. lottieIcon(...) ikonu bulamazsa false döner ve bulten.js eski elle çizilmiş ikonu çizer.
// window.EZ: GSAP yumuşatma fonksiyonları (0..1 -> 0..1). gsap yüklenmezse basit yedekler kullanılır.
(function () {
  const LOT = {};
  const anahtarlar = Object.keys(window.METEO || {});
  window.lottieHazir = (typeof lottie === 'undefined') ? Promise.resolve() : Promise.all(anahtarlar.map(k => new Promise(res => {
    const box = document.createElement('div');
    box.style.cssText = 'position:absolute;left:-4000px;top:0;width:512px;height:512px';
    document.body.appendChild(box);
    const a = lottie.loadAnimation({ container: box, renderer: 'canvas', loop: true, autoplay: false, animationData: window.METEO[k],
      rendererSettings: { clearCanvas: true, preserveAspectRatio: 'xMidYMid meet', dpr: 1 } });
    const bitti = () => { LOT[k] = a; res(); };
    a.addEventListener('DOMLoaded', bitti); setTimeout(bitti, 3000);   // olay kaçarsa takılma
  })));
  window.LOTTIE_HAVA = new Set(anahtarlar);
  // kind: METEO anahtarı (gunes, bulut, kapali, parcali, yagmur, ciseleme, saganak, firtina, kar, karla-karisik, sis, ruzgar, dolu, gece, parcali-gece)
  window.lottieIcon = function (kind, x, y, size, t) {
    const a = LOT[kind]; if (!a || !a.renderer || !a.renderer.canvasContext) return false;
    const fr = a.frameRate || 60, n = Math.max(1, a.totalFrames - 1);
    a.goToAndStop((Math.max(0, t) * fr) % n, true);
    ctx.drawImage(a.renderer.canvasContext.canvas, x - size / 2, y - size / 2, size, size);
    return true;
  };
  const g = window.gsap;
  const pe = (s, yedek) => { try { const f = g && g.parseEase(s); return f || yedek; } catch (e) { return yedek; } };
  window.EZ = {
    pop: pe('elastic.out(1,0.5)', p => 1 - Math.pow(1 - p, 3)),      // kanca yazısı: yaylanarak gelir
    geri: pe('back.out(2.2)', p => 1 - Math.pow(1 - p, 3)),          // kartlar: hafif taşıp yerine oturur
    kay: pe('expo.out', p => 1 - Math.pow(1 - p, 4)),                // alt bant ve yazılar: hızlı gelir, yumuşak durur
    sek: pe('bounce.out', p => 1 - Math.pow(1 - p, 2)),              // ikon: zıplayarak iner
  };
})();
