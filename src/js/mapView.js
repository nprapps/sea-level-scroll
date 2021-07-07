var $ = require("./lib/qsa");
var View = require("./view");

var { isMobile } = require("./lib/breakpoints");
var mapKey = require("../../data/map_keys.sheet.json");
var assetKey = require("../../data/asset_keys.sheet.json");
var labelKey = require("../../data/label_keys.sheet.json");

var mapElement = $.one("#base-map");

var mapAssets = {};
var pastBounds = null;

module.exports = class MapView extends View {
  constructor() {
    super();
  }

  enter(slide, map) {
    super.enter(slide);
    var currLayer = mapKey[slide.id];
    var assets = currLayer.assets
      ? currLayer.assets.split(",").map(d => d.trim())
      : [];

    // Remove old layers if layer isn't in new map
    var keepAssets = [];
    map.eachLayer(function (layer) {
      var id = layer.options.id;
      if (!id || id == "baseLayer" || assets.includes(id)) {
        keepAssets.push(id);
        return;
      }
      map.removeLayer(layer);
    });
    assets = assets.filter(k => !keepAssets.includes(k));

    var bounds = getBounds(currLayer);
    if (!bounds.equals(pastBounds)) {
      map.flyToBounds(bounds, {
        animate: currLayer.duration > 0,
        duration: currLayer.duration,
      });
      pastBounds = bounds;
    }

    // Add new layers onto slide.
    addAssets(map, assets);
    addMarkers(map, currLayer, bounds);
    return mapElement;
  }

  exit(slide) {

    super.exit(slide);
    // mapElement.classList.add("exiting");
    // mapElement.classList.remove("active");
    // setTimeout(() => mapElement.classList.remove("exiting"), 1000);
  }
};

var addMarkers = function (map, layer, bounds) {
  if (layer.label_ids) {
    layer.label_ids.split(",").forEach(function (a) {
      var label = labelKey[a.trim()];
      if (!label) return;
      var [lat, lon] = label.lat_long.split(",").map(b => Number(b));
      if (!bounds.contains(L.latLng([lat, lon])) && label.alt_lat_long) {
        [lat, lon] = label.alt_lat_long.split(",").map(a => a.trim());
      }
      var marker = new L.Marker([lat, lon], {
        id: a.trim(),
        icon: new L.DivIcon({
          className: label.classNames.split(",").join(" "),
          html: `<span>${label.label}</span>`,
          iconSize: label.classNames.includes("highway") ? [20, 20] : [150, 20],
        }),
      }).addTo(map);
    });
  }
};

// Add all current assets to the map.
var addAssets = function (map, assets) {
  assets.forEach(function (a) {
    if (mapAssets[a]) {
      console.log(a, mapAssets[a]);
      mapAssets[a].addTo(map);
    } else {
      loadAsset(assetKey[a], a, map);
    }
  });
};

var preload = async function (slide, preZoom, map) {
  //TODO: preload asset
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