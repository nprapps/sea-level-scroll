var $ = require("./lib/qsa");
var View = require("./view");

module.exports = class ImageView extends View {
  constructor() {
    super();
  }
  preload(slide, active) {
    var videos = $("[data-src]", slide);
    videos.forEach(function (vid) {
      vid.src = vid.dataset.src;
      vid.removeAttribute("data-src");
    });
  }
};
