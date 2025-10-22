(() => {
  const container = document.querySelector('.split__content');
  const links = [...document.querySelectorAll('#spy a')];
  const sections = [...container.querySelectorAll('section[id]')];
  const linkById = Object.fromEntries(links.map(a => [a.hash.slice(1), a]));

  if (!container || !links.length || !sections.length) return;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  let programmaticScroll = false;     
  let historyWriteTmr = null;         

  function setActive(id, { fromClick = false } = {}) {
    links.forEach(a => a.classList.toggle('is-active', a.hash === `#${id}`));

    const url = `#${id}`;
    clearTimeout(historyWriteTmr);
    historyWriteTmr = setTimeout(() => {
      (fromClick ? history.pushState : history.replaceState).call(history, { id }, '', url);
    }, 80);
  }

  function scrollToSection(id, push = false) {
    const target = document.getElementById(id);
    if (!target) return;
    const pageY = window.scrollY;

    programmaticScroll = true;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    window.scrollTo({ top: pageY, left: 0 });

    setActive(id, { fromClick: push });
    let lastY = container.scrollTop, still = 0;
    const tick = () => {
      const nowY = container.scrollTop;
      if (Math.abs(nowY - lastY) < 1) { 
        if (++still >= 3) { programmaticScroll = false; return; }
      } else { still = 0; }
      lastY = nowY;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }


  links.forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const id = a.hash.slice(1);
      scrollToSection(id, true);

      a.focus({ preventScroll: true });
    });
  });


  window.addEventListener('popstate', () => {
    const id = location.hash.replace('#', '') || sections[0].id;
    scrollToSection(id, false);
  });


  const io = new IntersectionObserver((entries) => {
    if (programmaticScroll) return; 


    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

    if (!visible.length) return;

    const topId = visible[0].target.id;
    setActive(topId, { fromClick: false });
  }, {
    root: container,
    threshold: buildThresholds(0.35, 0.85), 
    rootMargin: '0px 0px -10% 0px'         
  });

  sections.forEach(s => io.observe(s));


  window.addEventListener('load', () => {
    const initial = location.hash.replace('#', '') || sections[0].id;
    if (location.hash) scrollToSection(initial, false);
    else setActive(initial, { fromClick: false });
  });

  function buildThresholds(from = 0.3, to = 0.9, steps = 6) {
    const arr = [];
    const step = (to - from) / (steps - 1);
    for (let i = 0; i < steps; i++) arr.push(from + step * i);
    return arr;
  }
})();