var $ = require("./lib/qsa");
var { isMobile } = require("./lib/breakpoints");
var mapKey = require("../../data/map_keys.sheet.json");
var assetKey = require("../../data/asset_keys.sheet.json");
var labelKey = require("../../data/label_keys.sheet.json");

var mapElement = $.one("#base-map");

var active;
var mapAssets = {};

console.log(isMobile);

var enter = function (slide, map) {
  // if (slide == active) return;
  mapElement.classList.add("active");
  var currLayer = mapKey[slide.id];
  var assets = currLayer.assets
    ? currLayer.assets.split(",").map(d => d.trim())
    : [];

  // Remove old layers.
  map.eachLayer(function (layer) {
    if (layer.options.id == "baseLayer") return;
    map.removeLayer(layer);
  });

  map.flyToBounds(getBounds(currLayer), {
    animate: currLayer.duration > 0,
    duration: currLayer.duration,
  });

  // Add new layers onto slide.
  addAssets(map, assets);
  addMarkers(map, currLayer);

  active = slide;
  return mapElement;
};

var exit = function () {
  mapElement.classList.add("exiting");
  mapElement.classList.remove("active");
  active = null;
};

var addMarkers = function (map, layer) {
  if (layer.label_ids) {
    layer.label_ids.split(",").forEach(function (a) {
      var label = labelKey[a.trim()];
      if (!label) return;
      var [lat, lon] = label.lat_long.split(",");
      new L.Marker([lat, lon], {
        icon: new L.DivIcon({
          className: label.classNames.split(",").join(" "),
          html: `<span>${label.label}</span>`,
          iconSize: [150, 30],
        }),
      }).addTo(map);
    });
  }
};

// Add all current assets to the map.
var addAssets = function (map, assets) {
  assets.forEach(function (a) {
    if (mapAssets[a]) {
      mapAssets[a].addTo(map);
    } else {
      loadAsset(assetKey[a], a, map);
    }
  });
};

var preload = async function (slide, preZoom, map) {
  if (preZoom) {
    var currLayer = mapKey[slide.id];
    map.fitBounds(getBounds(currLayer), currLayer.zoomLevel);
  }
};

// Get lat/long bounds to zoom to.
var getBounds = function (layer) {
  var southWestBounds = isMobile
    ? layer.mobile_southWest.split(",")
    : layer.southWest.split(",");
  var northEastBounds = isMobile
    ? layer.mobile_northEast.split(",")
    : layer.northEast.split(",");

  var southWest = L.latLng(southWestBounds[0], southWestBounds[1]),
    northEast = L.latLng(northEastBounds[0], northEastBounds[1]),
    bounds = L.latLngBounds(southWest, northEast);
  return bounds;
};

// Async fetch assets.
var fetchAsset = async function (asset) {
  var response = await fetch(`../assets/synced/${asset}`);
  var json = await response.json();
  return json;
};

// Loads an asset, optionally adds to map.
var loadAsset = function (value, id, opt_map) {
  if (!value.path) return;
  var styles = { className: value.classNames.split(",").join("") };
  fetchAsset(value.path).then(function (d) {
    mapAssets[id] = L.geoJSON(d, { id: id, style: styles });
    if (opt_map) mapAssets[id].addTo(opt_map);
  });
};

// Attempt at loading all assets on page load in the background.
var loadAssets = (function () {
  Object.entries(assetKey).forEach(function (a) {
    var [id, value] = a;
    loadAsset(value, id);
  });
})();

module.exports = { enter, exit, preload };
