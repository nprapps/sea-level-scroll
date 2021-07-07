var $ = require("./lib/qsa");
var View = require("./view");

module.exports = class ImageView extends View {
  constructor() {
    super()
  }
  preload(slide, active) {
    var images = $("[data-src]", slide);
    images.forEach(function (img) {
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    });
  }
}
