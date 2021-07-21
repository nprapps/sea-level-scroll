var $ = require("./lib/qsa");
var debounce = require("./lib/debounce");
require("./lib/edgeBuffer");
var track = require("./lib/tracking");
var mapView = require("./mapView");
var imageView = require("./imageView");
var textView = require("./textView");
var player = require("./player");

var slides = $(".sequence .slide").reverse();

// Initialize leaflet map
var map = L.map("base-map", { zoomControl: false, fadeAnimation: false, markerZoomAnimation: false}).setView(
  [37.466623667154515, -122.06826378148338],
  13
);
L.tileLayer(
  "https://{s}.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: "",
    id: "baseLayer",
    subdomains: ["services", "server"],
    
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  }
).addTo(map);

var completion = 0;
var handler;

var handlers = {
  map: new mapView(map),
  image: new imageView(),
  video: new imageView(),
  text: new textView(),
  multiple: new imageView(),
};

var active;
var activateSlide = function (slide) {
  if (slide == active) return;

  // If we changed block type, let the previous director leave
  if (handler) {
    handler.exit(active);
  }

  var currType = slide.dataset.type || "image";
  handler = handlers[currType];
  handler.enter(slide);

  active = slide;

  // Lazy-load neighboring slides
  var neighbors = [-1, 0, 1, 2];
  var all = $(".sequence .slide");
  var index = all.indexOf(slide);
  neighbors.forEach(function (offset) {
    var neighbor = all[index + offset];
    if (!neighbor) return;
    var nextType = neighbor.dataset.type || "image";
    var neighborHandler = handlers[nextType];
    neighborHandler.preload(
      neighbor,
      handler != neighborHandler && offset == 1
    );
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
      console.log(`slide ${slides.length - 1 - i}, id: ${slide.id}`);
      return activateSlide(slide);
    }
  }
};

document.body.classList.add("boot-complete");
window.addEventListener("scroll", debounce(onScroll, 50));
onScroll();

player.autoplay.checked = true;
var intro = $.one("#myVideo");
player.play(intro);

// link tracking
var trackLink = function () {
  var action = this.dataset.track;
  var label = this.dataset.label;
  track(action, label);
};
$("[data-track]").forEach(el => el.addEventListener("click", trackLink));
