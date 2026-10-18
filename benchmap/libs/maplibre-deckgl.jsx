// MapLibre basemap with deck.gl drawing the vehicles (MapboxOverlay, interleaved). deck.gl has no clustering:
// supercluster builds the clusters below z12.
import React, { useState, useMemo, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Map, useControl } from '@vis.gl/react-maplibre';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ScatterplotLayer } from '@deck.gl/layers';
import Supercluster from 'supercluster';
import 'maplibre-gl/dist/maplibre-gl.css';
import { CENTER, START_ZOOM, CLUSTER_BELOW, BBOX, vehicles, toGeoJSON, register, ready, pick, live } from '../shared.js';
import { basemapStyle, mapHooks } from './_maplibre-common.js';

document.getElementById('lib').textContent = 'MapLibre + deck.gl (interleaved)';
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const OK = rgb('#2a63c4'), ALERT = rgb('#c4320a'), WHITE = [255, 255, 255];

function DeckGLOverlay(props) {
  const overlay = useControl(() => new MapboxOverlay({ interleaved: true }));
  overlay.setProps(props);
  return null;
}

function App() {
  const [tick, setTick] = useState(0);
  const [zoom, setZoom] = useState(START_ZOOM);
  const mapRef = useRef();
  const clustered = zoom < CLUSTER_BELOW;
  const index = useMemo(() => clustered && new Supercluster({ radius: 50, maxZoom: CLUSTER_BELOW - 1 }).load(toGeoJSON().features), [tick, clustered]);
  const clusters = useMemo(() => clustered ? index.getClusters(BBOX, Math.floor(zoom)) : [], [index, Math.floor(zoom)]);

  const onLoad = useCallback(({ target: map }) => {
    register({
      ...mapHooks(map),
      clusters: () => (map.getZoom() < CLUSTER_BELOW ? window.__clusters : []).filter((f) => f.properties.cluster)
        .map((f) => { const p = map.project(f.geometry.coordinates); return { x: p.x, y: p.y, count: f.properties.point_count }; }),
    });
    live(() => setTick((t) => t + 1));
    map.once('idle', ready);
  }, []);
  window.__clusters = clusters;

  const layers = clustered ? [new ScatterplotLayer({
    id: 'clusters', data: clusters, pickable: true, radiusUnits: 'pixels', stroked: true, lineWidthUnits: 'pixels', getLineWidth: 2,
    getPosition: (f) => f.geometry.coordinates, getFillColor: (f) => f.properties.cluster ? [...OK, 217] : (f.properties.status === 'alert' ? ALERT : OK),
    getRadius: (f) => !f.properties.cluster ? 5 : f.properties.point_count >= 200 ? 22 : f.properties.point_count >= 50 ? 16 : 12, getLineColor: WHITE,
    onClick: ({ object: f }) => {
      if (!f.properties.cluster) return pick(f.properties.id);
      mapRef.current.easeTo({ center: f.geometry.coordinates, zoom: index.getClusterExpansionZoom(f.properties.cluster_id) });
    },
  })] : [new ScatterplotLayer({
    id: 'vehicles', data: vehicles, pickable: true, radiusUnits: 'pixels', getRadius: 5, stroked: true, lineWidthUnits: 'pixels', getLineWidth: 1.5,
    getPosition: (v) => [v.lng, v.lat], getFillColor: (v) => v.status === 'alert' ? ALERT : OK, getLineColor: WHITE,
    updateTriggers: { getPosition: tick }, onClick: ({ object: v }) => pick(v.id),
  })];

  return (
    <Map ref={mapRef} initialViewState={{ longitude: CENTER[0], latitude: CENTER[1], zoom: START_ZOOM }} mapStyle={basemapStyle}
      onLoad={onLoad} onZoomEnd={(e) => setZoom(e.target.getZoom())}>
      <DeckGLOverlay layers={layers} />
    </Map>
  );
}
createRoot(document.getElementById('map')).render(<App />);
