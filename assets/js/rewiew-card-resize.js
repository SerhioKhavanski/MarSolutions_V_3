(() => {
  const isMobile = () => matchMedia('(max-width: 500px)').matches;

  const EPS = 0.5;
  const THRESH = 510;
  const SNAP   = 600;

  const fits = el => el.scrollHeight <= el.clientHeight + EPS;

  const pickWidth = (el, min, max) => {
    let lo=min, hi=max, best=max;
    while (lo<=hi){
      const mid = (lo+hi)>>1;
      el.style.setProperty('--w', mid+'px');
      void el.offsetHeight;
      if (fits(el)) { best=mid; hi=mid-1; }
      else          { lo=mid+1; }
    }
    return best;
  };

  const calc = el => {
    if (isMobile()){
      el.style.removeProperty('--w');
    
      const vwMinus = 'calc(100vw - 2rem)';
      el.style.width = vwMinus;         
      el.style.inlineSize = vwMinus;     
      el.style.maxInlineSize = vwMinus;
      el.style.minInlineSize = '0';
    

      el.style.flex = `0 0 ${vwMinus}`;
    
      return;
    }


    el.style.removeProperty('flex');
    el.style.removeProperty('min-inline-size');
    el.style.removeProperty('max-inline-size');

    const cs   = getComputedStyle(el);
    const minW = parseFloat(cs.minWidth) || 387;
    const maxW = parseFloat(cs.maxWidth) || 600;

    el.style.setProperty('--w', minW+'px');
    void el.offsetHeight;

    let chosen = minW;
    if (!fits(el)) chosen = pickWidth(el, minW, maxW);
    if (chosen > THRESH) chosen = SNAP;

    el.style.setProperty('--w', chosen + 'px');
  };

  const all = () => document.querySelectorAll('.review').forEach(calc);

  addEventListener('DOMContentLoaded', all);
  addEventListener('resize', () => requestAnimationFrame(all));
})();
