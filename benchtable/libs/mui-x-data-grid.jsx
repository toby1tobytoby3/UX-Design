// MUI X DataGrid (MIT edition). Pinning is Pro-only and page size is capped at 100 rows in the MIT version.
import { React, renderBench } from '../shared.jsx';
import { useState, useMemo, useEffect } from 'react';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import { data, COLUMNS, fmt } from '../data.js';

function Grid() {
  const apiRef = useGridApiRef();
  const [rows, setRows] = useState(() => data.map((r) => ({ ...r })));
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [selection, setSelection] = useState({ type: 'include', ids: new Set() });
  const columns = useMemo(() => COLUMNS.map((c) => ({
    field: c.id, headerName: c.title, width: c.width,
    ...(c.id === 'amount' ? { type: 'number', editable: true, valueFormatter: (v) => fmt(v),
      preProcessEditCellProps: ({ props }) => ({ ...props, error: props.value == null || Number.isNaN(props.value) }) } : {}),
    ...(c.id === 'flagged' ? { type: 'boolean' } : {}),
  })), []);
  useEffect(() => {
    window.__bench.api = {
      getSelectedCount: () => apiRef.current.getSelectedRows().size,
      getAmount: (id) => apiRef.current.getRow(id)?.amount,
      hideColumn: (col) => apiRef.current.setColumnVisibility(col, false),
      hideMethod: 'apiRef.setColumnVisibility (native)',
      setStatusFilter: (s) => setFilterModel({ items: s ? [{ field: 'status', operator: 'equals', value: s }] : [] }),
    };
  }, [apiRef]);
  return (
    <div style={{ height: '100%' }}>
      <DataGrid apiRef={apiRef} rows={rows} columns={columns} rowHeight={36} checkboxSelection disableRowSelectionOnClick
        rowSelectionModel={selection} onRowSelectionModelChange={setSelection}
        filterModel={filterModel} onFilterModelChange={setFilterModel}
        initialState={{ pagination: { paginationModel: { pageSize: 100 } } }} pageSizeOptions={[100]}
        processRowUpdate={(row) => { setRows((rs) => rs.map((r) => (r.id === row.id ? row : r))); return row; }}
        onProcessRowUpdateError={() => {}} />
    </div>
  );
}
window.__bench.notes = { filter: 'native filterModel', sort: 'native', edit: 'native (type number) + preProcessEditCellProps validation; Enter within ~200 ms of the last keystroke is ignored while validation runs', pin: 'Pro only (not in MIT)', resize: 'native drag', select: 'native checkboxSelection', rows: 'MIT edition caps page size at 100: 10,000 rows are paginated' };
renderBench('MUI X DataGrid (MIT)', Grid);
