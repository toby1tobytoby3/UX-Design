// Babylon.js 9: full engine (scene, materials, input, GUI, inspector, physics hooks). Tree-shaken ES imports.
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color4, Color3 } from '@babylonjs/core/Maths/math.color';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator';
import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent';
import { CreateGround } from '@babylonjs/core/Meshes/Builders/groundBuilder';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { BackgroundMaterial } from '@babylonjs/core/Materials/Background/backgroundMaterial';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/loaders/glTF';
import '@babylonjs/core/Meshes/thinInstanceMesh';
import { Matrix } from '@babylonjs/core/Maths/math.vector';
import { MODEL_URL, HOTSPOT, INSTANCES, COLORS, CAMERA, GRID_CAMERA, view, size, ready, label, poster, reducedMotion } from '../scene.js';

document.getElementById('lib').textContent = 'Babylon.js 9.31';
const hex = (h) => Color3.FromHexString(h);
function stage(id, cam = CAMERA) {
  const canvas = document.createElement('canvas'); canvas.setAttribute('aria-label', 'Interactive 3D view of the speaker. Drag to rotate.'); canvas.setAttribute('role', 'img');
  view(id).append(canvas); const { width, height } = size(id); canvas.width = width; canvas.height = height;
  const engine = new Engine(canvas, true, { preserveDrawingBuffer: true }, true);
  const scene = new Scene(engine); scene.clearColor = Color4.FromHexString(COLORS.bg + 'ff');
  const [x, y, z] = cam.position; const target = new Vector3(...cam.target);
  const camera = new ArcRotateCamera('cam', 0, 0, 1, target, scene); camera.setPosition(new Vector3(x, y, -z)); camera.fov = (cam.fov * Math.PI) / 180;
  camera.attachControl(canvas, true); camera.wheelPrecision = 60;
  // No HDR environment without fetching assets, so approximate studio light with hemispheric + directional.
  new HemisphericLight('sky', new Vector3(0, 1, 0), scene).intensity = 0.9;
  const sun = new DirectionalLight('sun', new Vector3(-3, -5, 2), scene); sun.position = new Vector3(3, 5, -2); sun.intensity = 1.6;
  return { engine, scene, camera, sun, canvas };
}
async function addModel(s, shadows = true) {
  const res = await SceneLoader.ImportMeshAsync('', '', MODEL_URL, s.scene);
  if (shadows) { const sg = new ShadowGenerator(1024, s.sun); sg.useBlurExponentialShadowMap = true; sg.blurKernel = 24;
    res.meshes.forEach((m) => sg.addShadowCaster(m)); const g = CreateGround('g', { width: 20, height: 20 }, s.scene); g.position.y = -1;
    // BackgroundMaterial: ground tinted to the page colour that still receives shadows (core-only import).
    const gm = new BackgroundMaterial('gm', s.scene); gm.primaryColor = hex(COLORS.bg); gm.shadowLights = [s.sun]; gm.shadowLevel = 0.6; gm.useRGBColor = false;
    g.material = gm; g.receiveShadows = true; }
  return res;
}
const loop = (s) => s.engine.runRenderLoop(() => s.scene.render());

(async () => { const s = stage('product'); await addModel(s); loop(s); s.scene.onAfterRenderObservable.addOnce(() => ready('product', 'native: SceneLoader glTF, ArcRotateCamera, ShadowGenerator (no procedural HDR environment)')); })();

{ const s = stage('instances', GRID_CAMERA); s.camera.detachControl();
  const box = CreateBox('b', { size: 0.35 }, s.scene); const mat = new PBRMaterial('m', s.scene); mat.albedoColor = hex(COLORS.accent); mat.metallic = 0; mat.roughness = 0.5; box.material = mat;
  const side = Math.ceil(Math.sqrt(INSTANCES)); const buf = new Float32Array(16 * INSTANCES);
  for (let i = 0; i < INSTANCES; i++) { const x = (i % side) - side / 2, z = Math.floor(i / side) - side / 2;
    Matrix.Translation(x * 0.5, Math.sin(x / 3) * Math.cos(z / 3) * 1.2, z * 0.5).copyToArray(buf, i * 16); }
  box.thinInstanceSetBuffer('matrix', buf, 16); loop(s); s.scene.onAfterRenderObservable.addOnce(() => ready('instances', 'native: thin instances (1 draw call)')); }

(async () => { const s = stage('hotspot'); const res = await addModel(s); const node = res.transformNodes.concat(res.meshes).find((n) => n.name === HOTSPOT.node);
  const el = label('hotspot'); loop(s);
  s.scene.onAfterRenderObservable.add(() => { const { width, height } = size('hotspot');
    const p = Vector3.Project(node.getAbsolutePosition(), Matrix.Identity(), s.scene.getTransformMatrix(), s.camera.viewport.toGlobal(width, height));
    el.style.left = `${p.x}px`; el.style.top = `${p.y}px`; });
  s.scene.onAfterRenderObservable.addOnce(() => ready('hotspot', 'manual: Vector3.Project + DOM label (Babylon GUI linkWithMesh is the native canvas-drawn option)')); })();

(async () => { const hide = poster('fallback'); const s = stage('fallback'); await addModel(s);
  s.camera.useAutoRotationBehavior = !reducedMotion(); loop(s);
  s.scene.onAfterRenderObservable.addOnce(() => { hide(); ready('fallback', 'semi-native: built-in loading screen + autoRotation behaviour; poster and reduced-motion by hand'); }); })();
