$(document).ready(function(){
  let reverseInterval;

  $('.hover-video').hover(
    function() {
      // Al entrar el mouse: detener el retroceso y reproducir normal
      clearInterval(reverseInterval);
      this.play();
    },
    function() {
      // Al salir el mouse: pausar y empezar a retroceder simulando reversa
      let video = this;
      video.pause();

      reverseInterval = setInterval(function() {
        if(video.currentTime <= 0) {
          clearInterval(reverseInterval);
        } else {
          video.currentTime -= 0.05; // Ajusta el paso para más o menos velocidad de retroceso
        }
      }, 20); // Ajusta el intervalo (ms) para más fluidez o velocidad
    }
  );
});