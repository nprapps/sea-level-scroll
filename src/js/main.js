var $ = require("./lib/qsa");
var debounce = require("./lib/debounce");
var track = require("./lib/tracking");
var mapView = require("./mapView");
var imageView = require("./imageView");
var textView = require("./textView");
require("./videos");
require("./analytics");

var slides = $(".sequence .slide").reverse();

var autoplayWrapper = $.one(".a11y-controls");

// Initialize leaflet map
var map = L.map("base-map", {
  zoomSnap: 0.5,
  zoomControl: false,
  fadeAnimation: false,
  markerZoomAnimation: false,
}).setView([37.466623667154515, -122.06826378148338], 13);

map.createPane("images");

var imageUrl = "./assets/synced/images/background.jpg",
  imageBounds = [
    [37.546638783179674, -121.86561652661184],
    [37.356600118161026, -122.24129532016448],
  ];

L.imageOverlay(imageUrl, imageBounds, { pane: "tilePane" }).addTo(map);
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
var activateSlide = function (slide, slideNumber) {
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

  // Remove focus from autoplay checkbox
  $.one("#autoplay-video").blur();

  // Handle autoplay toggle display
  var classes = autoplayWrapper.classList;
  // On first slide (headline), don't fix, don't hide
  if (slideNumber === 0) {
    classes.remove("fixed");
    classes.remove("hidden");
    return;
  }
  // Fix after first slide
  classes.add("fixed");
  // Hide if not text or video
  if (currType === "video" || currType === "text") {
    classes.remove("hidden");
  } else {
    classes.add("hidden");
  }
};

var onScroll = function () {
  for (var i = 0; i < slides.length; i++) {
    var slide = slides[i];
    var bounds = slide.getBoundingClientRect();
    if (bounds.top < window.innerHeight * 0.9 && bounds.bottom > 0) {
      var complete = (((slides.length - i) / slides.length) * 100) | 0;
      if (complete > completion) {
        completion = complete;
        console.log(completion)
        track("completion", completion + "%");
      }
      var slideNumber = slides.length - 1 - i;
      console.log(`slide ${slideNumber}, id: ${slide.id}`);
      return activateSlide(slide, slideNumber);
    }
  }
};

document.body.classList.add("boot-complete");
window.addEventListener("scroll", debounce(onScroll, 50));
onScroll();

// fix viewport height units in Safari
if (!!navigator.userAgent.match(/i(os|pad|phone)/i)) {
  var setVH = function() {
    var vh = window.innerHeight / 100;
    document.body.style.setProperty("--vh", `${vh}px`);
  };
  window.addEventListener("resize", setVH);
  setVH();
}

// handle NPR One
var here = new URL(window.location.href);
var renderPlatform = here.searchParams.get("renderPlatform");
if (renderPlatform && renderPlatform.match(/nprone/)) {
  document.body.classList.add("nprone");
}

// link tracking
var trackLink = function () {
  var action = this.dataset.track;
  var label = this.dataset.label;
  track(action, label);
};
$("[data-track]").forEach(el => el.addEventListener("click", trackLink));
