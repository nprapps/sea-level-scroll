var $ = require("./lib/qsa");
var track = require("./lib/tracking");
// var flags = require("./flags");
var flags = {
  autoplay: true,
};

var autoplayers = $("video[autoplay]");

// handle accessibility toggles
var autoplayCheck = $.one("#autoplay-video");

var toggleAutoplay = function (enable, trackThis) {
  if (trackThis) {
    track("autoplay-toggle", enable);
  }
  autoplayCheck.checked = enable;
  if (enable) {
    autoplayers.forEach(function (video) {
      video.setAttribute("autoplay", "");
      if (!video.paused) return;
      var promised = video.play();
      // ignore DOMExceptions for playback, they can get tripped up by the lazy load
      if (promised) promised.catch(err => err);
    });
  } else {
    autoplayers.forEach(function (video) {
      video.removeAttribute("autoplay");
      video.pause();
    });
  }
};

autoplayCheck.checked = flags.autoplay;

autoplayCheck.addEventListener("change", e =>
  toggleAutoplay(e.target.checked, true)
);

var reducedMotion = window.matchMedia("(prefers-reduced-motion)");
if ("addEventListener" in reducedMotion) {
  reducedMotion.addEventListener("change", () =>
    toggleAutoplay(!reducedMotion.matches)
  );
} else {
  reducedMotion.addListener(() => toggleAutoplay(!reducedMotion.matches));
}

toggleAutoplay(!reducedMotion.matches && autoplayCheck.checked);

track("prefers-reduced-motion", reducedMotion.matches);
