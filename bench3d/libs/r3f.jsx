// React Three Fiber 9 + drei 10: three.js as React components. Same four tasks, same asset.
import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows, Html, Instances, Instance, Bounds } from '@react-three/drei';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { MODEL_URL, HOTSPOT, INSTANCES, COLORS, CAMERA, GRID_CAMERA, view, ready, poster, reducedMotion } from '../scene.js';

document.getElementById('lib').textContent = 'React Three Fiber 9.8 + drei 10.7';
const aria = 'Interactive 3D view of the speaker. Drag to rotate.';

// Procedural studio lighting (drei <Environment preset> would fetch an HDR from a CDN).
function Studio() { const room = useMemo(() => new RoomEnvironment(), []); return <Environment frames={1} resolution={256}><primitive object={room} /></Environment>; }
function Ready({ id, how }) { const { invalidate } = useThree(); useEffect(() => { invalidate(); requestAnimationFrame(() => ready(id, how)); }, []); return null; }
function Product({ children }) { const { scene } = useGLTF(MODEL_URL); const copy = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={copy}>{children}</primitive>; }
function Stage({ id, how, children, autoRotate = false, frameloop = 'demand' }) {
  return (<Canvas frameloop={frameloop} dpr={[1, 2]} camera={{ fov: CAMERA.fov, position: CAMERA.position }} aria-label={aria} role="img">
    <color attach="background" args={[COLORS.bg]} />
    <Studio />
    <Suspense fallback={null}>
      {children}
      <ContactShadows position={[0, -1, 0]} opacity={0.35} blur={2.5} scale={6} frames={1} />
      <Ready id={id} how={how} />
    </Suspense>
    <OrbitControls target={CAMERA.target} autoRotate={autoRotate} autoRotateSpeed={1.5} makeDefault />
  </Canvas>);
}
const mount = (id, el) => createRoot(view(id)).render(el);

// 1. Product viewer. frameloop="demand": renders only when something changes.
mount('product', <Stage id="product" how="native: useGLTF, OrbitControls, Environment, ContactShadows, frameloop=demand"><Product /></Stage>);

// 2. 2,000 instances via drei <Instances> (one InstancedMesh, declared per item).
const side = Math.ceil(Math.sqrt(INSTANCES));
const grid = Array.from({ length: INSTANCES }, (_, i) => { const x = (i % side) - side / 2, z = Math.floor(i / side) - side / 2; return [x * 0.5, Math.sin(x / 3) * Math.cos(z / 3) * 1.2, z * 0.5]; });
mount('instances', <Canvas frameloop="demand" dpr={[1, 2]} camera={{ fov: GRID_CAMERA.fov, position: GRID_CAMERA.position }} aria-label="2,000 instanced cubes" role="img">
  <color attach="background" args={[COLORS.bg]} /><Studio />
  <Instances limit={INSTANCES}><boxGeometry args={[0.35, 0.35, 0.35]} /><meshStandardMaterial color={COLORS.accent} roughness={0.5} />
    {grid.map((p, i) => <Instance key={i} position={p} />)}</Instances>
  <Ready id="instances" how="native: drei <Instances> (1 draw call, React-declared items)" />
</Canvas>);

// 3. Hotspot: drei <Html> follows a 3D position automatically.
function Hotspot() { const { scene } = useGLTF(MODEL_URL); const p = scene.getObjectByName(HOTSPOT.node).position;
  return <Html position={[p.x, p.y, p.z]} zIndexRange={[5, 0]}><div className="hotspot" style={{ position: 'static', transform: 'translate(-8px,-50%)' }}><span></span>{HOTSPOT.label}</div></Html>; }
mount('hotspot', <Stage id="hotspot" how="native: drei <Html> pinned to a 3D position"><Product /><Hotspot /></Stage>);

// 4. Poster via Suspense fallback; auto-rotate gated on reduced motion.
const hide = poster('fallback');
function Hide() { useEffect(() => { hide(); }, []); return null; }
mount('fallback', <Stage id="fallback" how="semi-native: React Suspense + drei useProgress for loading; poster and reduced-motion check by hand"
  autoRotate={!reducedMotion()} frameloop="always"><Product /><Hide /></Stage>);
