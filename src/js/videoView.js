var $ = require("./lib/qsa");

var enter = function (slide) {
};

var exit = function () {
};

var preload = function(slide) {
  var videos = $("[data-src]", slide);
  videos.forEach(function (vid) {
    vid.src = vid.dataset.src;
    vid.removeAttribute("data-src");
  });
}

module.exports = { enter, exit, preload };
