// js/lenis-init.js
// Inicialización de Lenis + Reveal zoom (IntersectionObserver) + Scroll-driven zoom eficiente.
// Coloca este archivo en /js/lenis-init.js y asegúrate de cargarlo DESPUÉS del CDN de Lenis.

(function () {
    if (typeof Lenis === 'undefined') {
      console.warn('Lenis no está disponible. ¿Cargaste el CDN?');
      return;
    }
  
    // Lenis - configuración más reactiva por defecto
    const lenis = new Lenis({
      duration: 0.45,
      easing: (t) => t,
      smooth: true,
      direction: 'vertical'
    });
  
    // RAF loop para Lenis y nuestras actualizaciones
    let needsAnimationUpdate = false;
    function raf(time) {
      lenis.raf(time);
      if (needsAnimationUpdate) {
        updateScrollDriven(); // actualiza animaciones dependientes del scroll
        needsAnimationUpdate = false;
      }
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  
    // -------------------------
    // Reveal + Zoom (IntersectionObserver)
    // -------------------------
    const revealZoomEls = Array.from(document.querySelectorAll('.reveal-zoom'));
    if (revealZoomEls.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target); // revelar solo una vez
          }
        });
      }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  
      revealZoomEls.forEach(el => io.observe(el));
    } else if (revealZoomEls.length) {
      // fallback simple
      function fallbackReveal() {
        const vh = window.innerHeight;
        revealZoomEls.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.top < vh * 0.92) el.classList.add('is-visible');
        });
      }
      window.addEventListener('scroll', fallbackReveal, { passive: true });
      fallbackReveal();
    }
  
    // -------------------------
    // Scroll-driven zoom (solo para elementos con .scroll-zoom o data-scroll-zoom)
    // -------------------------
    // Selecciona elementos que tengan data-scroll-zoom="true" o clase .scroll-zoom
    const scrollZoomEls = Array.from(document.querySelectorAll('.scroll-zoom, [data-scroll-zoom="true"]'));
    // Precompute dataset values to avoid parseFloat cada frame
    const SZ = scrollZoomEls.map(el => {
      const maxZoom = parseFloat(el.dataset.maxZoom) || parseFloat(el.dataset.zoom) || 1.12; // escala máxima
      const anchor = el.dataset.anchor || 'center'; // posible uso futuro
      return { el, maxZoom, anchor };
    });
  
    // Marca que hay que actualizar cuando Lenis reporta scroll
    if (typeof lenis.on === 'function') {
      lenis.on('scroll', () => { needsAnimationUpdate = true; });
    } else {
      // fallback al scroll nativo
      window.addEventListener('scroll', () => { needsAnimationUpdate = true; }, { passive: true });
    }
  
    // updateScrollDriven: calculos batched y writes
    function updateScrollDriven() {
      // calibración: centro de la ventana
      const centerY = window.innerHeight / 2;
      SZ.forEach(({ el, maxZoom }) => {
        // lectura del layout (una por element)
        const rect = el.getBoundingClientRect();
        // distancia del centro de viewport (0 = en el centro)
        const dist = Math.abs((rect.top + rect.height / 2) - centerY);
        // normalizar: 0 (centro) -> 1 (fuera de influencia)
        const influence = Math.min(1, dist / (window.innerHeight / 1.2));
        // invertimos para obtener progreso de zoom (1 = en centro, 0 = lejos)
        const progress = 1 - influence;
        // escala entre 1 y maxZoom
        const scale = 1 + (maxZoom - 1) * progress;
        // write: usar transform (GPU)
        el.style.transform = `translate3d(0,0,0) scale(${scale})`;
      });
    }
  
    // Inicializa una actualización para posicion inicial
    needsAnimationUpdate = true;
  
    // -------------------------
    // Ejemplo: manejar enlaces con hashes para que lenis.scrollTo respete offsets
    // -------------------------
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          // Si tienes un header fijo, usa offset: -HEADER_HEIGHT
          lenis.scrollTo(target, { offset: 0, duration: 0.7 });
        }
      });
    });
  
    // -------------------------
    // Exponer para debug
    // -------------------------
    window._lenis = lenis;
  })();