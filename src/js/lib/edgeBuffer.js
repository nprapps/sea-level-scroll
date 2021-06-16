// Credit @https://github.com/TolonUK/Leaflet.EdgeBuffer


(function (factory, window) {

  // attach your plugin to the global 'L' variable
  if (typeof window !== 'undefined' && window.L && !window.L.EdgeBuffer) {
    factory(window.L);
  }
}(function (L) {
  L.EdgeBuffer = {
    previousMethods: {
      getTiledPixelBounds: L.GridLayer.prototype._getTiledPixelBounds
    }
  };

  L.GridLayer.include({

    _getTiledPixelBounds : function(center, zoom, tileZoom) {
      var pixelBounds = L.EdgeBuffer.previousMethods.getTiledPixelBounds.call(this, center, zoom, tileZoom);

      // Default is to buffer one tiles beyond the pixel bounds (edgeBufferTiles = 1).
      var edgeBufferTiles = 1;
      if ((this.options.edgeBufferTiles !== undefined) && (this.options.edgeBufferTiles !== null)) {
        edgeBufferTiles = this.options.edgeBufferTiles;
      }

      if (edgeBufferTiles > 0) {
        var pixelEdgeBuffer = L.GridLayer.prototype.getTileSize.call(this).multiplyBy(edgeBufferTiles);
        pixelBounds = new L.Bounds(pixelBounds.min.subtract(pixelEdgeBuffer), pixelBounds.max.add(pixelEdgeBuffer));
      }
      return pixelBounds;
    }
  });

}, window));