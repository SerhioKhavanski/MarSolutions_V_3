(() => {
    const scroller = document.getElementById('picker');
    if (!scroller) return;
  
    const apply = () => {
      const half = scroller.clientHeight / 2;
      scroller.style.setProperty('--spacer', half + 'px');
    };
  

    new ResizeObserver(apply).observe(scroller);
    window.addEventListener('load', apply);
    apply();
  })();

 