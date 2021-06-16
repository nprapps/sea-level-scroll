var $ = require("./lib/qsa");

var active;
// fix mee i'm broken and maybe unnecessary anyway
var enter = function (slide) {
  slide.classList.add("active");
  slide.classList.remove("exiting");

  var bounds = slide.getBoundingClientRect();
  var numImages = slide.dataset.num;
  if (bounds.top >= 0) return;

  var increment = bounds.height / numImages;
  var currImg = Math.ceil((bounds.top * -1) / increment) - 1;

  var img = document.getElementById("slide-backdrop", slide);
  var oldSource = img.src.match(/(\d)\.png/)[1];
  if (oldSource == currImg) return;
  var pieces = img.src.split("/");
  var file = pieces[pieces.length - 1].replace(oldSource, currImg);
  pieces.pop();
  pieces.push(file);
  img.src = pieces.join("/");

  active = slide;
};

var exit = function() {
  if (active) {
    active.classList.remove("active");
    active.classList.add("exiting");
    setTimeout(() => active.classList.remove("exiting"), 2000);
  }
  active= null;
}

var preload = function() {
  // active= null;
}

module.exports = { enter, exit, preload };
