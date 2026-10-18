// flexlayout-react 0.11 (sizes are weights, so 240 / 900 / 300 of the row): docking tabsets with keyboard-resizable splitters, borders and built-in pop-out buttons.
// Persistence: model.toJson() on every model change, Model.fromJson on load.
import { React, mount, title, expose, Pane, DEFAULT, load, save, PANES } from '../shared.jsx';
import { Layout, Model } from 'flexlayout-react';
import 'flexlayout-react/style/light.css';

title('flexlayout-react 0.11');
expose({ handle: '.flexlayout__splitter', model: 'dock', tab: '.flexlayout__tab_button', group: '.flexlayout__tabset_container', popout: '[aria-label*="opout" i], [title*="opout" i]' });

const tab = (id) => ({ type: 'tab', id, name: PANES[id], component: 'pane', enablePopout: true, enablePopoutIcon: true });
const json = {
  layout: { type: 'row', children: [
    { type: 'tabset', weight: DEFAULT.explorer, minWidth: DEFAULT.min, maxWidth: DEFAULT.max, children: [tab('explorer')] },
    { type: 'tabset', weight: 1440 - DEFAULT.explorer - DEFAULT.inspector, children: [tab('editor'), tab('terminal')] },
    { type: 'tabset', weight: DEFAULT.inspector, minWidth: DEFAULT.min, maxWidth: DEFAULT.max, children: [tab('inspector')] },
  ] },
};
let model; try { model = Model.fromJson(load() ?? json); } catch { model = Model.fromJson(json); }
mount(<Layout model={model} factory={(node) => <Pane id={node.getId()} />} onModelChange={(m) => save(m.toJson())} />);
