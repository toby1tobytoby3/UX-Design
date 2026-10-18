// Leaflet 1.9 through react-leaflet 5: canvas renderer, GeoJSON basemap, supercluster for clusters (Leaflet has none
// built in; the usual plugin, Leaflet.markercluster, is DOM markers). Leaflet zooms are one higher than MapLibre's.
import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { MapContainer, GeoJSON, CircleMarker, useMap, useMapEvents } from 'react-leaflet';
import Supercluster from 'supercluster';
import 'leaflet/dist/leaflet.css';
import { CENTER, START_ZOOM, CLUSTER_BELOW, ATTRIBUTION, BASEMAP_URL, BBOX, COLOURS as C, toGeoJSON, register, ready, pick, live } from '../shared.js';

document.getElementById('lib').textContent = 'Leaflet + react-leaflet';
const Z = 1;
const baseStyle = (f) => { const k = f.properties.kind;
  return k === 'road' || k === 'major' ? { color: C[k], weight: k === 'major' ? 3 : 1.5, opacity: 1 } : { stroke: false, fillColor: C[k], fillOpacity: 1 }; };

function Vehicles() {
  const map = useMap();
  const [tick, setTick] = useState(0);
  const [view, setView] = useState({ zoom: map.getZoom(), bounds: map.getBounds() });
  useMapEvents({ moveend: () => setView({ zoom: map.getZoom(), bounds: map.getBounds() }) });
  const index = useMemo(() => new Supercluster({ radius: 50, maxZoom: CLUSTER_BELOW - 1 }).load(toGeoJSON().features), [tick]);
  const b = view.bounds;
  const items = index.getClusters([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()], Math.floor(view.zoom - Z));
  useEffect(() => {
    register({
      view: () => ({ lng: map.getCenter().lng, lat: map.getCenter().lat, zoom: map.getZoom() - Z }),
      jumpTo: (c, z) => map.setView([c[1], c[0]], z + Z, { animate: false }),
      flyTo: (c, z) => map.flyTo([c[1], c[0]], z + Z),
      project: (c) => { const p = map.latLngToContainerPoint([c[1], c[0]]); return [p.x, p.y]; },
      clusters: () => window.__items.filter((f) => f.properties.cluster)
        .map((f) => { const p = map.latLngToContainerPoint([f.geometry.coordinates[1], f.geometry.coordinates[0]]); return { x: p.x, y: p.y, count: f.properties.point_count }; }),
    });
    live(() => setTick((t) => t + 1));
  }, []);
  window.__items = items;
  return items.map((f) => {
    const [lng, lat] = f.geometry.coordinates, p = f.properties;
    if (p.cluster) {
      const r = p.point_count >= 200 ? 22 : p.point_count >= 50 ? 16 : 12;
      return <CircleMarker key={`c${p.cluster_id}`} center={[lat, lng]} radius={r} pathOptions={{ fillColor: C.cluster, fillOpacity: 0.85, color: C.halo, weight: 2 }}
        eventHandlers={{ click: () => map.setView([lat, lng], index.getClusterExpansionZoom(p.cluster_id) + Z) }} />;
    }
    return <CircleMarker key={p.id} center={[lat, lng]} radius={5} pathOptions={{ fillColor: p.status === 'alert' ? C.alert : C.ok, fillOpacity: 1, color: C.halo, weight: 1.5 }}
      eventHandlers={{ click: () => pick(p.id) }} />;
  });
}

function Basemap() {
  const map = useMap();
  const [data, setData] = useState(null);
  useEffect(() => { fetch(BASEMAP_URL).then((r) => r.json()).then(setData); }, []);
  useEffect(() => { if (data) requestAnimationFrame(() => requestAnimationFrame(ready)); }, [data]);
  return data && <GeoJSON data={data} style={baseStyle} attribution={ATTRIBUTION} interactive={false} />;
}

createRoot(document.getElementById('map')).render(
  <MapContainer center={[CENTER[1], CENTER[0]]} zoom={START_ZOOM + Z} preferCanvas style={{ height: '100%', background: C.land }}>
    <Basemap />
    <Vehicles />
  </MapContainer>
);
