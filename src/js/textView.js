var $ = require("./lib/qsa");
const player = require("./player");
var View = require("./view");

var mapElement = $.one("#base-map");

module.exports = class TextView extends View {
  constructor() {
    super();
  }

  enter(slide) {
    super.enter(slide);
    mapElement.classList.remove("exiting");
    mapElement.classList.remove("active");
    // Show video toggle
    var video = $.one("video", slide);
    if (!video) {
      player.hide();
      return;
    }
    player.show();
  }

  exit(slide) {
    super.exit(slide);
    // Stop and hide video toggle
    player.stop();
    player.hide();
  }
};
