export function initHeroVideo() {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var video = document.querySelector("[data-hero-video]");
if (video) {
  if (reduceMotion) {
    video.removeAttribute("autoplay");
    video.removeAttribute("loop");
    video.loop = false;
    video.pause();
  } else {
    var markPlaying = function () {
      video.classList.add("is-playing");
    };
    if (video.readyState >= 3) markPlaying();
    video.addEventListener("canplay", markPlaying);
    video.addEventListener("playing", markPlaying);
    video.addEventListener("error", function () {
      video.classList.remove("is-playing");
    });

    video.loop = false;
    video.removeAttribute("loop");

    /* Boomerang: forward to end → reverse to start → forward again */
    var boomDir = 1;
    var boomStepping = false;

    var boomPlayForward = function () {
      boomDir = 1;
      var p = video.play();
      if (p && typeof p.catch === "function") p.catch(function () {});
    };

    var boomBeginReverse = function () {
      if (boomDir !== 1) return;
      boomDir = -1;
      video.pause();
      if (video.duration && isFinite(video.duration)) {
        video.currentTime = Math.max(0, video.duration - 1 / 30);
      }
    };

    var boomReverseStep = function () {
      if (boomDir !== -1 || boomStepping || video.seeking) return;
      var t = video.currentTime - 1 / 30;
      if (t <= 0) {
        boomDir = 1;
        video.currentTime = 0;
        boomPlayForward();
        return;
      }
      boomStepping = true;
      video.currentTime = t;
    };

    video.addEventListener("seeked", function () {
      boomStepping = false;
      if (boomDir === -1) boomReverseStep();
    });

    video.addEventListener("ended", function () {
      boomBeginReverse();
    });

    var boomWatch = function () {
      if (
        boomDir === 1 &&
        video.duration &&
        isFinite(video.duration) &&
        video.currentTime >= video.duration - 0.04
      ) {
        boomBeginReverse();
      }
      requestAnimationFrame(boomWatch);
    };

    boomPlayForward();
    requestAnimationFrame(boomWatch);
  }
}
}
