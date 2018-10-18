function panTo(map, bounds, mapWidth) {
    // pan to center of the bounds, then pan according to the info window and headerbar
    // and finally if bounds do not fit, zoom out and start over. 
    var center = { lat: (bounds.north + bounds.south) / 2, lng: (bounds.west + bounds.east) / 2 };
    map.panTo(center);
    if (mapWidth >= 768) {
        map.panBy(-200, -25); // half of info window & header bar
    } else {
        map.panBy(0, -25); // half or header bar
    }
    if (map.getZoom() > 5 && !map.getBounds().contains({ lat: bounds.south, lng: bounds.east })) {
        map.setZoom(map.getZoom() - 1);
        panTo(map, bounds, mapWidth);
    }
}

window.panTo = panTo;