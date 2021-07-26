var $ = require("./lib/qsa");
var View = require("./view");
var debounce = require("./lib/debounce");

var { isMobile } = require("./lib/breakpoints");
var mapKey = require("../../data/map_keys.sheet.json");
var assetKey = require("../../data/asset_keys.sheet.json");
var labelKey = require("../../data/label_keys.sheet.json");

var mapElement = $.one("#base-map");

var mapAssets = {};
var pastBounds = null;
var classes;

module.exports = class MapView extends View {
  constructor(map) {
    super();
    this.map = map;
    this.onMapScroll = debounce(onMapScroll, 50);
  }

  enter(slide) {
    super.enter(slide);
    var map = this.map;

    mapElement.classList.add("active");
    mapElement.classList.remove("exiting");
    var currLayer = mapKey[slide.id];
    var assets = getLayerVals(currLayer, "assets");
    var labels = getLayerVals(currLayer, "label_ids");

    classes = currLayer.map_class ? currLayer.map_class.split(', ').reverse() : [];
    if (classes.length) window.addEventListener("scroll", this.onMapScroll);

    // Remove old layers if layer isn't in new map
    var keepAssets = [];
    map.eachLayer(function (layer) {
      var id = layer.options.id;
      if (
        !id ||
        id == "baseLayer" ||
        assets.includes(id) ||
        labels.includes(id)
      ) {
        keepAssets.push(id);
        return;
      }
      map.removeLayer(layer);
    });
    assets = assets.filter(k => !keepAssets.includes(k));
    labels = labels.filter(k => !keepAssets.includes(k));

    var bounds = getBounds(currLayer);
    if (!bounds.equals(pastBounds)) {
      map.flyToBounds(bounds, {
        animate: true,
        duration: currLayer.duration,
        noMoveStart: true,
        easeLinearity: 0,
      });
      pastBounds = bounds;
    }

    // Add new layers onto slide.
    addAssets(map, assets);
    if (mapAssets['flood100']) mapAssets['flood100'].bringToFront();
    addMarkers(map, labels, bounds);
  }

  exit(slide) {
    window.removeEventListener("scroll", this.onMapScroll);
    classes.forEach(c => document.body.classList.remove(c))
    super.exit(slide);
    mapElement.classList.add("exiting");
    mapElement.classList.remove("active");
    setTimeout(() => mapElement.classList.remove("exiting"), 1000);
    
  }

  preload = async function (slide, preZoom) {
    var layer = mapKey[slide.id];
    var assets = getLayerVals(layer, "assets");
    assets.forEach(function (a) {
      if (!mapAssets[a]) loadAsset(assetKey[a], a);
    });
    if (preZoom) {
      pastBounds = getBounds(layer);
      this.map.fitBounds(pastBounds);
    };
  };
};

var addMarkers = function (map, labels, bounds) {
  labels.forEach(function (a) {
    var label = labelKey[a];
    if (!label) return;
    var [lat, lon] = label.lat_long.split(",").map(b => Number(b));
    if (isMobile.matches && label.mobile_lat_long) {
      if (label.mobile_lat_long == "hide") return;
      [lat, lon] = label.mobile_lat_long.split(",").map(a => a.trim());
    }

    var marker = new L.Marker([lat, lon], {
      id: a.trim(),
      icon: new L.DivIcon({
        className: label.classNames.split(",").join(" "),
        html: (function () {
          if (label.classNames.includes("company")) {
            return `
              <svg viewBox="0 0 600 600">\
                <path fill="transparent" id="curve" d=\
                      "M100,150 C200,100 400,100 500,150" />\
                <text class="curve" width="300">\
                  <textPath xlink:href="#curve">\
                    ${label.label} \
                  </textPath>\
                </text>\
              </svg>\
            `;
          } else {
            return `${label.label}`;
          }
        })(),
        iconSize: [label.label_width, 20],
      }),
    }).addTo(map);
  });
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

// Get lat/long bounds to zoom to.
var getBounds = function (layer) {
  var southWestBounds = isMobile.matches
    ? layer.mobile_southWest.split(",")
    : layer.southWest.split(",");
  var northEastBounds = isMobile.matches
    ? layer.mobile_northEast.split(",")
    : layer.northEast.split(",");

  var southWest = L.latLng(southWestBounds[0], southWestBounds[1]),
    northEast = L.latLng(northEastBounds[0], northEastBounds[1]),
    bounds = L.latLngBounds(southWest, northEast);
  return bounds;
};

// Async fetch assets.
var fetchAsset = async function (asset) {
  var response = await fetch(`./assets/synced/${asset}`);
  var json = await response.json();
  return json;
};

// Loads an asset, optionally adds to map.
var loadAsset = function (value, id, opt_map) {
  if (!value.path) return;

  fetchAsset(value.path).then(function (d) {
    mapAssets[id] = L.geoJSON(d, {
      id: id,
      style: function (feature) {
        var year = "";
        if (feature.properties && !!feature.properties.sale_date) {
          year = " year year-" + String(feature.properties.sale_date).slice(0, 4);
        }
        return {
          className: value.classNames.split(",").join("") + year,
        };
      },
      smoothFactor: 0,
    });
    if (opt_map) mapAssets[id].addTo(opt_map);
  });
};

var onMapScroll = function () {
  var bounds = $.one('.active.slide .content').getBoundingClientRect();
  var start = classes.length > 1 ? bounds.bottom : bounds.top;
  var factor = (window.innerHeight - (window.innerHeight/3))/classes.length;
  var index = Math.floor((start - (window.innerHeight/3)) / factor);

  for (var i = classes.length - 1; i >= 0; i-- ) {
    document.body.classList.toggle(classes[i], i >= index)
  }

};

var getLayerVals = function (layer, prop) {
  return layer[prop] ? layer[prop].split(",").map(d => d.trim()) : [];
};
