var $ = require("./lib/qsa");

var active;
var exiting;
var enter = function (slide) {

  if (slide == active) return;
  console.log(slide)
  exiting = active;
  slide.classList.add("active");
  slide.classList.remove("exiting");
  active = slide;

  if (exiting) {
    exiting.classList.remove("active");
    exiting.classList.add("exiting");
    setTimeout(() => exiting.classList.remove("exiting"), 2000);
  }

  // Lazy-load neighboring slides
  var neighbors = [-1, 0, 1, 2];
  var all = $(".sequence .slide");
  var index = all.indexOf(slide);
  neighbors.forEach(function (offset) {
    var neighbor = all[index + offset];
    if (!neighbor) return;
    var images = $("[data-src]", neighbor);
    images.forEach(function (img) {
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    });
  });
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

module.exports = { enter, exit };
