// ScrollSpy: подсветка активного пункта при прокрутке
const links = [...document.querySelectorAll('#spy a')];
const sections = links.map(a => document.querySelector(a.getAttribute('href')));

// наблюдаем, когда секция "входит" в зону
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = '#' + entry.target.id;
      links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === id));
      history.replaceState(null, '', id); // опционально обновлять хэш
    }
  });
}, {
  root: null,
  threshold: 0.4,                  // сколько секции должно быть видно
  rootMargin: '0px 0px -30% 0px'   // срабатывание чуть раньше
});

sections.forEach(sec => io.observe(sec));

// клики по меню: актив сразу, даже до завершения скролла
links.forEach(a => {
  a.addEventListener('click', () => {
    links.forEach(l => l.classList.toggle('is-active', l === a));
  });
});
