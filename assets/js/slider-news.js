(() => {
  const track = document.querySelector('.news-wrapper'); 
  if (!track) return;

  const slides = () => Array.from(track.children).filter(el => el.nodeType === 1);

  // подпорки для центрирования крайних
  function updateEdges(){
    const list = slides();
    if (!list.length) return;
    const vw = track.clientWidth;
    const firstW = list[0].offsetWidth;
    const lastW  = list[list.length - 1].offsetWidth;
    const MIN = 16;
    const left  = Math.max(MIN, (vw - firstW) / 2);
    const right = Math.max(MIN, (vw - lastW)  / 2);
    track.style.setProperty('--edge-left',  left  + 'px');
    track.style.setProperty('--edge-right', right + 'px');
  }

  // текущая (ближайшая к центру)
  function getCurrentIndex(){
    const list = slides();
    if (!list.length) return 0;
    const vr = track.getBoundingClientRect();
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

  // прокрутка к индексу по центру
  function scrollToIndex(idx, behavior = 'smooth'){
    const list = slides();
    if (!list[idx]) return;
    const el = list[idx];
    const target = el.offsetLeft + el.offsetWidth / 2 - track.clientWidth / 2;
    const max = track.scrollWidth - track.clientWidth;
    const clamped = Math.max(0, Math.min(max, target));
    track.scrollTo({ left: clamped, behavior });
  }

  // авто-доснап к ближайшей после перетаскивания
  function snapToNearest(){
    scrollToIndex(getCurrentIndex(), 'smooth');
  }

  // drag-to-scroll
  let isDown = false, startX = 0, startLeft = 0, moved = false;

  function onPointerDown(e){
    isDown = true; moved = false;
    startX = e.clientX;
    startLeft = track.scrollLeft;
    track.setPointerCapture(e.pointerId);
    track.classList.add('grabbing');
  }
  function onPointerMove(e){
    if (!isDown) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 2) moved = true;
    track.scrollLeft = startLeft - dx;
  }
  function onPointerUp(e){
    if (!isDown) return;
    isDown = false;
    track.classList.remove('grabbing');
    track.releasePointerCapture(e.pointerId);
    if (moved) snapToNearest();
  }

  track.addEventListener('pointerdown', onPointerDown);
  track.addEventListener('pointermove', onPointerMove);
  track.addEventListener('pointerup', onPointerUp);
  track.addEventListener('pointercancel', onPointerUp);
  track.addEventListener('pointerleave', onPointerUp);

  // блок ложных кликов после драга
  track.addEventListener('click', (e) => { if (moved){ e.preventDefault(); e.stopPropagation(); } moved = false; }, true);

  // старт с нужного индекса
  const START_INDEX = 1;
  function centerOnStart(){
    updateEdges();
    requestAnimationFrame(() => {
      scrollToIndex(START_INDEX, 'auto');
    });
  }

  window.addEventListener('resize', () => requestAnimationFrame(updateEdges));

  if (document.readyState === 'complete'){
    centerOnStart();
  } else {
    window.addEventListener('load', centerOnStart);
    window.addEventListener('DOMContentLoaded', () => { setTimeout(centerOnStart, 50); });
  }
})();
