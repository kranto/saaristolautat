const ROUTE_STYLES = {
  base: { color: '#f08000', weight: 5.25, style: 'solid', opacity: 0.7 },
  conn1b: { weight: 3 },
  conn2: { color: '#005dd8', weight: 3.75 },
  conn2m: { color: '#ff7c0a', weight: 3 },
  conn2b: { weight: 2.25 },
  conn3: { color: '#e7883e', weight: 3, opacity: 1 },
  conn4: { color: '#7fb3e8', weight: 2.25, opacity: 0.8 },
  conn5: { color: '#ff7c0a', weight: 2, style: 'dashed', opacity: 1 },
  conn50: { color: '#ff7c0a', weight: 2, style: 'dashed', opacity: 1 },
  cableferry: { color: '#00a050', weight: 4.5, style: 'dotted', opacity: 1 }
};

function findRouteProperties(item, ref, inherited = {}) {
  if (!item) return null;
  if (Array.isArray(item)) {
    for (const child of item) {
      const match = findRouteProperties(child, ref, inherited);
      if (match) return match;
    }
    return null;
  }
  const properties = { ...inherited, ...(item.properties || {}) };
  if (properties.ref === ref && properties.stype === 'connection') return properties;
  return findRouteProperties(item.features, ref, properties);
}

export function getRouteStyle(collections, ref) {
  const properties = findRouteProperties(collections, ref);
  if (!properties) return null;
  const subtype = properties.ssubtype || 'base';
  const style = { ...ROUTE_STYLES.base, ...(ROUTE_STYLES[subtype] || {}) };
  if (!['conn5', 'conn50', 'cableferry'].includes(subtype)) {
    if (properties.color) style.color = properties.color;
    if (properties.weight) style.weight = properties.weight;
    if (properties.opacity !== undefined) style.opacity = properties.opacity;
  }
  return style;
}
