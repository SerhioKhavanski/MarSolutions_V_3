
(() => {
  // Десктоп только от 1024px
  const mql = window.matchMedia('(min-width: 1024px)');
  let teardown = null;

  function enableDesktopAccordion(){
    const container = document.querySelector('.split__content');
    const links = [...document.querySelectorAll('#spy a')];
    const sections = [...document.querySelectorAll('.split__content section[id]')];
    if (!container || !links.length || !sections.length) return;

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    const byId = Object.fromEntries(sections.map(s => [s.id, s]));
    let historyWriteTmr = null;
    let current = (location.hash && byId[location.hash.slice(1)])
      ? location.hash.slice(1)
      : sections[0].id;

    // старт
    sections.forEach(s => s.classList.toggle('is-active', s.id === current));
    container.style.height = byId[current].scrollHeight + 'px';
    links.forEach(a => a.classList.toggle('is-active', a.hash === `#${current}`));

    // подстраиваем высоту при изменениях контента/шрифтов
    const ro = new ResizeObserver(() => {
      container.style.height = byId[current].scrollHeight + 'px';
    });
    sections.forEach(s => ro.observe(s));

    function setActive(id, { fromClick = false } = {}){
      if (!byId[id] || id === current) return;
      container.style.height = byId[id].scrollHeight + 'px';
      sections.forEach(s => s.classList.toggle('is-active', s.id === id));
      links.forEach(a => a.classList.toggle('is-active', a.hash === `#${id}`));
      current = id;

      clearTimeout(historyWriteTmr);
      historyWriteTmr = setTimeout(() => {
        (fromClick ? history.pushState : history.replaceState).call(history, { id }, '', `#${id}`);
      }, 80);
    }

    const onClick = (e) => {
      e.preventDefault();
      const id = e.currentTarget.hash.slice(1);
      setActive(id, { fromClick: true });
      e.currentTarget.focus({ preventScroll: true });
    };
    links.forEach(a => a.addEventListener('click', onClick));

    const onPop = () => {
      const id = location.hash.replace('#', '') || sections[0].id;
      setActive(id, { fromClick: false });
    };
    window.addEventListener('popstate', onPop);

    const onLoad = () => {
      const initial = location.hash.replace('#','') || sections[0].id;
      setActive(initial, { fromClick: false });
    };
    window.addEventListener('load', onLoad);

    // выключение при уходе с брейкпоинта
    return () => {
      ro.disconnect();
      links.forEach(a => a.removeEventListener('click', onClick));
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('load', onLoad);
      sections.forEach(s => s.classList.remove('is-active'));
      container.style.height = 'auto';
    };
  }

  function disableToFlow(){
    // поток для мобайл/планшет: никаких классов/высот
    const container = document.querySelector('.split__content');
    const sections = [...document.querySelectorAll('.split__content section[id]')];
    if (container) container.style.height = 'auto';
    sections.forEach(s => s.classList.remove('is-active'));
  }

  function handleChange(e){
    if (teardown){ teardown(); teardown = null; }
    if (e.matches){
      teardown = enableDesktopAccordion();
    } else {
      disableToFlow();
    }
  }

  handleChange(mql);
  mql.addEventListener('change', handleChange);
})();

