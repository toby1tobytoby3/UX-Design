// TanStack Table v9 (headless) + TanStack Virtual, rendered as a shadcn-style table. Table owns sorting, filtering,
// selection, sizing, pinning and visibility state; the markup, sticky CSS, resize handles and keyboard behaviour are
// ours, as the library intends. No editing API: the amount editor is the documented "editable cell" pattern, hand-built.
import { React, renderBench } from '../shared.jsx';
import { useState, useEffect, useRef } from 'react';
import {
  useTable, tableFeatures, createColumnHelper, rowSortingFeature, createSortedRowModel, sortFn_alphanumeric, sortFn_basic,
  columnFilteringFeature, createFilteredRowModel, filterFn_equals, rowSelectionFeature, columnSizingFeature,
  columnResizingFeature, columnPinningFeature, columnVisibilityFeature,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { data, COLUMNS, fmt } from '../data.js';

const features = tableFeatures({
  rowSortingFeature, sortedRowModel: createSortedRowModel(), sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic },
  columnFilteringFeature, filteredRowModel: createFilteredRowModel(), filterFns: { equals: filterFn_equals },
  rowSelectionFeature, columnSizingFeature, columnResizingFeature, columnPinningFeature, columnVisibilityFeature,
});
const helper = createColumnHelper();

function EditableAmount({ row, table }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const amount = row.original.amount;
  const start = () => { setDraft(String(amount)); setError(''); setEditing(true); };
  if (!editing) {
    return <span tabIndex={0} className="amount-cell" style={{ width: '100%', textAlign: 'right' }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'F2') { e.preventDefault(); start(); } }} onDoubleClick={start}>{fmt(amount)}</span>;
  }
  return (
    <span style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <input autoFocus onFocus={(e) => e.target.select()} className="cell-edit" aria-label="Amount" inputMode="decimal" value={draft} aria-invalid={!!error}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Tab') {
            const n = Number(draft);
            if (draft.trim() === '' || Number.isNaN(n)) { e.preventDefault(); setError('Enter a number'); return; }
            table.options.meta.update(row.id, n); setEditing(false);
          } else if (e.key === 'Escape') setEditing(false);
        }} />
      {error && <span role="alert" style={{ color: '#b42318', fontSize: 11 }}>{error}</span>}
    </span>
  );
}

const columns = helper.columns([
  helper.display({ id: 'select', size: 44, enableResizing: false,
    header: ({ table }) => <input type="checkbox" aria-label="Select all rows" checked={table.getIsAllRowsSelected()} onChange={table.getToggleAllRowsSelectedHandler()} />,
    cell: ({ row }) => <input type="checkbox" aria-label={`Select ${row.id}`} checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} /> }),
  ...COLUMNS.map((c) => helper.accessor(c.id, {
    header: c.title, size: c.width,
    ...(c.id === 'status' ? { filterFn: 'equals' } : {}),
    ...(c.id === 'amount' ? { sortFn: 'basic', cell: (ctx) => <EditableAmount row={ctx.row} table={ctx.table} /> } : {}),
    ...(c.id === 'flagged' ? { cell: (ctx) => (ctx.getValue() ? 'Yes' : 'No') } : {}),
  })),
]);

function Grid() {
  const [rows, setRows] = useState(() => data.map((r) => ({ ...r })));
  const table = useTable({
    features, columns, data: rows, getRowId: (r) => r.id, columnResizeMode: 'onChange',
    initialState: { columnPinning: { start: ['select', 'id'], end: [] } },
    meta: { update: (id, n) => setRows((all) => all.map((r) => (r.id === id ? { ...r, amount: n } : r))) },
  });
  const scrollRef = useRef(null);
  const tableRows = table.getRowModel().rows;
  const virtualizer = useVirtualizer({ count: tableRows.length, getScrollElement: () => scrollRef.current, estimateSize: () => 36, overscan: 8 });
  useEffect(() => {
    window.__bench.api = {
      clearSelection: () => table.toggleAllRowsSelected(false),
      getSelectedCount: () => Object.keys(table.state.rowSelection ?? table.atoms.rowSelection.get()).length,
      getAmount: (id) => window.__bench._rows.find((r) => r.id === id)?.amount,
      hideColumn: (col) => table.getColumn(col).toggleVisibility(false),
      hideMethod: 'column.toggleVisibility (native)',
      setStatusFilter: (s) => table.getColumn('status').setFilterValue(s || undefined),
    };
  }, [table]);
  window.__bench._rows = rows;
  const pinStyle = (column) => column.getIsPinned() === 'start'
    ? { position: 'sticky', left: column.getStart('start'), zIndex: 1, ...(column.getIsLastColumn?.('start') ? { boxShadow: 'inset -1px 0 #e4e4e7' } : {}) } : {};
  return (
    <div className="tbl" ref={scrollRef}>
      <table aria-label="Invoices" aria-rowcount={tableRows.length + 1} style={{ width: table.getTotalSize() }}>
        <thead>
          {table.getHeaderGroups().map((g) => (
            <tr key={g.id} aria-rowindex={1}>
              {g.headers.map((h) => (
                <th key={h.id} className={h.column.id === 'amount' ? 'num' : undefined} style={{ width: h.getSize(), ...pinStyle(h.column), ...(h.column.getIsPinned() ? { zIndex: 3 } : {}) }}
                  aria-sort={{ asc: 'ascending', desc: 'descending' }[h.column.getIsSorted()] ?? undefined}>
                  {h.column.getCanSort() ? <button className="sort" onClick={h.column.getToggleSortingHandler()}>{h.isPlaceholder ? null : <table.FlexRender header={h} />}{{ asc: ' ▲', desc: ' ▼' }[h.column.getIsSorted()] ?? ''}</button>
                    : <table.FlexRender header={h} />}
                  {h.column.getCanResize() && <div className="resizer" onMouseDown={h.getResizeHandler()} onTouchStart={h.getResizeHandler()} />}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody style={{ height: virtualizer.getTotalSize() }}>
          {virtualizer.getVirtualItems().map((vi) => {
            const row = tableRows[vi.index];
            return (
              <tr key={row.id} aria-rowindex={vi.index + 2} aria-selected={row.getIsSelected()} data-selected={row.getIsSelected() || undefined}
                style={{ position: 'absolute', transform: `translateY(${vi.start}px)` }}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={cell.column.id === 'amount' ? 'num' : undefined} style={{ width: cell.column.getSize(), ...pinStyle(cell.column) }}>
                    <table.FlexRender cell={cell} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
window.__bench.notes = { filter: 'native column filter (filterFn equals)', sort: 'native', edit: 'hand-built (documented editable-cell pattern)', pin: 'native pinning state + our sticky CSS', resize: 'native resize handler + our handle', select: 'native row selection + our checkboxes' };
renderBench('TanStack Table v9', Grid);
