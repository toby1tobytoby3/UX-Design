// AG Grid Community 36: only Community modules are registered (no Enterprise features).
import { React, renderBench } from '../shared.jsx';
import { useRef, useMemo, useCallback } from 'react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { data, COLUMNS, fmt } from '../data.js';

ModuleRegistry.registerModules([AllCommunityModule]);
const rows = data.map((r) => ({ ...r }));

function Grid() {
  const ref = useRef(null);
  const columnDefs = useMemo(() => COLUMNS.map((c) => ({
    field: c.id, headerName: c.title, width: c.width, sortable: true, resizable: true,
    ...(c.id === 'id' ? { pinned: 'left' } : {}),
    ...(c.id === 'status' ? { filter: 'agTextColumnFilter' } : {}),
    ...(c.id === 'amount' ? { type: 'numericColumn', editable: true, cellEditor: 'agNumberCellEditor',
      cellEditorParams: { getValidationErrors: ({ value }) => (value == null ? ['Enter a number'] : null) }, valueFormatter: (p) => fmt(p.value) } : {}),
  })), []);
  const onGridReady = useCallback(({ api }) => {
    window.__bench.api = {
      clearSelection: () => api.deselectAll(),
      getSelectedCount: () => api.getSelectedRows().length,
      getAmount: (id) => api.getRowNode(id)?.data.amount,
      hideColumn: (col) => api.setColumnsVisible([col], false),
      hideMethod: 'api.setColumnsVisible (native)',
      setStatusFilter: async (s) => {
        await api.setColumnFilterModel('status', s ? { type: 'equals', filter: s } : null);
        api.onFilterChanged();
      },
    };
  }, []);
  return (
    <div style={{ height: '100%' }}>
      <AgGridReact ref={ref} rowData={rows} columnDefs={columnDefs} getRowId={(p) => p.data.id} onGridReady={onGridReady}
        rowSelection={{ mode: 'multiRow', checkboxes: true, headerCheckbox: true, enableClickSelection: false }}
        rowHeight={36} headerHeight={38} invalidEditValueMode="block" />
    </div>
  );
}
window.__bench.notes = { filter: 'native column filter model', sort: 'native', edit: 'native agNumberCellEditor + getValidationErrors, invalidEditValueMode: block', pin: 'native pinned: left', resize: 'native drag', select: 'native multiRow + checkboxes' };
renderBench('AG Grid Community', Grid);
