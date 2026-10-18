// allotment 1.20: VS Code's split view as React; sizes persisted through defaultSizes + onChange.
import { React, mount, title, expose, Pane, DEFAULT, load, save } from '../shared.jsx';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';

title('allotment 1.20');
expose({ handle: '.sash', model: 'split' });

function App() {
  const saved = load();
  return (
    <Allotment defaultSizes={saved ?? undefined} onChange={(s) => save(s)}>
      <Allotment.Pane preferredSize={DEFAULT.explorer} minSize={DEFAULT.min} maxSize={DEFAULT.max} snap><Pane id="explorer" /></Allotment.Pane>
      <Allotment.Pane><Pane id="editor" /></Allotment.Pane>
      <Allotment.Pane preferredSize={DEFAULT.inspector} minSize={DEFAULT.min} maxSize={DEFAULT.max} snap><Pane id="inspector" /></Allotment.Pane>
    </Allotment>
  );
}
mount(<App />);
