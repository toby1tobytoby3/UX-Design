// Builds assets/product.glb once: a speaker-like product with two PBR materials and a named hotspot node.
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

const body = new THREE.Mesh(
  new THREE.LatheGeometry([[0, -1], [0.62, -1], [0.7, -0.92], [0.72, 0.7], [0.66, 0.92], [0.5, 1], [0, 1]].map(([x, y]) => new THREE.Vector2(x, y)), 96),
  new THREE.MeshStandardMaterial({ name: 'Fabric', color: '#2b2f36', roughness: 0.85, metalness: 0 }));
body.name = 'Body';
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.05, 24, 96),
  new THREE.MeshStandardMaterial({ name: 'Aluminium', color: '#c9ccd1', roughness: 0.25, metalness: 1 }));
ring.rotation.x = Math.PI / 2; ring.position.y = 1.0; ring.name = 'TopRing';
const button = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 48),
  new THREE.MeshStandardMaterial({ name: 'Accent', color: '#2a78d6', roughness: 0.4, metalness: 0.2 }));
button.position.set(0, 1.01, 0); button.name = 'Button';
const hotspot = new THREE.Object3D(); hotspot.name = 'Hotspot_Button'; hotspot.position.set(0, 1.05, 0);
const product = new THREE.Group(); product.name = 'Product'; product.add(body, ring, button, hotspot);

new GLTFExporter().parse(product, (glb) => {
  const bytes = new Uint8Array(glb); let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  window.GLB = btoa(s);
}, (e) => { window.GLB_ERR = String(e); }, { binary: true });
