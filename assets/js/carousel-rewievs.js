(() => {
  const root     = document.querySelector('.reviews');            // секция
  const viewport = document.querySelector('.reviews__viewport');
  const rail     = viewport?.querySelector('.reviews__rail');
  
  if (!viewport || !rail) return;

  const cards = [...rail.children];

  /* ========== 1) Drag-to-scroll ========== */
  let dragging = false, startX = 0, startLeft = 0;

  const onDown = (e) => {
    dragging = true;
    startX = ('touches' in e ? e.touches[0].clientX : e.clientX);
    startLeft = viewport.scrollLeft;
    viewport.style.cursor = 'grabbing';
    root?.classList.add('is-dragging');          // (опционально) блокируем выделение
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

  /* ========== 2) Динамические края (1-я/последняя встают в центр) ========== */
  const updateEdgeGutters = () => {
    const vpW = viewport.clientWidth || 0;
    const sampleW = cards[0]?.offsetWidth || 0;
    const edge = Math.max(16, (vpW - sampleW) / 2);
    rail.style.setProperty('--edge', edge + 'px');
  };

/* ========== 3) Автоподгон ширины под фикс-высоту (увеличиваем ТОЛЬКО если не влезло) ========== */

// доступная высота под <p>: вся карта минус логотип/паддинги/row-gap
const getAvailableTextHeight = (card, targetH) => {
  const logo = card.querySelector('.review__logo');
  const p    = parseFloat(getComputedStyle(card).paddingTop) + parseFloat(getComputedStyle(card).paddingBottom);
  const gap  = parseFloat(getComputedStyle(card).rowGap || getComputedStyle(card).gap || 0);
  const logoH = logo ? logo.offsetHeight : 0;
  return Math.max(0, targetH - logoH - gap - p);
};

// бинарный поиск минимальной ширины, при которой текст влезает по высоте
const findMinWidthThatFits = (card, pEl, minW, maxW, availH) => {
  let lo = Math.max(1, minW);
  let hi = Math.max(lo, maxW);
  let ans = hi;

  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) >> 1;
    card.style.inlineSize = mid + 'px';
    const h = pEl.scrollHeight;

    if (h <= availH) {
      ans = mid;          // влезло — пробуем уже
      hi = mid - 1;
    } else {
      lo = mid + 1;       // не влезло — шире
    }
  }
  return ans;
};

const autoFitAll = () => {
  const vpW = viewport.clientWidth || window.innerWidth;
  const hardMax = vpW - 32;

  cards.forEach(card => {
    const pEl = card.querySelector('p');
    if (!pEl) return;

    // фикс-высота из CSS уже задана (block-size)
    const targetH = Math.round(card.clientHeight);
    const availH  = getAvailableTextHeight(card, targetH);

    const minW = 240;
    const maxW = Math.min(860, hardMax);

    // ⬇️ ключевая правка: начинаем с minW, а не с natural/max-content
    card.style.inlineSize = minW + 'px';

    if (pEl.scrollHeight <= availH) {
      // на минималке уже влезло — оставляем как есть
      return;
    }

    // не влезло → подбираем ширину в [minW, maxW]
    const w = findMinWidthThatFits(card, pEl, minW, maxW, availH);
    card.style.inlineSize = w + 'px';

    if (pEl.scrollHeight > availH) card.style.inlineSize = maxW + 'px';
  });
};


  /* ========== 4) Масштаб/прозрачность по близости к центру ========== */
  const applyScale = () => {
    const rect = viewport.getBoundingClientRect();
    const cx   = rect.left + rect.width / 2;
    const infl = rect.width * 0.6;
    const sMax = 1.06, sMin = 0.90;
    const aMax = 1.00, aMin = 0.55;

    let bestIdx = -1, bestDist = Infinity;

    cards.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const mid = r.left + r.width / 2;
      const d = Math.abs(mid - cx);
      const t = Math.min(1, d / infl);
      const s = sMax - (sMax - sMin) * t;
      const a = aMax - (aMax - aMin) * t;
      el.style.setProperty('--scale', s.toFixed(3));
      el.style.setProperty('--alpha', a.toFixed(3));
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    });
    cards.forEach((el, i) => el.classList.toggle('is-active', i === bestIdx));
  };

  /* ========== 5) Колесо → горизонтальный скролл ========== */
  viewport.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
      viewport.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }, { passive:false });

  /* ========== 6) Инициализация/обновления ========== */
  const recalc = () => { autoFitAll(); updateEdgeGutters(); applyScale(); };

  viewport.addEventListener('scroll', () => applyScale(), { passive:true });
  window.addEventListener('resize', recalc);

  const ready = () => recalc();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(ready);
  } else {
    window.addEventListener('load', ready, { once:true });
  }
})();