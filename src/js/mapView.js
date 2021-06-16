var $ = require("./lib/qsa");
var mapKey = require("../../data/map_keys.sheet.json");

var mapElement = $.one("#base-map");

var active;

var enter = function (slide, map) {
  if (slide == active) return;
  mapElement.classList.remove("hidden");

  map.eachLayer(function (layer) {
    if (layer.options.id == "baseLayer") return;
    map.removeLayer(layer);
  });
  var currLayer = mapKey[slide.id];

  var southWestBounds = currLayer.southWest.split(",");
  var northEastBounds = currLayer.northEast.split(",");

  var southWest = L.latLng(southWestBounds[0], southWestBounds[1]),
    northEast = L.latLng(northEastBounds[0], northEastBounds[1]),
    bounds = L.latLngBounds(southWest, northEast);

  // console.log(currLayer.duration)
  if (currLayer.duration > 0) {
    map.flyToBounds(bounds, currLayer.zoomLevel, {
      animate: false,
      duration: currLayer.duration,
      maxZoom: currLayer.zoomLevel,
      noMoveStart: false,
      easeLinearity: 1,
    });
  } else {
    map.fitBounds(bounds, currLayer.zoomLevel);
  }

  if (currLayer.assets) {
    currLayer.assets
      .split(",")
      .forEach(a => fetchAsset(a).then(d => L.geoJSON(d).addTo(map)));
  }
  active = slide;
  return mapElement;
};

var exit = function () {
  mapElement.classList.add("hidden");
  active = null;
};

var preload = async function (slide, map) {};

var fetchAsset = async function (asset) {
  var response = await fetch(`../assets/synced/${asset}`);
  var json = await response.json();
  return json;
};

module.exports = { enter, exit, preload };
