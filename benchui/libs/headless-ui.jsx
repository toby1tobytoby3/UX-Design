// Headless UI 2.2 (Tailwind Labs): state exposed as data-focus / data-selected / data-open for Tailwind's data-* variants.
import { React, mount, title, MENU_ITEMS, TABS, filterCountries } from '../shared.js';
import { Button, Dialog, DialogBackdrop, DialogPanel, DialogTitle, Description, Field, Label, Input, Menu, MenuButton, MenuItems,
  MenuItem, Combobox, ComboboxInput, ComboboxOptions, ComboboxOption, TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/react';

title('Headless UI 2.2');

function Rename() {
  const [open, setOpen] = React.useState(false);
  return (<>
    <Button className="btn" onClick={() => setOpen(true)}>Rename project</Button>
    <Dialog open={open} onClose={setOpen}>
      <DialogBackdrop className="backdrop" />
      <DialogPanel className="dialog">
        <DialogTitle as="h3">Rename project</DialogTitle>
        <Field><Label>Project name</Label><Input className="input" /></Field>
        <Description>Choose a new name.</Description>
        <div className="row"><Button className="btn" onClick={() => setOpen(false)}>Cancel</Button><Button className="btn primary" onClick={() => setOpen(false)}>Save</Button></div>
      </DialogPanel>
    </Dialog>
  </>);
}
mount('dialog', <Rename />);

mount('menu', (
  <Menu>
    <MenuButton className="btn">Actions</MenuButton>
    <MenuItems anchor="bottom start" className="popup">
      {MENU_ITEMS.map((i) => <MenuItem key={i}><button className="item">{i}</button></MenuItem>)}
    </MenuItems>
  </Menu>
));

function Countries() {
  const [selected, setSelected] = React.useState(null);
  const [query, setQuery] = React.useState('');
  const matches = filterCountries(query);
  return (
    <Field className="field">
      <Label>Country</Label>
      <Combobox value={selected} onChange={setSelected} onClose={() => setQuery('')}>
        <ComboboxInput className="input" displayValue={(c) => c ?? ''} onChange={(e) => setQuery(e.target.value)} />
        <ComboboxOptions anchor="bottom start" className="popup">
          {matches.map((c) => <ComboboxOption key={c} value={c} className="item">{c}</ComboboxOption>)}
        </ComboboxOptions>
      </Combobox>
    </Field>
  );
}
mount('combobox', <Countries />);

mount('tabs', (
  <TabGroup>
    <TabList aria-label="Project" className="tablist">{TABS.map(([id, label]) => <Tab key={id} className="tab">{label}</Tab>)}</TabList>
    <TabPanels>{TABS.map(([id, , text]) => <TabPanel key={id} className="panel">{text}</TabPanel>)}</TabPanels>
  </TabGroup>
));
