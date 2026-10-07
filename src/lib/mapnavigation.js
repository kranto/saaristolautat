let navigateToObjectHandler = null;
let getMapViewHandler = null;
let showPierTooltipHandler = null;
let closePierTooltipHandler = null;
let pendingObjectId = null;

function flushPendingNavigation() {
  if (!navigateToObjectHandler || !pendingObjectId) return;
  if (navigateToObjectHandler(pendingObjectId) !== false) pendingObjectId = null;
}

export function registerMapNavigation(handler) {
  navigateToObjectHandler = handler;
  flushPendingNavigation();
  return () => {
    if (navigateToObjectHandler === handler) navigateToObjectHandler = null;
  };
}

export function registerMapView(handler) {
  getMapViewHandler = handler;
  return () => {
    if (getMapViewHandler === handler) getMapViewHandler = null;
  };
}

export function registerMapPierTooltip(showHandler, closeHandler) {
  showPierTooltipHandler = showHandler;
  closePierTooltipHandler = closeHandler;
  return () => {
    if (showPierTooltipHandler === showHandler) showPierTooltipHandler = null;
    if (closePierTooltipHandler === closeHandler) closePierTooltipHandler = null;
  };
}

export function showMapPierTooltip(id, panTo) {
  showPierTooltipHandler?.(id, panTo);
}

export function closeMapPierTooltip(id) {
  closePierTooltipHandler?.(id);
}

export function mapDataReady() {
  flushPendingNavigation();
}

export function panToMapObject(id) {
  if (!id) return;
  pendingObjectId = id;
  flushPendingNavigation();
}

export function getMapView() {
  return getMapViewHandler?.() || null;
}
