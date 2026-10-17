// React Aria Components 1.22: Adobe's accessible primitives, styled through render-prop state and data-* attributes.
import { React, mount, title, MENU_ITEMS, COUNTRIES, TABS } from '../shared.js';
import { Button, DialogTrigger, ModalOverlay, Modal, Dialog, Heading, TextField, Label, Input, Text, MenuTrigger, Menu, MenuItem,
  Popover, ComboBox, ListBox, ListBoxItem, Tabs, TabList, Tab, TabPanel } from 'react-aria-components';

title('React Aria Components 1.22');

mount('dialog', (
  <DialogTrigger>
    <Button className="btn">Rename project</Button>
    <ModalOverlay className="backdrop" isDismissable>
      <Modal>
        <Dialog className="dialog">{({ close }) => (<>
          <Heading slot="title" level={3}>Rename project</Heading>
          <TextField autoFocus><Label>Project name</Label><Input className="input" /><Text slot="description">Choose a new name.</Text></TextField>
          <div className="row"><Button className="btn" onPress={close}>Cancel</Button><Button className="btn primary" onPress={close}>Save</Button></div>
        </>)}</Dialog>
      </Modal>
    </ModalOverlay>
  </DialogTrigger>
));

mount('menu', (
  <MenuTrigger>
    <Button className="btn">Actions</Button>
    <Popover placement="bottom start">
      <Menu className="popup">{MENU_ITEMS.map((i) => <MenuItem key={i} id={i} className="item">{i}</MenuItem>)}</Menu>
    </Popover>
  </MenuTrigger>
));

mount('combobox', (
  <ComboBox className="field" defaultItems={COUNTRIES.map((c) => ({ id: c, name: c }))}>
    <Label>Country</Label>
    <Input className="input" />
    <Popover placement="bottom start">
      <ListBox className="popup">{(item) => <ListBoxItem className="item">{item.name}</ListBoxItem>}</ListBox>
    </Popover>
  </ComboBox>
));

mount('tabs', (
  <Tabs>
    <TabList aria-label="Project" className="tablist">{TABS.map(([id, label]) => <Tab key={id} id={id} className="tab">{label}</Tab>)}</TabList>
    {TABS.map(([id, , text]) => <TabPanel key={id} id={id} className="panel">{text}</TabPanel>)}
  </Tabs>
));
