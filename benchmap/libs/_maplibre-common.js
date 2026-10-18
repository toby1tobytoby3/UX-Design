// Shared by the two MapLibre stacks: the basemap style and the camera hooks.
import { ATTRIBUTION, BASEMAP_URL, COLOURS as C } from '../shared.js';

export const basemapStyle = {
  version: 8,
  sources: { base: { type: 'geojson', data: BASEMAP_URL, attribution: ATTRIBUTION } },
  layers: [
    { id: 'bg', type: 'background', paint: { 'background-color': C.land } },
    { id: 'park', type: 'fill', source: 'base', filter: ['==', ['get', 'kind'], 'park'], paint: { 'fill-color': C.park } },
    { id: 'water', type: 'fill', source: 'base', filter: ['==', ['get', 'kind'], 'water'], paint: { 'fill-color': C.water } },
    { id: 'road', type: 'line', source: 'base', filter: ['==', ['get', 'kind'], 'road'], paint: { 'line-color': C.road, 'line-width': 1.5 } },
    { id: 'major', type: 'line', source: 'base', filter: ['==', ['get', 'kind'], 'major'], paint: { 'line-color': C.major, 'line-width': 3 } },
  ],
};
export const mapHooks = (map) => ({
  view: () => ({ lng: map.getCenter().lng, lat: map.getCenter().lat, zoom: map.getZoom() }),
  jumpTo: (c, z) => map.jumpTo({ center: c, zoom: z }),
  flyTo: (c, z) => map.flyTo({ center: c, zoom: z }),
  project: (c) => { const p = map.project(c); return [p.x, p.y]; },
});

