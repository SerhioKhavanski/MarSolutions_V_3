(() => {
  const root     = document.querySelector('.reviews');
  const viewport = document.querySelector('.reviews__viewport');
  const rail     = viewport?.querySelector('.reviews__rail');
  if (!viewport || !rail) return;

  let cards = [...rail.children];


  viewport.style.scrollSnapType = 'none';
  cards.forEach(c => c.style.scrollSnapAlign = 'none');


  const MIN_W_DEFAULT = 380;
  const MAX_W_ABS     = 860;
  const PADDING_SAFE  = 32;
  const DISABLE_SCALE_DESKTOP = true; // отключаем «подсос» на десктопе
  const isMobile = () => (viewport.clientWidth || window.innerWidth) <= 768;


  let dragging = false, startX = 0, startLeft = 0;
  const onDown = (e) => {
    dragging = true;
    startX = ('touches' in e ? e.touches[0].clientX : e.clientX);
    startLeft = viewport.scrollLeft;
    viewport.style.cursor = 'grabbing';
    root?.classList.add('is-dragging');
  };
  const onMove = (e) => {
    if (!dragging) return;
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX);
    viewport.scrollLeft = startLeft - (x - startX);
    e.preventDefault();
  };
  const onUp = () => {
    if (!dragging) return;
    dragging = false;
    viewport.style.cursor = '';
    root?.classList.remove('is-dragging');
  };
  viewport.addEventListener('mousedown', onDown);
  viewport.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  viewport.addEventListener('touchstart', onDown, { passive:false });
  viewport.addEventListener('touchmove',  onMove, { passive:false });
  viewport.addEventListener('touchend',   onUp);


  const updateEdgeGutters = () => {
    if (isMobile()) { rail.style.removeProperty('--edge'); return; }
    const vpW = viewport.clientWidth || 0;
    const sampleW = cards[0]?.offsetWidth || 0;
    const edge = Math.max(16, (vpW - sampleW) / 2);
    rail.style.setProperty('--edge', edge + 'px');
  };


  const getAvailableTextHeight = (card, targetH) => {
    const logo = card.querySelector('.review__logo');
    const cs   = getComputedStyle(card);
    const p    = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const gap  = parseFloat(cs.rowGap || cs.gap || 0);
    const logoH = logo ? logo.offsetHeight : 0;
    return Math.max(0, targetH - logoH - gap - p);
  };
  const findMinWidthThatFits = (card, pEl, minW, maxW, availH) => {
    let lo = Math.max(1, minW), hi = Math.max(lo, maxW), ans = hi;
    for (let i = 0; i < 22; i++) {
      const mid = (lo + hi) >> 1;
      card.style.inlineSize = mid + 'px';
      const h = pEl.scrollHeight;
      if (h <= availH) { ans = mid; hi = mid - 1; } else { lo = mid + 1; }
    }
    return ans;
  };
  const autoFitAll = () => {
    const vpW = viewport.clientWidth || window.innerWidth;

    if (isMobile()) {

      cards.forEach(card => { card.style.inlineSize = '100%'; });
      return;
    }

    const hardMax = Math.max(0, vpW - PADDING_SAFE);
    cards.forEach(card => {
      const pEl = card.querySelector('p');
      if (!pEl) return;

      const targetH = Math.round(card.clientHeight);
      const availH  = getAvailableTextHeight(card, targetH);

      const minW = Number(card.dataset.minWidth || MIN_W_DEFAULT);
      const maxW = Math.min(MAX_W_ABS, hardMax);


      card.style.inlineSize = minW + 'px';

      if (pEl.scrollHeight <= availH) return;

      const w = findMinWidthThatFits(card, pEl, minW, maxW, availH);
      card.style.inlineSize = w + 'px';

      if (pEl.scrollHeight > availH) card.style.inlineSize = maxW + 'px';
    });
  };


  const applyScale = () => {

    if (!isMobile() && DISABLE_SCALE_DESKTOP) {
      cards.forEach(el => {
        el.style.setProperty('--scale', '1');
        el.style.setProperty('--alpha', '1');
        el.classList.remove('is-active');
      });
      return;
    }

    if (isMobile()) {
      cards.forEach(el => {
        el.style.setProperty('--scale', '1');
        el.style.setProperty('--alpha', '1');
        el.classList.remove('is-active');
      });
      return;
    }
  };


  viewport.addEventListener('wheel', (e) => {

    if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
      viewport.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }, { passive:false });


  const recalc = () => { autoFitAll(); updateEdgeGutters(); applyScale(); };


  const scrollCardIntoCenter = (idx, behavior = 'smooth') => {
    if (idx < 0 || idx >= cards.length) return;
    const card = cards[idx];
    const left = card.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2;
    viewport.scrollTo({ left, behavior });
  };
  window.reviewsGoTo  = (i, behavior) => scrollCardIntoCenter(i, behavior);
  window.reviewsNext  = (behavior = 'smooth') => {
    const x = viewport.scrollLeft + viewport.clientWidth / 2;
    let target = 0, best = Infinity;
    cards.forEach((c, i) => {
      const mid = c.offsetLeft + c.offsetWidth / 2;
      const d = mid - x;
      if (d > 0 && d < best) { best = d; target = i; }
    });
    scrollCardIntoCenter(target, behavior);
  };
  window.reviewsPrev  = (behavior = 'smooth') => {
    const x = viewport.scrollLeft + viewport.clientWidth / 2;
    let target = cards.length - 1, best = -Infinity;
    cards.forEach((c, i) => {
      const mid = c.offsetLeft + c.offsetWidth / 2;
      const d = mid - x;
      if (d < 0 && d > best) { best = d; target = i; }
    });
    scrollCardIntoCenter(target, behavior);
  };
  window.reviewsRecalc = () => requestAnimationFrame(() => recalc());


  const rafRecalc = () => requestAnimationFrame(() => recalc());
  window.addEventListener('resize', rafRecalc);

  const ready = () => recalc();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => requestAnimationFrame(() => ready()));
  } else {
    window.addEventListener('load', () => requestAnimationFrame(() => ready()), { once:true });
  }
})();
