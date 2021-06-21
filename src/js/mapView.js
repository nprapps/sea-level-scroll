var $ = require("./lib/qsa");
var mapKey = require("../../data/map_keys.sheet.json");
var assetKey = require("../../data/asset_keys.sheet.json");
var labelKey = require("../../data/label_keys.sheet.json");

var mapElement = $.one("#base-map");

var active;
var mapAssets = {};

var enter = function (slide, map) {
  // if (slide == active) return;
  mapElement.classList.remove("hidden");
  var currLayer = mapKey[slide.id];
  var assets = currLayer.assets
    ? currLayer.assets.split(",").map(d => d.trim())
    : [];

  // Remove old layers.
  map.eachLayer(function (layer) {
    if (layer.options.id == "baseLayer") return;
    map.removeLayer(layer);
  });

  // Add new layers onto slide.
  assets.forEach(function (a) {
    if (mapAssets[a]) {
      mapAssets[a].addTo(map);
    } else {
      var styles = { className: assetKey[a].classNames.split(",").join("") };
      fetchAsset(assetKey[a].path).then(function (d) {
        mapAssets[a] = L.geoJSON(d, { id: a, style: styles });
        mapAssets[a].addTo(map);
      });
    }
  });

  if (currLayer.label_ids) {
    currLayer.label_ids.split(",").forEach(function (a) {
      var label = labelKey[a];
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

  var southWestBounds = currLayer.southWest.split(",");
  var northEastBounds = currLayer.northEast.split(",");

  var southWest = L.latLng(southWestBounds[0], southWestBounds[1]),
    northEast = L.latLng(northEastBounds[0], northEastBounds[1]),
    bounds = L.latLngBounds(southWest, northEast);

  if (currLayer.duration > 0) {
    map.flyToBounds(bounds, {
      animate: true,
      duration: 2,
      easeLinearity: 1,
    });
  } else {
    map.fitBounds(bounds, currLayer.zoomLevel);
  }

  active = slide;
  return mapElement;
};

function style(feature) {
  return {
    weight: 3,
    color: "#fff",
    className: "test-class",
  };
}

var exit = function () {
  mapElement.classList.add("hidden");
  active = null;
};

var preload = async function (slide, preZoom, map) {
  if (preZoom) {
    var currLayer = mapKey[slide.id];

    var southWestBounds = currLayer.southWest.split(",");
    var northEastBounds = currLayer.northEast.split(",");

    var southWest = L.latLng(southWestBounds[0], southWestBounds[1]),
      northEast = L.latLng(northEastBounds[0], northEastBounds[1]),
      bounds = L.latLngBounds(southWest, northEast);
    map.fitBounds(bounds, currLayer.zoomLevel);
  }
};

var fetchAsset = async function (asset) {
  var response = await fetch(`../assets/synced/${asset}`);
  var json = await response.json();
  return json;
};

var loadAssets = (function () {
  Object.entries(assetKey).forEach(function (a) {
    var [id, value] = a;
    if (!value.path) return;
    var styles = { className: value.classNames.split(",").join("") };
    fetchAsset(value.path).then(
      d => (mapAssets[id] = L.geoJSON(d, { id: id, style: styles }))
    );
  });
})();

module.exports = { enter, exit, preload };
