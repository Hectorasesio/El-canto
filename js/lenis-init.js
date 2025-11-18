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


document.addEventListener("DOMContentLoaded", function() {
  const lenis = window.lenis || (typeof Lenis !== "undefined" ? new Lenis() : null);
  if (!lenis) return;

  const video = document.querySelector(".scroll-video");
  const container = document.querySelector(".scroll-video-container");
  if (!video || !container) return;

  let isVideoActive = false;
  let isVideoDone = false;
  let fixedScrollPosition = 0;

  function getActivationRange() {
    const rect = container.getBoundingClientRect();
    const start = window.scrollY + rect.top - window.innerHeight/2 + rect.height/2;
    const end = start + window.innerHeight - rect.height/2;
    return { start, end };
  }

  function lockScroll() {
    // Fija el scroll en la posición actual
    fixedScrollPosition = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${fixedScrollPosition}px`;
    document.body.style.width = "100%";
  }
  function unlockScroll() {
    // Restaura el scroll después de fixed
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0, fixedScrollPosition);
  }

  video.addEventListener('loadedmetadata', () => {
    let wheelListener = null;
    lenis.on('scroll', ({ scroll }) => {
      if (isVideoDone) return;

      const { start, end } = getActivationRange();
      if (!isVideoActive && scroll >= start && scroll <= end) {
        lenis.stop();
        lockScroll();
        isVideoActive = true;

        let lastWheelTime = null;
        // Captura el "wheel" para avanzar el video
        wheelListener = (e) => {
          e.preventDefault();
          let delta = e.deltaY;
          if (delta === 0) return;

          // Cambia el avance por cada "rueda": ajusta el factor para velocidad
          let progress = video.currentTime / video.duration;
          progress += delta > 0 ? 0.03 : -0.03;
          progress = Math.max(0, Math.min(1, progress));
          video.currentTime = video.duration * progress;

          // Si llegas al final, desbloquea el scroll:
          if (progress >= 1) {
            unlockScroll();
            lenis.start();
            isVideoActive = false;
            isVideoDone = true;
            window.removeEventListener("wheel", wheelListener, { passive: false });
          }
        };
        window.addEventListener("wheel", wheelListener, { passive: false });
      }

      // Si sales del rango por arriba, resetea el video & desbloquea scroll solo si estaba activo:
      if (isVideoActive && scroll < start) {
        unlockScroll();
        lenis.start();
        isVideoActive = false;
        window.removeEventListener("wheel", wheelListener, { passive: false });
        video.currentTime = 0;
      }
    });
  });

  // Loop para Lenis
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
});