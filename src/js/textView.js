var $ = require("./lib/qsa");
var View = require("./view");

var mapElement = $.one("#base-map");

module.exports = class TextView extends View {
  constructor() {
    super()
  }

  enter(slide) {
    super.enter(slide);
    mapElement.classList.add("exiting");
    mapElement.classList.remove("active");
  }
}
