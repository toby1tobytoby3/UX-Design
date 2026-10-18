// react-data-grid 7 (adazzle): data-driven grid. Sorting and filtering state are native, the row computation is ours
// (the documented pattern); selection, frozen columns, resizing, keyboard navigation and editors are built in.
import { React, renderBench } from '../shared.jsx';
import { useState, useMemo, useEffect } from 'react';
import { DataGrid, SelectColumn, renderTextEditor } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import { data, COLUMNS, fmt } from '../data.js';

function Grid() {
  const [rows, setRows] = useState(() => data.map((r) => ({ ...r })));
  const [sortColumns, setSortColumns] = useState([]);
  const [status, setStatus] = useState('');
  const [hidden, setHidden] = useState([]);
  const [selected, setSelected] = useState(() => new Set());
  const columns = useMemo(() => [
    { ...SelectColumn, frozen: true },
    ...COLUMNS.filter((c) => !hidden.includes(c.id)).map((c) => ({
      key: c.id, name: c.title, width: c.width, sortable: true, resizable: true,
      ...(c.id === 'id' ? { frozen: true } : {}),
      ...(c.id === 'amount' ? { renderCell: ({ row }) => fmt(row.amount), renderEditCell: renderTextEditor, cellClass: 'num' } : {}),
      ...(c.id === 'flagged' ? { renderCell: ({ row }) => (row.flagged ? 'Yes' : 'No') } : {}),
    })),
  ], [hidden]);
  const view = useMemo(() => {
    let out = status ? rows.filter((r) => r.status === status) : rows;
    if (sortColumns.length) {
      out = [...out].sort((a, b) => {
        for (const { columnKey: k, direction } of sortColumns) {
          const d = (a[k] < b[k] ? -1 : a[k] > b[k] ? 1 : 0) * (direction === 'ASC' ? 1 : -1);
          if (d) return d;
        }
        return 0;
      });
    }
    return out;
  }, [rows, status, sortColumns]);
  useEffect(() => {
    window.__bench.api = {
      getSelectedCount: () => window.__bench._sel.size,
      getAmount: (id) => window.__bench._rows.find((r) => r.id === id)?.amount,
      hideColumn: (col) => setHidden((h) => [...h, col]),
      hideMethod: 'columns prop (no visibility API)',
      setStatusFilter: setStatus,
      sortCount: () => window.__bench._sort.length, // aria-sort is dropped once more than one column is sorted
    };
  }, []);
  window.__bench._sel = selected; window.__bench._rows = rows; window.__bench._sort = sortColumns;
  return (
    <DataGrid className="rdg-light" style={{ height: '100%' }} columns={columns} rows={view} rowKeyGetter={(r) => r.id} rowHeight={36}
      sortColumns={sortColumns} onSortColumnsChange={setSortColumns} selectedRows={selected} onSelectedRowsChange={setSelected}
      onRowsChange={(next, { indexes }) => setRows((all) => {
        const byId = new Map(indexes.map((i) => [next[i].id, { ...next[i], amount: Number(next[i].amount) }]));
        return all.map((r) => byId.get(r.id) ?? r);
      })} aria-label="Invoices" />
  );
}
window.__bench.notes = { filter: 'app-side filter (no filter API)', sort: 'native sort state, app sorts rows', edit: 'native text editor (no number editor)', pin: 'native frozen columns', resize: 'native drag', select: 'native SelectColumn' };
renderBench('react-data-grid', Grid);
