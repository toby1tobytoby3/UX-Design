// Shared deterministic dataset: 10,000 invoices × 8 columns, identical for every kit.
// Known markers let the runner detect state changes from the rendered text alone:
//   MIN_AMOUNT / MAX_AMOUNT sit in rows far from the top, so they appear only after a sort;
//   FIRST_REFUNDED is the first 'Refunded' row and lies below the first screen, so it appears only after the filter.
let seed = 42;
const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = (a) => a[Math.floor(rand() * a.length)];
const FIRST = ['Ada', 'Ben', 'Chloe', 'Dev', 'Esme', 'Farah', 'Gus', 'Hana', 'Ivo', 'Jade', 'Kian', 'Lena', 'Milo', 'Nia', 'Omar', 'Priya'];
const LAST = ['Okafor', 'Lindqvist', 'Moreau', 'Tanaka', 'Silva', 'Novak', 'Haddad', 'Kowalski', 'Byrne', 'Rossi', 'Patel', 'Larsen'];
const COUNTRIES = ['United Kingdom', 'Germany', 'France', 'Spain', 'Netherlands', 'Ireland', 'Sweden', 'Italy', 'Poland', 'Portugal'];
const OWNERS = ['A. Shaw', 'B. Ito', 'C. Mensah', 'D. Ruiz', 'E. Kaur'];
export const STATUSES = ['Paid', 'Pending', 'Overdue', 'Draft', 'Refunded'];
export const ROWS = 10000;
export const MIN_AMOUNT = '0.42';
export const MAX_AMOUNT = '99999.99';
export const LAST_ID = 'INV-10000';

export const data = Array.from({ length: ROWS }, (_, i) => {
  const r = rand();
  let status = r < 0.5 ? 'Paid' : r < 0.75 ? 'Pending' : r < 0.88 ? 'Overdue' : r < 0.97 ? 'Draft' : 'Refunded';
  if (i < 60 && status === 'Refunded') status = 'Paid';
  const d = new Date(Date.UTC(2026, 0, 1) + Math.floor(rand() * 290) * 86400000);
  return {
    id: `INV-${String(i + 1).padStart(5, '0')}`,
    customer: `${pick(FIRST)} ${pick(LAST)}`,
    status,
    country: pick(COUNTRIES),
    amount: i === 4999 ? 0.42 : i === 6999 ? 99999.99 : Math.round((10 + rand() * 9989) * 100) / 100,
    date: d.toISOString().slice(0, 10),
    owner: pick(OWNERS),
    flagged: rand() < 0.1,
  };
});
export const FIRST_REFUNDED = data.find((r) => r.status === 'Refunded').id;
export const fmt = (n) => Number(n).toFixed(2);
// Column order and widths shared by every kit (total ≈ 1,060 px, wider than the 760 px view, so it scrolls sideways).
export const COLUMNS = [
  { id: 'id', title: 'ID', width: 110 },
  { id: 'customer', title: 'Customer', width: 170 },
  { id: 'status', title: 'Status', width: 110 },
  { id: 'country', title: 'Country', width: 150 },
  { id: 'amount', title: 'Amount', width: 120 },
  { id: 'date', title: 'Date', width: 120 },
  { id: 'owner', title: 'Owner', width: 120 },
  { id: 'flagged', title: 'Flagged', width: 100 },
];
