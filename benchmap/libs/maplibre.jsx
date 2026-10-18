// MapLibre GL JS 6 through @vis.gl/react-maplibre: GeoJSON source with built-in clustering, layers for clusters and vehicles.
import React, { useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { Map, Source, Layer } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { CENTER, START_ZOOM, CLUSTER_BELOW, COLOURS as C, toGeoJSON, register, ready, pick, live } from '../shared.js';
import { basemapStyle, mapHooks } from './_maplibre-common.js';

document.getElementById('lib').textContent = 'MapLibre GL JS + react-maplibre';

function App() {
  const [data, setData] = useState(toGeoJSON);
  const onLoad = useCallback(({ target: map }) => {
    register({
      ...mapHooks(map),
      clusters: () => map.queryRenderedFeatures({ layers: ['clusters'] })
        .map((f) => { const p = map.project(f.geometry.coordinates); return { x: p.x, y: p.y, count: f.properties.point_count }; }),
    });
    live(() => setData(toGeoJSON()));
    map.once('idle', ready);
  }, []);
  const onClick = useCallback(async (e) => {
    const f = e.features?.[0];
    if (!f) return;
    if (f.layer.id === 'clusters') {
      const zoom = await e.target.getSource('vehicles').getClusterExpansionZoom(f.properties.cluster_id);
      e.target.easeTo({ center: f.geometry.coordinates, zoom });
    } else pick(f.properties.id);
  }, []);
  return (
    <Map initialViewState={{ longitude: CENTER[0], latitude: CENTER[1], zoom: START_ZOOM }} mapStyle={basemapStyle}
      interactiveLayerIds={['clusters', 'vehicles']} onLoad={onLoad} onClick={onClick}>
      <Source id="vehicles" type="geojson" data={data} cluster clusterMaxZoom={CLUSTER_BELOW - 1} clusterRadius={50}>
        <Layer id="clusters" type="circle" filter={['has', 'point_count']} paint={{ 'circle-color': C.cluster, 'circle-opacity': 0.85,
          'circle-radius': ['step', ['get', 'point_count'], 12, 50, 16, 200, 22], 'circle-stroke-width': 2, 'circle-stroke-color': C.halo }} />
        <Layer id="vehicles" type="circle" filter={['!', ['has', 'point_count']]} paint={{ 'circle-radius': 5,
          'circle-color': ['match', ['get', 'status'], 'alert', C.alert, C.ok], 'circle-stroke-width': 1.5, 'circle-stroke-color': C.halo }} />
      </Source>
    </Map>
  );
}
createRoot(document.getElementById('map')).render(<App />);
