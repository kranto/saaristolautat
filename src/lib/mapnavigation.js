let navigateToObjectHandler = null;
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

export function mapDataReady() {
  flushPendingNavigation();
}

export function panToMapObject(id) {
  if (!id) return;
  pendingObjectId = id;
  flushPendingNavigation();
}
