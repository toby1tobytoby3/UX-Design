// React Aria Components Table + Virtualizer (TableLayout) + ResizableTableContainer. Sorting state is native and the
// rows are sorted by the app (documented pattern). No column pinning or cell editing API: editing below is hand-built.
import { React, renderBench } from '../shared.jsx';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Table, TableHeader, TableBody, Column, Row, Cell, Checkbox, ResizableTableContainer, ColumnResizer, Virtualizer, TableLayout } from 'react-aria-components';
import { data, COLUMNS, fmt } from '../data.js';

const Check = (props) => (
  <Checkbox {...props} style={{ display: 'flex' }}>
    {({ isSelected, isIndeterminate }) => <span aria-hidden style={{ width: 14, height: 14, border: '1px solid #a1a1aa', borderRadius: 3, background: isSelected || isIndeterminate ? '#2a78d6' : '#fff' }} />}
  </Checkbox>
);

function AmountCell({ row, editing, setEditing, commit }) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const ref = useRef(null);
  useEffect(() => { if (editing) { setDraft(String(row.amount)); setError(''); requestAnimationFrame(() => ref.current?.select()); } }, [editing]);
  if (!editing) return fmt(row.amount);
  return (
    <span style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <input ref={ref} className="cell-edit" aria-label="Amount" inputMode="decimal" value={draft} aria-invalid={!!error}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          e.stopPropagation(); // keep the grid's own keyboard handling out of the input
          if (e.key === 'Enter' || e.key === 'Tab') {
            const n = Number(draft);
            if (draft.trim() === '' || Number.isNaN(n)) { e.preventDefault(); setError('Enter a number'); return; }
            commit(row.id, n); setEditing(null);
          } else if (e.key === 'Escape') { setEditing(null); }
        }} />
      {error && <span role="alert" style={{ color: '#b42318', fontSize: 11 }}>{error}</span>}
    </span>
  );
}

function Grid() {
  const [rows, setRows] = useState(() => data.map((r) => ({ ...r })));
  const [sort, setSort] = useState(null);
  const [status, setStatus] = useState('');
  const [hidden, setHidden] = useState([]);
  const [selected, setSelected] = useState(() => new Set());
  const [editing, setEditing] = useState(null);
  const cols = COLUMNS.filter((c) => !hidden.includes(c.id));
  const view = useMemo(() => {
    let out = status ? rows.filter((r) => r.status === status) : rows;
    if (sort) out = [...out].sort((a, b) => (a[sort.column] < b[sort.column] ? -1 : a[sort.column] > b[sort.column] ? 1 : 0) * (sort.direction === 'ascending' ? 1 : -1));
    return out;
  }, [rows, status, sort]);
  useEffect(() => {
    window.__bench.api = {
      getSelectedCount: () => (window.__bench._sel === 'all' ? window.__bench._n : window.__bench._sel.size),
      getAmount: (id) => window.__bench._rows.find((r) => r.id === id)?.amount,
      hideColumn: (col) => setHidden((h) => [...h, col]),
      hideMethod: 'columns prop (no visibility API)',
      setStatusFilter: setStatus,
    };
  }, []);
  window.__bench._sel = selected; window.__bench._rows = rows; window.__bench._n = view.length;
  const commit = (id, n) => setRows((all) => all.map((r) => (r.id === id ? { ...r, amount: n } : r)));
  return (
    <ResizableTableContainer className="tbl rac-table">
      <Virtualizer layout={TableLayout} layoutOptions={{ rowHeight: 36, headingHeight: 38 }}>
        <Table aria-label="Invoices" selectionMode="multiple" selectedKeys={selected} onSelectionChange={setSelected}
          sortDescriptor={sort ?? undefined} onSortChange={setSort}
          onKeyDownCapture={(e) => {
            const cell = e.target.closest?.('[data-col="amount"]');
            if (cell && (e.key === 'Enter' || e.key === 'F2') && !editing) { e.preventDefault(); e.stopPropagation(); setEditing(cell.dataset.row); }
          }}>
          <TableHeader>
            <Column width={44} minWidth={44}><Check slot="selection" /></Column>
            {cols.map((c) => (
              <Column key={c.id} id={c.id} isRowHeader={c.id === 'id'} allowsSorting defaultWidth={c.width}>
                {({ sortDirection }) => (
                  <span style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <span style={{ flex: 1 }}>{c.title}</span>{sortDirection && (sortDirection === 'ascending' ? '▲' : '▼')}
                    <ColumnResizer className="resizer" aria-label={`Resize ${c.title}`} />
                  </span>
                )}
              </Column>
            ))}
          </TableHeader>
          <TableBody items={view} dependencies={[cols, editing]}>
            {(row) => (
              <Row id={row.id}>
                <Cell><Check slot="selection" /></Cell>
                {cols.map((c) => (
                  <Cell key={c.id} data-col={c.id} data-row={row.id} className={c.id === 'amount' ? 'num' : undefined}>
                    {c.id === 'amount' ? <AmountCell row={row} editing={editing === row.id} setEditing={setEditing} commit={commit} />
                      : c.id === 'flagged' ? (row.flagged ? 'Yes' : 'No') : row[c.id]}
                  </Cell>
                ))}
              </Row>
            )}
          </TableBody>
        </Table>
      </Virtualizer>
    </ResizableTableContainer>
  );
}
window.__bench.notes = { filter: 'app-side filter (no filter API)', sort: 'native sort state, app sorts rows', edit: 'hand-built (no editing API)', pin: 'not available', resize: 'native ColumnResizer (drag and keyboard)', select: 'native selectionMode multiple' };
renderBench('React Aria Table', Grid);
