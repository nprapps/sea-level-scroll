var $ = require("./lib/qsa");
require("./lib/edgeBuffer");
var track = require("./lib/tracking");
var mapHandler = require("./mapView");
var imageHandler = require("./imageView");
var multImageHandler = require("./multImageView");
var videoView = require("./videoView");

var slides = $(".sequence .slide").reverse();

// Initialize leaflet map
var map = L.map("base-map", { zoomControl: false }).setView(
  [37.492215933518665, -122.20490342600418],
  10
);
L.tileLayer(
  "https://{s}.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    maxZoom: 19,
    attribution: "",
    id: "baseLayer",
    subdomains: ['services', 'server'],
    edgeBufferTiles: 3,
  }
).addTo(map);

var completion = 0;
var handler;
var handlers = {
  map: mapHandler,
  image: imageHandler,
  longText: multImageHandler,
  video: videoView,
};

var active;
var exiting;
var activateSlide = function (slide) {
  // If we changed block type, let the previous director leave
  if (active == slide) return;
  var currType = slide.dataset.type || 'image';
  if (handler && handler != handlers[currType]) {
    handler.exit();
  }

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
  
  handler = handlers[currType];
  handler.enter(slide, map);

  // Lazy-load neighboring slides
  var neighbors = [-1, 0, 1, 2];
  var all = $(".sequence .slide");
  var index = all.indexOf(slide);
  neighbors.forEach(function (offset) {
    var neighbor = all[index + offset];
    if (!neighbor) return;
    var currType = neighbor.dataset.type || 'image';
    var neighborHandler = handlers[currType];
    neighborHandler.preload(neighbor, map);
  });
};

var onScroll = function () {
  for (var i = 0; i < slides.length; i++) {
    var slide = slides[i];
    var bounds = slide.getBoundingClientRect();
    if (bounds.top < window.innerHeight * 0.9 && bounds.bottom > 0) {
      var complete = (((slides.length - i) / slides.length) * 100) | 0;
      if (complete > completion) {
        completion = complete;
        track("completion", completion + "%");
      }
      return activateSlide(slide);
    }
  }
};

document.body.classList.add("boot-complete");
window.addEventListener("scroll", onScroll);
onScroll();

// link tracking
var trackLink = function () {
  var action = this.dataset.track;
  var label = this.dataset.label;
  track(action, label);
};
$("[data-track]").forEach(el => el.addEventListener("click", trackLink));
