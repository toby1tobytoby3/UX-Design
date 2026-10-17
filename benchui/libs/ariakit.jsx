// Ariakit 0.4: store-driven primitives, state exposed as data-active-item / aria-* attributes.
import { React, mount, title, MENU_ITEMS, TABS, filterCountries } from '../shared.js';
import * as Ariakit from '@ariakit/react';

title('Ariakit 0.4');

mount('dialog', (
  <Ariakit.DialogProvider>
    <Ariakit.DialogDisclosure className="btn">Rename project</Ariakit.DialogDisclosure>
    <Ariakit.Dialog className="dialog" backdrop={<div className="backdrop" />}>
      <Ariakit.DialogHeading render={<h3 />}>Rename project</Ariakit.DialogHeading>
      <label htmlFor="ak-name">Project name</label><input id="ak-name" className="input" />
      <Ariakit.DialogDescription>Choose a new name.</Ariakit.DialogDescription>
      <div className="row"><Ariakit.DialogDismiss className="btn">Cancel</Ariakit.DialogDismiss><Ariakit.DialogDismiss className="btn primary">Save</Ariakit.DialogDismiss></div>
    </Ariakit.Dialog>
  </Ariakit.DialogProvider>
));

mount('menu', (
  <Ariakit.MenuProvider>
    <Ariakit.MenuButton className="btn">Actions</Ariakit.MenuButton>
    <Ariakit.Menu gutter={4} className="popup">{MENU_ITEMS.map((i) => <Ariakit.MenuItem key={i} className="item">{i}</Ariakit.MenuItem>)}</Ariakit.Menu>
  </Ariakit.MenuProvider>
));

function Countries() {
  const [search, setSearch] = React.useState('');
  const matches = React.useMemo(() => filterCountries(search), [search]);
  return (
    <Ariakit.ComboboxProvider setValue={(v) => React.startTransition(() => setSearch(v))}>
      <div className="field">
        <Ariakit.ComboboxLabel>Country</Ariakit.ComboboxLabel>
        <Ariakit.Combobox className="input" />
      </div>
      <Ariakit.ComboboxPopover gutter={4} sameWidth className="popup">
        {matches.map((c) => <Ariakit.ComboboxItem key={c} value={c} className="item" />)}
        {!matches.length && <div className="item">No results</div>}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}
mount('combobox', <Countries />);

mount('tabs', (
  <Ariakit.TabProvider defaultSelectedId="overview">
    <Ariakit.TabList aria-label="Project" className="tablist">{TABS.map(([id, label]) => <Ariakit.Tab key={id} id={id} className="tab">{label}</Ariakit.Tab>)}</Ariakit.TabList>
    {TABS.map(([id, , text]) => <Ariakit.TabPanel key={id} tabId={id} className="panel">{text}</Ariakit.TabPanel>)}
  </Ariakit.TabProvider>
));
