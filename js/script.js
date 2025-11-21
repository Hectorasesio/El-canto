document.addEventListener("DOMContentLoaded", function() {
  const lenis = window._lenis;

  // --- SCROLL VIDEO ---
  const video = document.querySelector(".scroll-video");
  const container = document.querySelector(".scroll-video-container");
  const SCROLL_SEGMENT = 600;

  if (video && container) {
    function updateCurrentTime() {
      const rect = container.getBoundingClientRect();
      const start = window.scrollY + rect.top - window.innerHeight / 2 + rect.height / 2;
      const end = start + SCROLL_SEGMENT;
      const scroll = window.scrollY;

      let progress = (scroll - start) / (end - start);
      progress = Math.max(0, Math.min(1, progress));

      if (video.duration > 0) {
        video.currentTime = video.duration * progress;
      }
    }

    function attachScrollHandler() {
      if (lenis && lenis.on && lenis.off) {
        lenis.off("scroll", updateCurrentTime);
        lenis.on("scroll", updateCurrentTime);
      } else {
        window.removeEventListener("scroll", updateCurrentTime);
        window.addEventListener("scroll", updateCurrentTime);
      }

      updateCurrentTime();
    }

    if (video.readyState >= 1) {
      attachScrollHandler();
    } else {
      video.addEventListener("loadedmetadata", attachScrollHandler);
    }
  }

  // --- HOVER VIDEO ---
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
            video.currentTime -= 0.05;
          }
        }, 20);
      }
    );
  }

   // --- HERO KNIGHTS PARALLAX SPLIT ---
  const hero = document.getElementById("hero-el-canto");
  const knightLeft = document.querySelector(".hero-knight-left");
  const knightRight = document.querySelector(".hero-knight-right");
  const textWrapper = document.querySelector(".hero-text-wrapper");

  if (hero && knightLeft && knightRight && textWrapper) {
    const onScrollKnights = () => {
      const rect = hero.getBoundingClientRect();
      const windowH = window.innerHeight;

      let progress = 1 - (rect.bottom / windowH);
      progress = Math.max(0, Math.min(1, progress));

      const eased = Math.min(1, progress * 4.0);

      const baseOffset = 180;   // separación inicial (ya empiezan abiertos)
      const maxOffset  = 320;   // extra con el scroll
      const offset = baseOffset + maxOffset * eased;

      knightLeft.style.transform =
        `translate(-50%, -50%) translateX(${-offset}px)`;
      knightRight.style.transform =
        `translate(-50%, -50%) translateX(${offset}px)`;

      // el texto aparece a medida que ellos se abren
      const textOpacity = Math.max(0, Math.min(1, eased));
      textWrapper.style.opacity = textOpacity;
    };

    if (lenis && lenis.on) {
      lenis.on("scroll", onScrollKnights);
    } else {
      window.addEventListener("scroll", onScrollKnights);
    }

    onScrollKnights();
  }

});
