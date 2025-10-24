
(() => {
  const scroller = document.getElementById('picker');
  if (!scroller) return;


  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const cards = [...scroller.querySelectorAll('.slider-card')];


  const applySpacer = () => {
    const half = scroller.clientHeight / 2;
    scroller.style.setProperty('--spacer', half + 'px');
  };
  new ResizeObserver(applySpacer).observe(scroller);
  window.addEventListener('load', applySpacer);
  applySpacer();


  const centerCard = (el, behavior = 'smooth') => {
    if (!el) return;
    const target = el.offsetTop + el.offsetHeight / 2 - scroller.clientHeight / 2;
    scroller.scrollTo({ top: target, left: 0, behavior });
  };

  let idx = 0; 

  const setActive = () => {
    const mid = scroller.getBoundingClientRect().top + scroller.clientHeight / 2;
    let best = null, bestD = Infinity;
    for (const c of cards) {
      const r = c.getBoundingClientRect();
      const d = Math.abs((r.top + r.height / 2) - mid);
      if (d < bestD) { bestD = d; best = c; }
    }
    cards.forEach(c => c.classList.toggle('active', c === best));
    idx = Math.max(0, cards.indexOf(best));
  };


  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      cards[0]?.focus?.({ preventScroll: true });
      centerCard(cards[0], 'auto');
      setActive();
    });
  });

  cards.forEach(c => {
    c.addEventListener('mousedown', e => e.preventDefault()); 
    c.addEventListener('click', e => {
      e.preventDefault();
      c.focus?.({ preventScroll: true });
      centerCard(c, 'smooth');
    });
  });


  let raf;
  scroller.addEventListener('scroll', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(setActive);
  }, { passive: true });
  window.addEventListener('resize', setActive);



let locked = false, unlockTimer;
const unlockSoon = (ms = 140) => {
  clearTimeout(unlockTimer);
  unlockTimer = setTimeout(() => { locked = false; }, ms);
};

const goTo = (i) => {
  const next = Math.min(Math.max(i, 0), cards.length - 1);
  if (next === idx) return;
  idx = next;
  centerCard(cards[idx], 'smooth');
};

scroller.addEventListener('wheel', (e) => {

  if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

  const dir = e.deltaY > 0 ? 1 : -1;


  if ((idx === 0 && dir < 0) || (idx === cards.length - 1 && dir > 0)) {
    return; 
  }

  e.preventDefault();
  if (locked) return;
  locked = true;

  goTo(idx + dir);
  unlockSoon();
}, { passive: false });

scroller.addEventListener('scroll', () => unlockSoon(), { passive: true });



  scroller.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); if (!locked){ locked=true; goTo(idx+1);} }
    if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); if (!locked){ locked=true; goTo(idx-1);} }
    if (e.key === 'Home') { e.preventDefault(); if (!locked){ locked=true; goTo(0);} }
    if (e.key === 'End')  { e.preventDefault(); if (!locked){ locked=true; goTo(cards.length-1);} }
  });
})();

