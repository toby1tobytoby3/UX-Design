// <model-viewer> 4.4 (Google): a web component for "show this product in 3D". HTML attributes, not code.
import '@google/model-viewer';
import { MODEL_URL, HOTSPOT, COLORS, CAMERA, POSTER, view, ready, unsupported, reducedMotion } from '../scene.js';

document.getElementById('lib').textContent = '<model-viewer> 4.4';
const [x, y, z] = CAMERA.position;
const orbit = `${Math.round((Math.atan2(x, z) * 180) / Math.PI)}deg ${Math.round((Math.acos(y / Math.hypot(x, y, z)) * 180) / Math.PI)}deg ${Math.hypot(x, y, z).toFixed(2)}m`;
function mv(id, attrs, inner = '') {
  view(id).innerHTML = `<model-viewer src="${MODEL_URL}" alt="Speaker product, interactive 3D view" camera-controls
    environment-image="neutral" shadow-intensity="1" shadow-softness="0.8" exposure="1" camera-orbit="${orbit}"
    field-of-view="${CAMERA.fov}deg" interaction-prompt="none" max-camera-orbit="auto auto 10m" camera-target="0m 0.1m 0m" style="background-color:${COLORS.bg}" ${attrs}>${inner}</model-viewer>`;
  const el = view(id).querySelector('model-viewer');
  el.addEventListener('load', () => requestAnimationFrame(() => requestAnimationFrame(() => ready(id, el.dataset.how))), { once: true });
  return el;
}
mv('product', '').dataset.how = 'native: one HTML element (glTF, PBR, neutral environment, soft shadow, orbit, keyboard)';
unsupported('instances', '&lt;model-viewer&gt; shows one model; there is no scene graph or instancing API.');
// Hotspots are slotted HTML with a 3D position (and optional surface normal for occlusion).
mv('hotspot', '', `<button slot="hotspot-power" class="hotspot" style="position:relative;transform:translate(-8px,-50%);border:0;font:inherit"
  data-position="0m 1.05m 0m" data-normal="0m 1m 0m" data-visibility-attribute="visible"><span></span>${HOTSPOT.label}</button>`)
  .dataset.how = 'native: slotted hotspot elements with data-position (focusable buttons)';
// Poster is an attribute; auto-rotate gated on reduced motion here (attribute is opt-in).
mv('fallback', `poster="${POSTER}" reveal="auto" ${reducedMotion() ? '' : 'auto-rotate rotation-per-second="20deg"'}`)
  .dataset.how = 'native: poster + reveal attributes, built-in progress bar; reduced motion: auto-rotate is opt-in';
