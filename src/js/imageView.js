var $ = require("./lib/qsa");
var View = require("./view");
// var player = require("./player");

module.exports = class ImageView extends View {
  constructor() {
    super();
  }

  preload(slide, active) {
    var images = $("[data-src]", slide);
    images.forEach(function (img) {
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    });
    var posters = $("[data-poster]", slide);
    images.forEach(function (img) {
      img.poster = img.dataset.poster;
      img.removeAttribute("data-poster");
    });
  }
};
