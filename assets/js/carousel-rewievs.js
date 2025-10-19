(() => {
  const viewport = document.querySelector('.reviews__viewport');
  const rail     = viewport?.querySelector('.reviews__rail');
  if (!viewport || !rail) return;

  const cards = [...rail.children];

  /* ---- динамические поля по краям, чтобы первая/последняя могли в центр ---- */
  const updateEdgeGutters = () => {
    const vpW = viewport.clientWidth || 0;
    // Берём “типовую” ширину карточки (если очень разные — всё равно норм)
    const sampleW = cards[0]?.offsetWidth || 0;
    const edge = Math.max(16, (vpW - sampleW) / 2);
    rail.style.setProperty('--edge', edge + 'px');
  };

  /* ---- масштаб/прозрачность по близости к центру ---- */
  const applyScale = () => {
    const rect = viewport.getBoundingClientRect();
    const cx   = rect.left + rect.width / 2;
    const infl = rect.width * 0.6;      // радиус влияния
    const sMax = 1.06, sMin = 0.90;
    const aMax = 1.00, aMin = 0.55;

    let bestIdx = -1, bestDist = Infinity;

    cards.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const mid = r.left + r.width / 2;
      const d = Math.abs(mid - cx);
      const t = Math.min(1, d / infl);  // 0..1
      const s = sMax - (sMax - sMin) * t;
      const a = aMax - (aMax - aMin) * t;
      el.style.setProperty('--scale', s.toFixed(3));
      el.style.setProperty('--alpha', a.toFixed(3));
      if (d < bestDist){ bestDist = d; bestIdx = i; }
    });

    cards.forEach((el, i) => el.classList.toggle('is-active', i === bestIdx));
  };

  /* ---- drag-to-scroll (мышь/тач) без снапа ---- */
  let dragging = false, startX = 0, startLeft = 0;

  const onDown = (e) => {
    dragging = true;
    startX = ('touches' in e ? e.touches[0].clientX : e.clientX);
    startLeft = viewport.scrollLeft;
    viewport.style.cursor = 'grabbing';
  };
  const onMove = (e) => {
    if (!dragging) return;
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX);
    viewport.scrollLeft = startLeft - (x - startX);
    e.preventDefault();
  };
  const onUp = () => {
    dragging = false;
    viewport.style.cursor = '';
  };

  viewport.addEventListener('mousedown', onDown);
  viewport.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  viewport.addEventListener('touchstart', onDown, {passive:false});
  viewport.addEventListener('touchmove',  onMove, {passive:false});
  viewport.addEventListener('touchend',   onUp);

  /* ---- колесо по горизонтали (для десктопа). Видимый скролл, без снапа ---- */
  viewport.addEventListener('wheel', (e) => {
    // если прокрутка в основном вертикальная — конвертим в горизонтальную
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
      viewport.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }, { passive: false });

  /* ---- обновления ---- */
  const onScroll = () => applyScale();
  viewport.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', () => { updateEdgeGutters(); applyScale(); });

  // после загрузки шрифтов/изображений — точнее мерки
  const ready = () => { updateEdgeGutters(); applyScale(); };
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(ready);
  } else {
    window.addEventListener('load', ready, { once: true });
  }
})();
