// Baseline: React + the shared workspace content laid out with plain flexbox. Subtracted from every library's bundle.
import { React, mount, Pane } from './shared.jsx';
mount(<div style={{ display: 'flex', height: '100%' }}><div style={{ width: 240 }}><Pane id="explorer" /></div><div style={{ flex: 1 }}><Pane id="editor" /></div><div style={{ width: 300 }}><Pane id="inspector" /></div></div>);
