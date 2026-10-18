// react-resizable-panels 4.14: split panes with the APG window-splitter keyboard model; useDefaultLayout persists sizes.
import { React, mount, title, expose, Pane, DEFAULT } from '../shared.jsx';
import { Group, Panel, Separator, useDefaultLayout } from 'react-resizable-panels';

title('react-resizable-panels 4.14');
expose({ handle: '[role=separator]', model: 'split' });

function App() {
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({ id: 'bench', storage: localStorage });
  return (
    <Group orientation="horizontal" defaultLayout={defaultLayout} onLayoutChanged={onLayoutChanged}>
      <Panel id="explorer" defaultSize={DEFAULT.explorer} minSize={DEFAULT.min} maxSize={DEFAULT.max} collapsible><Pane id="explorer" /></Panel>
      <Separator className="sep" aria-label="Resize Explorer" />
      <Panel id="editor"><Pane id="editor" /></Panel>
      <Separator className="sep" aria-label="Resize Inspector" />
      <Panel id="inspector" defaultSize={DEFAULT.inspector} minSize={DEFAULT.min} maxSize={DEFAULT.max} collapsible><Pane id="inspector" /></Panel>
    </Group>
  );
}
mount(<App />);
