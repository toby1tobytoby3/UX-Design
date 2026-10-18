import * as maplibregl from 'maplibre-gl';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ScatterplotLayer } from '@deck.gl/layers';
const interleaved = location.hash === '#i';
const map = new maplibregl.Map({ container: 'map', style: { version: 8, sources: {}, layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#eee' } }] }, center: [0, 0], zoom: 2 });
window.map = map;
console.log('transform type', typeof map.transform, map.transform && map.transform.height);
map.on('load', () => {
  map.addControl(new MapboxOverlay({ interleaved, layers: [new ScatterplotLayer({ id: 's', data: [[0, 0]], getPosition: (d) => d, getRadius: 10, radiusUnits: 'pixels', getFillColor: [255, 0, 0] })] }));
  map.once('idle', () => console.log('idle ok', interleaved));
});
