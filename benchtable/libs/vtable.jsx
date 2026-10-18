// VisActor VTable (canvas grid) via @visactor/react-vtable. Everything is drawn on a canvas, so the runner's probes use
// VTable's own API (cell rects and values) instead of the DOM. Editors come from @visactor/vtable-editors.
import { React, renderBench } from '../shared.jsx';
import { ListTable } from '@visactor/react-vtable';
import * as VTable from '@visactor/vtable';
import { InputEditor } from '@visactor/vtable-editors';
import { data, COLUMNS, fmt } from '../data.js';

VTable.register.editor('amount-editor', new InputEditor());
const records = data.map((r) => ({ ...r, flagged: r.flagged ? 'Yes' : 'No' }));
const columnsFor = (hidden = []) => [
  { field: 'select', title: '', width: 44, headerType: 'checkbox', cellType: 'checkbox' },
  ...COLUMNS.map((c) => ({
    field: c.id, title: c.title, width: c.width, sort: true, hide: hidden.includes(c.id),
    ...(c.id === 'amount' ? { editor: 'amount-editor', fieldFormat: (r) => fmt(r.amount), style: { textAlign: 'right' } } : {}),
  })),
];
const option = {
  records, columns: columnsFor(), frozenColCount: 2, multipleSort: true, defaultRowHeight: 36, defaultHeaderRowHeight: 38, widthMode: 'standard',
  editCellTrigger: ['doubleclick', 'keydown'], keyboardOptions: { moveFocusCellOnTab: true, editCellOnEnter: true, selectAllOnCtrlA: true },
  columnResizeMode: 'header',
  theme: VTable.themes.DEFAULT.extends({ defaultStyle: { fontSize: 13 }, headerStyle: { fontSize: 13, color: '#52525b', bgColor: '#fafafa' }, bodyStyle: { fontSize: 13 } }),
};

let table;
function onReady(instance) {
  table = instance; window.__vt = instance;
  const colOf = (id) => [...Array(table.colCount).keys()].find((c) => table.getHeaderField(c, 0) === id);
  // Probes for a canvas grid: text = values of the visible body cells; rects come from the engine.
  window.__bench.hasText = (s) => {
    const { rowStart, rowEnd } = table.getBodyVisibleRowRange();
    for (let r = rowStart; r <= rowEnd; r++) for (let c = 0; c < table.colCount; c++) if (String(table.getCellValue(c, r)) === s) return true;
    return false;
  };
  window.__bench.cellRect = (kind, id, rowId) => {
    const col = colOf(id); if (col === undefined) return null;
    let row = 0;
    if (kind === 'cell') { const { rowStart, rowEnd } = table.getBodyVisibleRowRange(); row = -1; for (let r = rowStart; r <= rowEnd; r++) if (table.getCellValue(colOf('id'), r) === rowId) row = r; if (row < 0) return null; }
    const rect = table.getCellRelativeRect(col, row); const box = table.getElement().getBoundingClientRect();
    return { left: box.left + rect.left, top: box.top + rect.top, width: rect.width, height: rect.height };
  };
  // Focus = the engine's selected cell (the canvas holds DOM focus).
  window.__bench.focusRect = () => {
    const range = table.getSelectedCellRanges().at(-1); const box = table.getElement().getBoundingClientRect();
    const editing = document.activeElement?.tagName === 'INPUT';
    if (!range) return { inside: document.activeElement === table.getElement() || editing, editor: editing };
    const rect = table.getCellRelativeRect(range.end.col, range.end.row);
    return { inside: true, editor: editing, cellRole: 'canvas cell', left: box.left + rect.left, top: box.top + rect.top, width: rect.width, height: rect.height };
  };
  window.__bench.scrollToBottom = () => table.scrollToRow?.(table.rowCount - 1) ?? table.scrollTop(1e9);
  window.__bench.api = {
    getSelectedCount: () => table.getCheckboxState('select').filter(Boolean).length,
    getAmount: (id) => Number(table.records.find((r) => r.id === id)?.amount),
    sortCount: () => [].concat(table.sortState ?? []).filter((x) => x && x.order && x.order !== 'normal').length,
    hideColumn: (col) => table.updateColumns(columnsFor([col])),
    hideMethod: 'updateColumns with hide: true (native)',
    setStatusFilter: (s) => table.updateFilterRules(s ? [{ filterKey: 'status', filteredValues: [s] }] : []),
  };
}
const Grid = () => <ListTable option={option} onReady={onReady} height={440} width={780} />;
window.__bench.notes = { filter: 'native updateFilterRules', sort: 'native (multipleSort: true adds every clicked column, no modifier)', edit: 'native InputEditor (vtable-editors)', pin: 'native frozenColCount', resize: 'native drag on canvas', select: 'native checkbox column', a11y: 'canvas: no DOM rows, no ARIA' };
renderBench('VisActor VTable (canvas)', Grid);
