// js/lenis-init.js
// Configuración más reactiva de Lenis + buenas prácticas: duration baja, easing lineal,
// no cálculos costosos en el handler; uso de transform para parallax ligero.

(function () {
  if (typeof Lenis === 'undefined') {
    console.warn('Lenis no está disponible. ¿Cargaste el CDN?');
    return;
  }

  // Configuración más responsiva:
  const lenis = new Lenis({
    duration: 0.45,                // reducir duración para menos "delay"
    easing: (t) => t,              // easing lineal -> más directo
    smooth: true,
    direction: 'vertical',
    // wheelMultiplier: 1,         // opcional: aumenta si quieres que la rueda sea más rápida
    // smoothTouch: true           // prueba true/false en móvil si sientes lag en touch
  });

  // RAF loop limpio
  (function raf(t) {
    lenis.raf(t);
    requestAnimationFrame(raf);
  })(performance.now());

  // DEBUG: descomenta para ver valores en consola si lo necesitas
  // console.log('Lenis options', lenis);

  // Parallax ligero: solo transform, evita lecturas de layout en scroll
  const parallaxEls = Array.from(document.querySelectorAll('.parallax'));
  if (parallaxEls.length) {
    // evitamos hacer getBoundingClientRect en cada scroll; usamos la posición global
    lenis.on && lenis.on('scroll', ({ scroll }) => {
      // limitamos cantidad de elementos y trabajo por elemento
      parallaxEls.forEach((el) => {
        const speed = parseFloat(el.dataset.speed) || 0.15;
        // mueve por transform; uso de translate3d para mejor GPU acceleration
        const y = scroll * speed;
        el.style.transform = `translate3d(0, ${y}px, 0)`;
      });
    });
  }

  // Reveal: usa IntersectionObserver (más eficiente)
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

  // Exponer para depuración
  window._lenis = lenis;
})();