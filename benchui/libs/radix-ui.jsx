// Radix Primitives (unified radix-ui 1.8): unstyled parts, state exposed as data-state / data-highlighted.
import { React, mount, na, title, MENU_ITEMS, TABS } from '../shared.js';
import { Dialog, DropdownMenu, Tabs } from 'radix-ui';

title('Radix Primitives (radix-ui 1.8)');

mount('dialog', (
  <Dialog.Root>
    <Dialog.Trigger className="btn">Rename project</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="backdrop" />
      <Dialog.Content className="dialog">
        <Dialog.Title asChild><h3>Rename project</h3></Dialog.Title>
        <label htmlFor="rx-name">Project name</label><input id="rx-name" className="input" />
        <Dialog.Description>Choose a new name.</Dialog.Description>
        <div className="row"><Dialog.Close className="btn">Cancel</Dialog.Close><Dialog.Close className="btn primary">Save</Dialog.Close></div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
));

mount('menu', (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger className="btn">Actions</DropdownMenu.Trigger>
    <DropdownMenu.Portal>
      <DropdownMenu.Content className="popup" align="start" sideOffset={4}>
        {MENU_ITEMS.map((i) => <DropdownMenu.Item key={i} className="item">{i}</DropdownMenu.Item>)}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
));

na('combobox', 'Radix has no combobox: Select has no text filtering. Pair it with cmdk or another library.');

mount('tabs', (
  <Tabs.Root defaultValue="overview">
    <Tabs.List aria-label="Project" className="tablist">{TABS.map(([id, label]) => <Tabs.Trigger key={id} value={id} className="tab">{label}</Tabs.Trigger>)}</Tabs.List>
    {TABS.map(([id, , text]) => <Tabs.Content key={id} value={id} className="panel">{text}</Tabs.Content>)}
  </Tabs.Root>
));
