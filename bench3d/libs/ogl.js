// OGL 1.0: a minimal WebGL layer. Loaders and controls exist; materials, lighting and shadows are your shaders.
import { Renderer, Camera, Transform, Program, Mesh, Box, Geometry, Orbit, GLTFLoader, Vec3, Color } from 'ogl';
import { MODEL_URL, HOTSPOT, INSTANCES, COLORS, CAMERA, GRID_CAMERA, view, size, ready, label, poster, reducedMotion } from '../scene.js';

document.getElementById('lib').textContent = 'OGL 1.0.11';
// Hand-written lighting: hemispheric ambient + one directional light + a cheap specular. No PBR, no environment.
const vertex = `attribute vec3 position; attribute vec3 normal; ${''}
  #ifdef INSTANCED
  attribute vec3 offset;
  #endif
  uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix; uniform mat3 normalMatrix; varying vec3 vN; varying vec3 vV;
  void main() { vec3 p = position;
  #ifdef INSTANCED
  p += offset;
  #endif
  vec4 mv = modelViewMatrix * vec4(p, 1.0); vN = normalize(normalMatrix * normal); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`;
const fragment = `precision highp float; uniform vec3 uColor; uniform float uRough; varying vec3 vN; varying vec3 vV;
  void main() { vec3 n = normalize(vN); vec3 l = normalize(vec3(0.5, 0.8, 0.4)); float d = max(dot(n, l), 0.0);
    vec3 h = normalize(l + normalize(vV)); float s = pow(max(dot(n, h), 0.0), mix(80.0, 8.0, uRough)) * (1.0 - uRough);
    vec3 amb = mix(vec3(0.42), vec3(0.75), n.y * 0.5 + 0.5); vec3 c = uColor * (amb + d * 0.7) + s * 0.6;
    gl_FragColor = vec4(pow(c, vec3(1.0 / 2.2)), 1.0); }`;  // glTF colours are linear: convert to sRGB yourself
const program = (gl, color, rough = 0.6, instanced = false) => new Program(gl, { vertex: (instanced ? '#define INSTANCED\n' : '') + vertex, fragment,
  uniforms: { uColor: { value: typeof color === 'string' ? new Color(color).map((v) => v ** 2.2) : new Color(color) }, uRough: { value: rough } } });

function stage(id, cam = CAMERA, controls = true) {
  const { width, height } = size(id);
  const renderer = new Renderer({ dpr: Math.min(devicePixelRatio, 2), antialias: true, width, height });
  const gl = renderer.gl; gl.clearColor(...new Color(COLORS.bg), 1);
  gl.canvas.setAttribute('role', 'img'); gl.canvas.setAttribute('aria-label', 'Interactive 3D view of the speaker. Drag to rotate.');
  view(id).append(gl.canvas);
  const camera = new Camera(gl, { fov: cam.fov, aspect: width / height }); camera.position.set(...cam.position); camera.lookAt(cam.target);
  const orbit = controls ? new Orbit(camera, { target: new Vec3(...cam.target), element: gl.canvas }) : null;
  return { renderer, gl, camera, orbit, scene: new Transform() };
}
async function addModel(s) {
  const gltf = await GLTFLoader.load(s.gl, MODEL_URL);
  const root = gltf.scene[0] ?? gltf.scene; root.setParent?.(s.scene); (gltf.scene.length ? gltf.scene : [root]).forEach((r) => r.setParent(s.scene));
  s.scene.traverse((node) => { if (node.program?.gltfMaterial) { const m = node.program.gltfMaterial;
    const [r, g, b] = m.baseColorFactor; node.program = program(s.gl, [r, g, b], m.roughnessFactor ?? 0.6); } });
  return gltf;
}
const loop = (s, each) => { const f = () => { requestAnimationFrame(f); s.orbit?.update(); each?.(); s.renderer.render({ scene: s.scene, camera: s.camera }); }; f(); };

(async () => { const s = stage('product'); await addModel(s); loop(s); requestAnimationFrame(() => ready('product', 'semi-native: GLTFLoader + Orbit; lighting/material shader hand-written, no shadow, no PBR')); })();

{ const s = stage('instances', GRID_CAMERA, false); const box = new Box(s.gl, { width: 0.35, height: 0.35, depth: 0.35 });
  const side = Math.ceil(Math.sqrt(INSTANCES)); const offset = new Float32Array(INSTANCES * 3);
  for (let i = 0; i < INSTANCES; i++) { const x = (i % side) - side / 2, z = Math.floor(i / side) - side / 2;
    offset.set([x * 0.5, Math.sin(x / 3) * Math.cos(z / 3) * 1.2, z * 0.5], i * 3); }
  const geo = new Geometry(s.gl, { ...box.attributes, offset: { instanced: 1, size: 3, data: offset } });
  new Mesh(s.gl, { geometry: geo, program: program(s.gl, COLORS.accent, 0.5, true) }).setParent(s.scene);
  s.renderer.render({ scene: s.scene, camera: s.camera }); ready('instances', 'native: instanced attributes (1 draw call), custom shader'); }

(async () => { const s = stage('hotspot'); await addModel(s); let node; s.scene.traverse((n) => { if (n.name === HOTSPOT.node) node = n; });
  const el = label('hotspot'); const v = new Vec3();
  loop(s, () => { node.updateMatrixWorld(); v.set(node.worldMatrix[12], node.worldMatrix[13], node.worldMatrix[14]); s.camera.project(v);
    const { width, height } = size('hotspot'); el.style.left = `${(v.x + 1) / 2 * width}px`; el.style.top = `${(1 - v.y) / 2 * height}px`; });
  requestAnimationFrame(() => ready('hotspot', 'manual: camera.project + DOM label')); })();

(async () => { const hide = poster('fallback'); const s = stage('fallback'); await addModel(s); let a = 0;
  loop(s, () => { if (!reducedMotion()) { a += 0.004; s.scene.rotation.y = a; } }); hide();
  requestAnimationFrame(() => ready('fallback', 'manual: poster, loading state and reduced-motion check all hand-built')); })();
