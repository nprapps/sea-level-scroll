var $ = require("./lib/qsa");

var active;
var exiting;
var enter = function (slide) {
};

var exit = function () {

};

var preload = function (slide) {
  var images = $("[data-src]", slide);
  images.forEach(function (img) {
    img.src = img.dataset.src;
    img.removeAttribute("data-src");
  });
};

module.exports = { enter, exit, preload };
