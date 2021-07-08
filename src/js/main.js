var $ = require("./lib/qsa");
require("./lib/edgeBuffer");
var track = require("./lib/tracking");
var mapHandler = require("./mapView");
var imageHandler = require("./imageView");
var videoView = require("./videoView");
var textView = require("./textView");
// var mapToImageView = require("./mapToImageView");

var slides = $(".sequence .slide").reverse();

// Initialize leaflet map
var map = L.map("base-map", { zoomControl: false }).setView(
  [37.492215933518665, -122.20490342600418],
  10
);
L.tileLayer(
  "https://{s}.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: "",
    id: "baseLayer",
    subdomains: ['services', 'server'],
    edgeBufferTiles: 2,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  }
).addTo(map);

var completion = 0;
var handler;

var handlers = {
  map: new mapHandler(map),
  image: new imageHandler(),
  video: new videoView(),
  text: new textView(),
  // mapToImage: new mapToImageView(),
};

var active;
var exiting;
var activateSlide = function (slide) {
  // If we changed block type, let the previous director leave
  if (slide == active) {
    if (slide.dataset.type == "longText") {
      handler.enter(slide, map);
    }
    return;
  };
  var currType = slide.dataset.type || 'image';
  if (handler) {
    handler.exit(active);
  }

  handler = handlers[currType];

  exiting = active;
  active = slide;
  
  handler.enter(slide, map);

  // Lazy-load neighboring slides
  var neighbors = [-1, 0, 1, 2];
  var all = $(".sequence .slide");
  var index = all.indexOf(slide);
  neighbors.forEach(function (offset) {
    var neighbor = all[index + offset];
    if (!neighbor) return;
    var nextType = neighbor.dataset.type || 'image';
    var neighborHandler = handlers[nextType];
    neighborHandler.preload(neighbor, handler != neighborHandler && offset == 1, map);
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
      console.log(`slide ${slides.length-1-i}, id: ${slide.id}`) 
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
