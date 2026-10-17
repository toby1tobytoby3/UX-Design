// Base UI 1.9 (from the Radix, Floating UI and Material UI teams): parts + render prop, state as data-* attributes.
import { React, mount, title, MENU_ITEMS, COUNTRIES, TABS } from '../shared.js';
import { Dialog } from '@base-ui/react/dialog';
import { Menu } from '@base-ui/react/menu';
import { Combobox } from '@base-ui/react/combobox';
import { Tabs } from '@base-ui/react/tabs';

title('Base UI 1.9');

mount('dialog', (
  <Dialog.Root>
    <Dialog.Trigger className="btn">Rename project</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Backdrop className="backdrop" />
      <Dialog.Popup className="dialog">
        <Dialog.Title render={<h3 />}>Rename project</Dialog.Title>
        <label htmlFor="bu-name">Project name</label><input id="bu-name" className="input" />
        <Dialog.Description>Choose a new name.</Dialog.Description>
        <div className="row"><Dialog.Close className="btn">Cancel</Dialog.Close><Dialog.Close className="btn primary">Save</Dialog.Close></div>
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
));

mount('menu', (
  <Menu.Root>
    <Menu.Trigger className="btn">Actions</Menu.Trigger>
    <Menu.Portal>
      <Menu.Positioner sideOffset={4} align="start">
        <Menu.Popup className="popup">{MENU_ITEMS.map((i) => <Menu.Item key={i} className="item">{i}</Menu.Item>)}</Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
));

mount('combobox', (
  <Combobox.Root items={COUNTRIES}>
    <div className="field">
      {/* Combobox.Label only labels a Combobox.Trigger; with an input, Base UI asks for a native label. */}
      <label htmlFor="bu-country">Country</label>
      <Combobox.Input id="bu-country" className="input" />
    </div>
    <Combobox.Portal>
      <Combobox.Positioner sideOffset={4} align="start">
        <Combobox.Popup className="popup">
          <Combobox.Empty>No results</Combobox.Empty>
          <Combobox.List>{(c) => <Combobox.Item key={c} value={c} className="item">{c}</Combobox.Item>}</Combobox.List>
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Portal>
  </Combobox.Root>
));

mount('tabs', (
  <Tabs.Root defaultValue="overview">
    <Tabs.List aria-label="Project" className="tablist">{TABS.map(([id, label]) => <Tabs.Tab key={id} value={id} className="tab">{label}</Tabs.Tab>)}</Tabs.List>
    {TABS.map(([id, , text]) => <Tabs.Panel key={id} value={id} className="panel">{text}</Tabs.Panel>)}
  </Tabs.Root>
));
