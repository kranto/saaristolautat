# Saaristolautat development notes

## MapLibre prototype

- The application uses MapLibre GL JS with OpenFreeMap's Liberty style.
- The main implementation is in `src/components/MapLibrePrototype.jsx` and `src/components/MapLibrePrototype.css`.
- The MapLibre component is embedded in the legacy application through `src/components/MapContainer.jsx`; its standalone prototype chrome is disabled in embedded mode.
- Keep `src/lib/localizer.js` independent of the Redux store. The store updates the active locale after initialization, avoiding an ESM circular-initialization failure.
- Preserve the object-specific styling and legacy visibility values encoded in the MapLibre renderer and the GeoJSON-like data files.
- The data files retain the original 256 px tile zoom convention, while MapLibre vector tiles use 512 px tiles. Convert data zooms with `MapLibre zoom = legacy zoom - 1`.
- MapLibre `maxzoom` is exclusive. An old inclusive upper zoom must therefore become converted zoom + 1.
- `public/data/saaristo.json` is not strict GeoJSON: its root has a `features` array but no `type: "FeatureCollection"`. The data flattener must continue accepting this legacy form.
- The custom labels have been manually positioned in the data. Keep `text-allow-overlap` and `text-ignore-placement` enabled; do not introduce automatic collision suppression for them.
- Labels become multilingual according to the old `longNameFrom` behaviour and multiline labels are left-aligned.
- Cable-ferry visibility is data-driven. `pargasnagu`, `nagukorpo`, and `vartsala` have `visibleFrom: 8` in the legacy zoom convention; most cable ferries use the default 9 and Högsar uses 11.
- Do not configure a MapLibre vector source with `tileSize: 256`; MapLibre requires vector tile sources to use 512 px tiles and throws during map loading otherwise.
- `roads.json` contains hand-maintained road segments that supplement roads missing from low-zoom basemap tiles. Future road additions should preferably be imported from selected OpenStreetMap/Overpass GeoJSON rather than drawn manually.
- Use `scripts/roads/update_roads.py` and the tracked `scripts/roads/road-imports.json` manifest for repeatable road additions. The manifest keeps legacy `minZ`/`maxZ` values; the renderer performs the MapLibre zoom conversion.

## Verification

- Run `npm run build` after map or data-layer changes.
- On this machine, use Node 24 when the default Node version is too old for the installed Vite version:
  `PATH=/Users/kranto/.nvm/versions/node/v24.21.0/bin:$PATH npm run build`
