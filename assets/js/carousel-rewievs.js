  (() => {
    const viewport = document.getElementById('reviews');
    const rail = viewport.querySelector('.reviews__rail');
    const cards = [...rail.children];
  
    // === NEW: динамические отступы по краям, чтобы 1-я/последняя центрились ===
    const updateEdgeGutters = () => {
      if (!cards.length) return;
      const vpW = viewport.clientWidth;
      // берем среднюю ширину карточки (если разные — ок, работает достаточно точно)
      const cardW = cards[0].offsetWidth || 0;
      const edge = Math.max(16, (vpW - cardW) / 2); // минимум чтобы совсем не схлопывалось
      rail.style.setProperty('--edge', `${edge}px`);
    };
  
    // вызывем при старте/ресайзе/после загрузки шрифтов
    const ready = () => { updateEdgeGutters(); applyScale(); };
    window.addEventListener('resize', () => { updateEdgeGutters(); applyScale(); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(ready);
    } else {
      window.addEventListener('load', ready, { once: true });
    }
  
    /* … остальной код как был: drag-to-scroll, applyScale, snapToNearest, wheel … */
  
    // ↓ вставь сюда твои обработчики drag/scroll из прошлой версии ↓
      /* ——— Drag to scroll ——— */
  let down = false, startX = 0, startLeft = 0, moved = false;

  const downH = e => {
    down = true; moved = false;
    startX = (e.touches ? e.touches[0].clientX : e.clientX);
    startLeft = viewport.scrollLeft;
    viewport.style.cursor = 'grabbing';
  };
  const moveH = e => {
    if (!down) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    viewport.scrollLeft = startLeft - (x - startX);
    moved = true;
    e.preventDefault();
  };
  const upH = () => {
    if (!down) return;
    down = false;
    viewport.style.cursor = '';
    snapToNearest();
  };

  viewport.addEventListener('mousedown', downH);
  viewport.addEventListener('mousemove', moveH);
  window.addEventListener('mouseup', upH);
  viewport.addEventListener('touchstart', downH, {passive:false});
  viewport.addEventListener('touchmove',  moveH, {passive:false});
  viewport.addEventListener('touchend',   upH);

  const applyScale = () => {
        const rect = viewport.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const influence = rect.width * 0.6;  // радиус влияния
        const sMax = 1.06, sMin = 0.90;
        const aMax = 1.0,  aMin = 0.55;
    
        let bestIdx = -1, bestDist = Infinity;
    
        cards.forEach((el, i) => {
          const r = el.getBoundingClientRect();
          const mid = r.left + r.width / 2;
          const d = Math.abs(mid - centerX);
          const t = Math.min(1, d / influence); // 0..1
          const s = sMax - (sMax - sMin) * t;
          const a = aMax - (aMax - aMin) * t;
          el.style.setProperty('--scale', s.toFixed(3));
          el.style.setProperty('--alpha', a.toFixed(3));
          if (d < bestDist){ bestDist = d; bestIdx = i; }
        });
        cards.forEach((el, i) => el.classList.toggle('is-active', i === bestIdx));
      };
    
      viewport.addEventListener('scroll', applyScale, {passive:true});
      window.addEventListener('resize', applyScale);
      applyScale();
    
    
      /* ——— Колёсико по горизонтали (удобно на десктопе) ——— */
      viewport.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
          viewport.scrollLeft += e.deltaY;
          e.preventDefault();
        }
      }, {passive:false});

  
  })();
  