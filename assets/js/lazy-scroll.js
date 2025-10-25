(() => {
  const mql = window.matchMedia('(min-width: 768px)');
  let teardown = null; // функция выключения десктоп-логики при смене брейкпоинта

  function enableDesktopAccordion(){
    const container = document.querySelector('.split__content');
    const links = [...document.querySelectorAll('#spy a')];
    const sections = [...document.querySelectorAll('.split__content section[id]')];
    if (!container || !links.length || !sections.length) return;

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    const byId = Object.fromEntries(sections.map(s => [s.id, s]));
    let historyWriteTmr = null;
    let current = (location.hash.replace('#','') && byId[location.hash.replace('#','')])
                  ? location.hash.replace('#','')
                  : sections[0].id;

    // стартовое состояние
    sections.forEach(s => s.classList.toggle('is-active', s.id === current));
    container.style.height = byId[current].scrollHeight + 'px';
    links.forEach(a => a.classList.toggle('is-active', a.hash === `#${current}`));

    // следим за изменениями контента/шрифтов
    const ro = new ResizeObserver(() => {
      container.style.height = byId[current].scrollHeight + 'px';
    });
    sections.forEach(s => ro.observe(s));

    function setActive(id, { fromClick = false } = {}){
      if (!byId[id] || id === current) return;
      // анимируем высоту контейнера
      container.style.height = byId[id].scrollHeight + 'px';

      sections.forEach(s => s.classList.toggle('is-active', s.id === id));
      links.forEach(a => a.classList.toggle('is-active', a.hash === `#${id}`));
      current = id;

      clearTimeout(historyWriteTmr);
      historyWriteTmr = setTimeout(() => {
        (fromClick ? history.pushState : history.replaceState).call(history, { id }, '', `#${id}`);
      }, 80);
    }

    // клики по навигации — переключают секции (без прокрутки страницы)
    const onClick = (e) => {
      e.preventDefault();
      const id = e.currentTarget.hash.slice(1);
      setActive(id, { fromClick: true });
      e.currentTarget.focus({ preventScroll: true });
    };
    links.forEach(a => a.addEventListener('click', onClick));

    // back/forward
    const onPop = () => {
      const id = location.hash.replace('#', '') || sections[0].id;
      setActive(id, { fromClick: false });
    };
    window.addEventListener('popstate', onPop);

    // при загрузке — выставляем из hash или первую
    const onLoad = () => {
      const initial = location.hash.replace('#','') || sections[0].id;
      setActive(initial, { fromClick: false });
    };
    window.addEventListener('load', onLoad);

    // На десктопе можно ещё синхронизировать активные пункты при прокрутке страницы колёсиком.
    // Но в аккордеоне мы не скроллим страницу; если захочешь "скроллом менять секции" — можно добавить wheel-хэндлер.

    // Функция выключения (для смены брейкпоинта)
    return () => {
      ro.disconnect();
      links.forEach(a => a.removeEventListener('click', onClick));
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('load', onLoad);
      // раскладываем обратно все секции как обычные блоки
      sections.forEach(s => s.classList.remove('is-active'));
      container.style.height = 'auto';
    };
  }

  function disableToMobileFlow(){
    // На мобильном никакой логики не нужно: якоря ведут к секциям нативно,
    // всё в потоке, без preventDefault, без абсолютного позиционирования.
    // Просто убедимся, что высота авто и классы сброшены.
    const container = document.querySelector('.split__content');
    const sections = [...document.querySelectorAll('.split__content section[id]')];
    if (container){
      container.style.height = 'auto';
    }
    sections.forEach(s => s.classList.remove('is-active'));
  }

  function handleChange(e){
    // Переключаемся между режимами при изменении ширины
    if (teardown){ teardown(); teardown = null; }
    if (e.matches){
      teardown = enableDesktopAccordion();
    } else {
      disableToMobileFlow();
    }
  }

  // Инициализация
  handleChange(mql);
  mql.addEventListener('change', handleChange);
})();