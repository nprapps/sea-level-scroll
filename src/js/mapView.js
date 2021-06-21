var $ = require("./lib/qsa");
var mapKey = require("../../data/map_keys.sheet.json");
var assetKey = require("../../data/asset_keys.sheet.json");
var labelKey = require("../../data/label_keys.sheet.json");

var mapElement = $.one("#base-map");

var active;

var enter = function (slide, map) {
  // if (slide == active) return;
  mapElement.classList.remove("hidden");

  map.eachLayer(function (layer) {
    if (layer.options.id == "baseLayer") return;
    map.removeLayer(layer);
  });
  var currLayer = mapKey[slide.id];

  if (currLayer.assets) {
    currLayer.assets.split(",").forEach(function (a) {
      var styles = { className: assetKey[a].classNames };
      fetchAsset(assetKey[a].path).then(d =>
        L.geoJSON(d, { style: styles }).addTo(map)
      );
    });
  }
  if (currLayer.label_ids) {
    currLayer.label_ids.split(",").forEach(function (a) {
      var label = labelKey[a];
      if (!label) return;
      var [lat, lon] = label.lat_long.split(',');
      new L.Marker([lat, lon], {
        icon: new L.DivIcon({
          className: label.classNames.split(",").join(' '),
          html:
            `<span>${label.label}</span>`,
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
    map.flyToBounds(bounds, currLayer.zoomLevel, {
      animate: true,
      duration: currLayer.duration,
    });
  } else {
    map.fitBounds(bounds, currLayer.zoomLevel);
  }

  active = slide;
  return mapElement;
};

function style(feature) {
  console.log(feature);
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

module.exports = { enter, exit, preload };
