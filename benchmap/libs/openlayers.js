// OpenLayers 10, no React wrapper (none is official): canvas vector layers, built-in Cluster source below z12,
// individual vehicles from z12. OpenLayers zooms are one higher than MapLibre's for the same scale (256 px tiles).
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import Cluster from 'ol/source/Cluster.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import { Style, Fill, Stroke, Circle } from 'ol/style.js';
import { fromLonLat, toLonLat } from 'ol/proj.js';
import { boundingExtent } from 'ol/extent.js';
import 'ol/ol.css';
import { CENTER, START_ZOOM, CLUSTER_BELOW, ATTRIBUTION, BASEMAP_URL, COLOURS as C, vehicles, register, ready, pick, live } from '../shared.js';

document.getElementById('lib').textContent = 'OpenLayers';
const Z = 1; // MapLibre zoom + 1
const fill = (c) => new Fill({ color: c });
const base = new VectorLayer({
  source: new VectorSource({ url: BASEMAP_URL, format: new GeoJSON(), attributions: ATTRIBUTION }),
  style: (f) => {
    const k = f.get('kind');
    if (k === 'road' || k === 'major') return new Style({ stroke: new Stroke({ color: C[k], width: k === 'major' ? 3 : 1.5 }) });
    return new Style({ fill: fill(C[k]) });
  },
});
const makeFeatures = () => vehicles.map((v) => { const f = new Feature({ geometry: new Point(fromLonLat([v.lng, v.lat])), status: v.status }); f.setId(v.id); return f; });
const points = new VectorSource({ features: makeFeatures() });
const dot = { ok: new Style({ image: new Circle({ radius: 5, fill: fill(C.ok), stroke: new Stroke({ color: C.halo, width: 1.5 }) }) }),
  alert: new Style({ image: new Circle({ radius: 5, fill: fill(C.alert), stroke: new Stroke({ color: C.halo, width: 1.5 }) }) }) };
const clusterStyles = {};
const clusterLayer = new VectorLayer({
  source: new Cluster({ source: points, distance: 50 }), maxZoom: CLUSTER_BELOW + Z,
  style: (f) => {
    const n = f.get('features').length;
    if (n === 1) return dot[f.get('features')[0].get('status')];
    const r = n >= 200 ? 22 : n >= 50 ? 16 : 12;
    return (clusterStyles[r] ??= new Style({ image: new Circle({ radius: r, fill: fill(C.cluster + 'd9'), stroke: new Stroke({ color: C.halo, width: 2 }) }) }));
  },
});
const vehicleLayer = new VectorLayer({ source: points, minZoom: CLUSTER_BELOW + Z, style: (f) => dot[f.get('status')] });
const view = new View({ center: fromLonLat(CENTER), zoom: START_ZOOM + Z });
const map = new Map({ target: 'map', layers: [base, clusterLayer, vehicleLayer], view });

map.on('singleclick', (e) => {
  map.forEachFeatureAtPixel(e.pixel, (f, layer) => {
    if (layer === clusterLayer && f.get('features').length > 1) {
      view.fit(boundingExtent(f.get('features').map((x) => x.getGeometry().getCoordinates())), { duration: 300, padding: [60, 60, 60, 60] });
    } else pick(layer === clusterLayer ? f.get('features')[0].getId() : f.getId());
    return true;
  }, { hitTolerance: 2 });
});

register({
  view: () => { const [lng, lat] = toLonLat(view.getCenter()); return { lng, lat, zoom: view.getZoom() - Z }; },
  jumpTo: (c, z) => { view.setCenter(fromLonLat(c)); view.setZoom(z + Z); },
  flyTo: (c, z) => view.animate({ center: fromLonLat(c), zoom: z + Z }),
  project: (c) => map.getPixelFromCoordinate(fromLonLat(c)),
  clusters: () => view.getZoom() >= CLUSTER_BELOW + Z ? [] : clusterLayer.getSource().getFeatures().filter((f) => f.get('features').length > 1)
    .map((f) => { const [x, y] = map.getPixelFromCoordinate(f.getGeometry().getCoordinates()); return { x, y, count: f.get('features').length }; }),
});
// Replace all features in one batch. Moving each feature with setCoordinates() fires a change event per feature, and
// the Cluster source re-clusters on every one: 5,000 moves froze the page for 127 s in this bench.
live(() => { points.clear(true); points.addFeatures(makeFeatures()); });
base.getSource().once('featuresloadend', () => map.once('rendercomplete', ready));
