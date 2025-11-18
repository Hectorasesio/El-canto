// Video scrollytelling: El video avanza según el scroll, sin bloquear el scroll de la página (fluido y bidireccional).
// También reproduce/revierte videos con hover mediante .hover-video.

document.addEventListener("DOMContentLoaded", function() {
  const lenis = window._lenis;

  // --- SCROLL VIDEO ---
  const video = document.querySelector(".scroll-video");
  const container = document.querySelector(".scroll-video-container");
  const SCROLL_SEGMENT = 600; // Ajusta esto para más o menos proporción de scroll

  if (video && container) {
    function updateCurrentTime() {
      const rect = container.getBoundingClientRect();
      // Punto "start": cuando el centro vertical del contenedor entra en el centro del viewport
      const start = window.scrollY + rect.top - window.innerHeight / 2 + rect.height / 2;
      // Punto "end": SCROLL_SEGMENT px más abajo
      const end = start + SCROLL_SEGMENT;
      const scroll = window.scrollY;

      let progress = (scroll - start) / (end - start);
      progress = Math.max(0, Math.min(1, progress));
      if (video.duration > 0) {
        video.currentTime = video.duration * progress;
      }
    }

    function attachScrollHandler() {
      // Elimina handlers previos si recargas scripts
      if (lenis && lenis.on && lenis.off) {
        lenis.off("scroll", updateCurrentTime); // Asegura no duplicar
        lenis.on("scroll", updateCurrentTime);
      } else {
        window.removeEventListener("scroll", updateCurrentTime); // Por si acaso duplica
        window.addEventListener("scroll", updateCurrentTime);
      }
      // Actualiza al cargar
      updateCurrentTime();
    }

    // Si el video ya está cargado, aplica el handler, si no espera el evento
    if (video.readyState >= 1) {
      attachScrollHandler();
    } else {
      video.addEventListener("loadedmetadata", attachScrollHandler);
    }
  }

  // --- HOVER VIDEO INDEPENDIENTE ---
  if (typeof $ !== "undefined") {
    let reverseInterval;
    $('.hover-video').hover(
      function () {
        clearInterval(reverseInterval);
        this.play();
      },
      function () {
        let video = this;
        video.pause();
        reverseInterval = setInterval(function () {
          if (video.currentTime <= 0) {
            clearInterval(reverseInterval);
          } else {
            video.currentTime -= 0.05; // Ajusta para mayor/menor velocidad reversa
          }
        }, 20);
      }
    );
  }
});