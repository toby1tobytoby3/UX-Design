// dockview 8.6 (free dockview-react only, no enterprise modules): dockable tab groups, floating groups and pop-outs.
// Persistence: toJSON on every layout change, fromJSON on load (falls back to the default layout if it throws).
import { React, mount, title, expose, Pane, DEFAULT, load, save, PANES } from '../shared.jsx';
import { DockviewReact, themeLight } from 'dockview-react';
import 'dockview-react/dist/styles/dockview.css';

title('dockview 8.6 (free)');
expose({ handle: '.dv-sash', model: 'dock', tab: '.dv-tab', group: '.dv-groupview', popout: '.bench-popout' });

const components = { pane: ({ params }) => <Pane id={params.id} /> };
// The free core has pop-outs but no built-in button for them: a header action calling the documented API.
const PopoutAction = ({ containerApi, group }) => (
  <button className="bench-popout" aria-label="Pop out group" onClick={() => containerApi.addPopoutGroup(group, { popoutUrl: '/popout.html' })}>⧉</button>
);

function defaultLayout(api) {
  api.addPanel({ id: 'editor', component: 'pane', title: PANES.editor, params: { id: 'editor' } });
  api.addPanel({ id: 'terminal', component: 'pane', title: PANES.terminal, params: { id: 'terminal' }, position: { referencePanel: 'editor', direction: 'within' }, inactive: true });
  api.addPanel({ id: 'explorer', component: 'pane', title: PANES.explorer, params: { id: 'explorer' }, position: { referencePanel: 'editor', direction: 'left' }, initialWidth: DEFAULT.explorer, minimumWidth: DEFAULT.min, maximumWidth: DEFAULT.max });
  api.addPanel({ id: 'inspector', component: 'pane', title: PANES.inspector, params: { id: 'inspector' }, position: { referencePanel: 'editor', direction: 'right' }, initialWidth: DEFAULT.inspector, minimumWidth: DEFAULT.min, maximumWidth: DEFAULT.max });
}

function onReady({ api }) {
  const saved = load();
  try { if (saved) api.fromJSON(saved); else defaultLayout(api); } catch { api.clear(); defaultLayout(api); }
  api.onDidLayoutChange(() => save(api.toJSON()));
}
mount(<DockviewReact theme={themeLight} components={components} onReady={onReady} rightHeaderActionsComponent={PopoutAction} />);
