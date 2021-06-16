var $ = require("./lib/qsa");

var active;
var exiting;
var enter = function (slide) {

  if (slide == active) return;
  exiting = active;
  slide.classList.add("active");
  slide.classList.remove("exiting");
  active = slide;

  if (exiting) {
    exiting.classList.remove("active");
    exiting.classList.add("exiting");
    setTimeout(() => exiting.classList.remove("exiting"), 2000);
  }
};

var exit = function () {
  if (active) {
    active.classList.remove("active");
    active.classList.add("exiting");
    setTimeout(function() { if (active) active.classList.remove("exiting");}, 2000);
  }
  active = null;
  exiting = null;
};

var preload = function (slide) {
  var images = $("[data-src]", slide);
  images.forEach(function (img) {
    img.src = img.dataset.src;
    img.removeAttribute("data-src");
  });
};

module.exports = { enter, exit, preload };
