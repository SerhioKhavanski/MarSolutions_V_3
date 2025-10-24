(() => {
  const viewport = document.getElementById('reviews');
  if (!viewport) return;

  const rail  = viewport.querySelector('.reviews__rail');
  const items = () => Array.from(viewport.querySelectorAll('.review'));
  const isMobile = () => matchMedia('(max-width: 500px)').matches;

  function getCurrentIndex(){
    const list = items();
    if (!list.length) return 0;
    const vr = viewport.getBoundingClientRect();
    const vCenter = vr.left + vr.width / 2;
    let bestIdx = 0, bestDist = Infinity;
    for (let i = 0; i < list.length; i++){
      const r = list[i].getBoundingClientRect();
      const c = r.left + r.width/2;
      const d = Math.abs(c - vCenter);
      if (d < bestDist){ bestDist = d; bestIdx = i; }
    }
    return bestIdx;
  }

  function updateStates(){
    const list = items();
    if (!list.length) return;
    const current = getCurrentIndex();
    for (let i = 0; i < list.length; i++){
      const state = i < current ? 'past' : (i === current ? 'current' : 'future');
      if (list[i].dataset.state !== state) list[i].dataset.state = state;
    }
  }

  function updateEdges(){
    const list = items();
    if (!list.length) return;
  
    const MIN = 18; // 1rem
  
    if (isMobile()){
      // на мобиле края теперь задаёт padding у viewport, рельсе подпорки не нужны
      rail.style.setProperty('--edge-left',  '0px');
      rail.style.setProperty('--edge-right', '0px');
      return;
    }
  
    // десктоп как было
    const vw = viewport.clientWidth;
    const firstW = list[0].offsetWidth;
    const lastW  = list[list.length - 1].offsetWidth;
  
    const left  = Math.max(MIN, (vw - firstW) / 2);
    const right = Math.max(MIN, (vw - lastW)  / 2);
  
    rail.style.setProperty('--edge-left',  left  + 'px');
    rail.style.setProperty('--edge-right', right + 'px');
  }
  

  function scrollToIndex(idx, behavior = 'smooth'){
    const list = items();
    if (!list[idx]) return;
    const el = list[idx];
    const target = el.offsetLeft + el.offsetWidth / 2 - viewport.clientWidth / 2;
    const max = viewport.scrollWidth - viewport.clientWidth;
    const clamped = Math.max(0, Math.min(max, target));
    viewport.scrollTo({ left: clamped, behavior });
  }

  function centerOnStart(){
    updateEdges();
    requestAnimationFrame(() => {
      const START_INDEX = isMobile() ? 0 : 1; // мобилка — с первого
      scrollToIndex(START_INDEX, 'auto');
      updateStates();
    });
  }

  // drag-to-scroll
  let isDown = false, startX = 0, startScroll = 0, moved = false;

  function onPointerDown(e){
    isDown = true; moved = false;
    viewport.classList.add('is-dragging');
    viewport.setPointerCapture(e.pointerId);
    startX = e.clientX;
    startScroll = viewport.scrollLeft;
  }
  function onPointerMove(e){
    if (!isDown) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 2) moved = true;
    viewport.scrollLeft = startScroll - dx;
    requestAnimationFrame(updateStates);
  }
  function onPointerUp(e){
    if (!isDown) return;
    isDown = false;
    viewport.classList.remove('is-dragging');
    viewport.releasePointerCapture(e.pointerId);
  }

  viewport.addEventListener('click', (e) => { if (moved) e.preventDefault(); }, true);
  viewport.addEventListener('pointerdown', onPointerDown);
  viewport.addEventListener('pointermove', onPointerMove);
  viewport.addEventListener('pointerup', onPointerUp);
  viewport.addEventListener('pointercancel', onPointerUp);
  viewport.addEventListener('pointerleave', onPointerUp);

  viewport.tabIndex = 0;
  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') viewport.scrollBy({ left: -200, behavior: 'smooth' });
    if (e.key === 'ArrowRight') viewport.scrollBy({ left:  200, behavior: 'smooth' });
  });

  const raf = cb => requestAnimationFrame(cb);
  viewport.addEventListener('scroll', () => raf(updateStates), { passive: true });
  window.addEventListener('resize', () => { raf(updateEdges); raf(updateStates); });

  if (document.readyState === 'complete') {
    centerOnStart();
  } else {
    window.addEventListener('load', centerOnStart);
    window.addEventListener('DOMContentLoaded', () => { setTimeout(centerOnStart, 50); });
  }
})();
