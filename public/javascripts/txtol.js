var txtol = {};

// call this after google maps loaded
txtol.init = function() {

  var directions = { 'N': {y: -1, x: -0.5}, 'NE': {y: -1, x: 0}, 'E': {y: -0.5, x: 0}, 'SE': {y: 0, x: 0},
  'S': {x: -0.5, y: 0}, 'SW': {x: -1, y: 0}, 'W': {x: -1, y: -0.5}, 'NW': {x: -1, y: -1}, 'C': {x: -0.5, y: -0.5}};

  function sanitizeAnchor(anchor) {
    anchor = anchor? anchor: {};
    anchor.dir = anchor.dir || 'C';
    anchor.x = typeof anchor.x !== 'number'? 0: anchor.x;
    anchor.y = typeof anchor.y !== 'number'? 0: anchor.y;
    return anchor;
  }

  function TxtOverlay(pos, txt, cls, map, anchor) {
    this.pos = pos;
    this.txt_ = txt;
    this.cls_ = cls;
    this.map_ = map;

    anchor = sanitizeAnchor(anchor);
    this.offset_ = { kx: directions[anchor.dir].x, ky: directions[anchor.dir].y, x: anchor.x, y: anchor.y};

    var div = document.createElement('DIV');
    div.className = "txtol " + this.cls_;
    div.innerHTML = this.txt_;
    this.div_ = div;
    this.visible = true;

    this.setMap(map);
  }

  TxtOverlay.prototype = new google.maps.OverlayView();

  TxtOverlay.prototype.setInnerHTML = function(innerHTML) {
    if (this.div_ && this.div_.innerHTML != innerHTML) {
      this.div_.innerHTML = innerHTML;
      this.draw();
    }
  }

  TxtOverlay.prototype.addEventListener = function(eventType, cb) {
    this.div_.addEventListener(eventType, cb);
  }

  TxtOverlay.prototype.onAdd = function() {
    this.getPanes().overlayMouseTarget.appendChild(this.div_);
    this.draw();
  }

  TxtOverlay.prototype.draw = function() {
    if (!this.visible) return;
    if (!this.map_.getBounds().contains(this.pos)) {
      this.div_.style.visibility = "hidden";
      return;
    } else {
      this.div_.style.visibility = "visible";
    }
    var overlayProjection = this.getProjection();
    if (!overlayProjection) return;
    var position = overlayProjection.fromLatLngToDivPixel(this.pos);
    var div = this.div_;
    var offset = this.offset_;
    div.style.left = (position.x + offset.kx * div.offsetWidth + offset.x)+ 'px';
    div.style.top = (position.y + offset.ky * div.offsetHeight + offset.y) + 'px';
  }

  TxtOverlay.prototype.hide = function() {
    if (!this.visible) return;
    this.visible = false;
    this.div_.style.visibility = "hidden";
  }

  TxtOverlay.prototype.show = function() {
    if (this.visible) return;
    this.visible = true;
    this.div_.style.visibility = "visible";
    this.draw();
  }

  TxtOverlay.prototype.setPosition = function(pos) {
    this.pos = pos;
  }

  TxtOverlay.prototype.setClass = function(cls) {
    this.cls_ = cls;
    this.div_.className = "txtol " + this.cls_;
  }

  txtol.TxtOverlay = TxtOverlay;
}