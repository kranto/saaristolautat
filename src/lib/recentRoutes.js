const STORAGE_KEY = 'saaristolautat.recentRoutes.v1';
const MAX_RECENT_ROUTES = 5;

export function getRecentRoutes() {
  try {
    const routes = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    return Array.isArray(routes) ? routes.filter(route =>
      (route.type === 'route' || route.type === 'longdistance') &&
      (typeof route.id === 'string' || typeof route.id === 'number')
    ).slice(0, MAX_RECENT_ROUTES) : [];
  } catch {
    return [];
  }
}

export function rememberRoute(type, id) {
  if (type !== 'route' && type !== 'longdistance') return;
  const route = { type, id: String(id) };
  const routes = [route, ...getRecentRoutes().filter(item =>
    item.type !== type || String(item.id) !== route.id
  )].slice(0, MAX_RECENT_ROUTES);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
  } catch {
    // Browsers can disable storage; route opening still works without recents.
  }
}
