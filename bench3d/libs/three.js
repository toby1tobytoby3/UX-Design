// three.js r186, vanilla. Everything is explicit: renderer, scene, camera, loop.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { MODEL_URL, HOTSPOT, INSTANCES, COLORS, CAMERA, GRID_CAMERA, view, size, ready, label, poster, reducedMotion } from '../scene.js';

document.getElementById('lib').textContent = 'three.js r186';
const loader = new GLTFLoader();
const model = loader.loadAsync(MODEL_URL);

function stage(id, { controls = true, shadow = true } = {}) {
  const { width, height } = size(id);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));            // cap DPR: biggest cheap perf win
  renderer.setSize(width, height, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = shadow;
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.setAttribute('aria-label', 'Interactive 3D view of the speaker. Drag to rotate.');
  view(id).append(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLORS.bg);
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture; // procedural studio light
  const camera = new THREE.PerspectiveCamera(CAMERA.fov, width / height, 0.1, 100);
  camera.position.set(...CAMERA.position);
  const orbit = controls ? new OrbitControls(camera, renderer.domElement) : null;
  if (orbit) { orbit.target.set(...CAMERA.target); orbit.enableDamping = true; orbit.update(); }
  else camera.lookAt(...CAMERA.target);
  const sun = new THREE.DirectionalLight('#ffffff', 1.4);
  sun.position.set(3, 5, 2); sun.castShadow = shadow; sun.shadow.mapSize.set(1024, 1024); sun.shadow.radius = 6;
  scene.add(sun);
  if (shadow) { const g = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ opacity: 0.18 }));
    g.rotation.x = -Math.PI / 2; g.position.y = -1; g.receiveShadow = true; scene.add(g); }
  return { renderer, scene, camera, orbit };
}
const addModel = async (scene) => { const gltf = await model; const m = gltf.scene.clone(true);
  m.traverse((o) => { if (o.isMesh) { o.castShadow = true; } }); scene.add(m); return m; };

// 1. Product viewer: render on demand (only when the camera moves), not every frame.
(async () => { const s = stage('product'); await addModel(s.scene);
  const draw = () => s.renderer.render(s.scene, s.camera);
  s.orbit.addEventListener('change', draw); draw(); ready('product', 'native: GLTFLoader, OrbitControls, RoomEnvironment, shadow maps'); })();

// 2. 2,000 instances: one draw call via InstancedMesh.
{ const s = stage('instances', { controls: false, shadow: false });
  s.camera.position.set(...GRID_CAMERA.position); s.camera.lookAt(...GRID_CAMERA.target);
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), new THREE.MeshStandardMaterial({ color: COLORS.accent, roughness: 0.5 }), INSTANCES);
  const m = new THREE.Matrix4(); const side = Math.ceil(Math.sqrt(INSTANCES));
  for (let i = 0; i < INSTANCES; i++) { const x = (i % side) - side / 2, z = Math.floor(i / side) - side / 2;
    m.setPosition(x * 0.5, Math.sin(x / 3) * Math.cos(z / 3) * 1.2, z * 0.5); mesh.setMatrixAt(i, m); }
  s.scene.add(mesh); s.renderer.render(s.scene, s.camera); ready('instances', 'native: InstancedMesh (1 draw call)'); }

// 3. Hotspot: project the named node to screen space each frame and move a DOM label there.
(async () => { const s = stage('hotspot'); const m = await addModel(s.scene); const node = m.getObjectByName(HOTSPOT.node);
  const el = label('hotspot'); const v = new THREE.Vector3();
  const draw = () => { s.renderer.render(s.scene, s.camera); node.getWorldPosition(v).project(s.camera);
    const { width, height } = size('hotspot'); el.style.left = `${(v.x + 1) / 2 * width}px`; el.style.top = `${(1 - v.y) / 2 * height}px`; };
  s.orbit.addEventListener('change', draw); draw(); ready('hotspot', 'manual: project() + DOM label (CSS2DRenderer add-on also available)'); })();

// 4. Poster until loaded; auto-rotate only without reduced motion.
(async () => { const hide = poster('fallback'); const s = stage('fallback'); await addModel(s.scene);
  s.orbit.autoRotate = !reducedMotion(); s.orbit.autoRotateSpeed = 1.5;
  s.renderer.setAnimationLoop(() => { s.orbit.update(); s.renderer.render(s.scene, s.camera); });
  hide(); ready('fallback', 'manual: own poster element; LoadingManager for progress; reduced motion checked by hand'); })();
