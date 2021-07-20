var $ = require("./lib/qsa");
var View = require("./view");
var player = require("./player");

module.exports = class ImageView extends View {
  constructor() {
    super();
  }

  enter(slide) {
    super.enter(slide);
    var video = $.one("video", slide);
    // Show video toggle
    if (!video) {
      player.hide();
      return;
    }
    player.show();
    if (player.autoplay.checked) {
      player.play(video);
    } else {
      player.cue(video);
    }
  }

  exit(slide) {
    super.exit(slide);
    // Stop and hide video toggle
    player.stop();
    player.hide();
  }

  preload(slide, active) {
    var images = $("[data-src]", slide);
    images.forEach(function (img) {
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    });
  }
};
