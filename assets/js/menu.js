(() => {
  const nav = document.querySelector('header > nav.container');
  const checkbox = document.getElementById('menuCheckbox'); 
  if (!nav) return;


  const setSpacer = () => {
    const h = nav.offsetHeight;
    document.documentElement.style.setProperty('--nav-h', h + 'px');

    document.querySelector('header').style.paddingTop = h + 'px';
  };
  setSpacer();
  window.addEventListener('resize', setSpacer);

  let lastY = window.scrollY;
  let ticking = false;

  const MOB_BP = 500;   
  const DELTA  = 6;    
  const TOPPIN = 16;    

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
  document.querySelectorAll('nav .menu a').forEach(a => {
    a.addEventListener('click', () => { if (checkbox) checkbox.checked = false; });
  });
})();

