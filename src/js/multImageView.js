var $ = require("./lib/qsa");

var active;
// fix mee i'm broken and maybe unnecessary anyway
var enter = function (slide) {
  var bounds = slide.getBoundingClientRect();
  var numImages = slide.dataset.num;
  if (bounds.top >= 0) return;

  var increment = bounds.height / numImages;
  // Get which of the several images should be displaying.
  var currImg = Math.ceil((bounds.top * -1) / increment) - 1;

  var img = document.getElementById("slide-backdrop", slide);
  var newSrc = `${slide.dataset.base}${currImg}.png`;
  if (img.src != newSrc ) img.src = newSrc;
};

var exit = function() {
}

var preload = function(slide) {
 var images = $("[data-src]", slide);
  images.forEach(function (img) {
    img.src = img.dataset.src;
    img.removeAttribute("data-src");
  });
}

module.exports = { enter, exit, preload };
