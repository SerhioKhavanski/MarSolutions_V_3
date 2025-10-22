(() => {
  const nav = document.querySelector('header > nav.container');
  const checkbox = document.getElementById('menuCheckbox'); // бургер
  if (!nav) return;

  // компенсируем фиксированную шапку, чтобы контент не уезжал под неё
  const setSpacer = () => {
    const h = nav.offsetHeight;
    document.documentElement.style.setProperty('--nav-h', h + 'px');
    // добавим верхний паддинг хедеру, чтобы блок hero/контент не прятался
    document.querySelector('header').style.paddingTop = h + 'px';
  };
  setSpacer();
  window.addEventListener('resize', setSpacer);

  let lastY = window.scrollY;
  let ticking = false;

  const MOB_BP = 500;   // мобилка
  const DELTA  = 6;     // фильтр дрожи
  const TOPPIN = 16;    // у самого верха всегда показываем

  function onScroll() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const y = window.scrollY;
      const goingDown = y > lastY;
      const isMobile  = window.matchMedia(`(max-width:${MOB_BP}px)`).matches;
      const menuOpen  = !!(checkbox && checkbox.checked);

      if (isMobile || menuOpen || y <= TOPPIN) {
        nav.classList.remove('nav--hidden');
      } else if (Math.abs(y - lastY) > DELTA) {
        nav.classList.toggle('nav--hidden', goingDown);
      }

      lastY = y;
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // если клик по пункту меню на мобилке — закрыть бургер
  document.querySelectorAll('nav .menu a').forEach(a => {
    a.addEventListener('click', () => { if (checkbox) checkbox.checked = false; });
  });
})();

