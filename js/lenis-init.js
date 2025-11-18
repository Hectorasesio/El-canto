// js/lenis-init.js
// Inicialización estándar de Lenis y efectos de parallax/reveal

(function () {
  if (typeof Lenis === 'undefined') {
    console.warn('Lenis no está disponible. ¿Cargaste el CDN?');
    return;
  }

  // Inicialización de Lenis
  const lenis = new Lenis({
    duration: 0.45,
    easing: (t) => t,
    smooth: true,
    direction: 'vertical',
    // wheelMultiplier: 1,
    // smoothTouch: true
  });

  // Loop de animación
  (function raf(t) {
    lenis.raf(t);
    requestAnimationFrame(raf);
  })(performance.now());

  // Parallax ligero
  const parallaxEls = Array.from(document.querySelectorAll('.parallax'));
  if (parallaxEls.length) {
    lenis.on && lenis.on('scroll', ({ scroll }) => {
      parallaxEls.forEach((el) => {
        const speed = parseFloat(el.dataset.speed) || 0.15;
        const y = scroll * speed;
        el.style.transform = `translate3d(0, ${y}px, 0)`;
      });
    });
  }

  // Reveal: IntersectionObserver
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  if (revealEls.length && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(e => obs.observe(e));
  }

  // Exponer instancia global
  window._lenis = lenis;
})();