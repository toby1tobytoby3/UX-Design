// Shared benchmark data and palette. Every library draws the same four charts from this.
// Sample data (deterministic), not real figures.
export const COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4']; // validated categorical order
export const INK = { text: '#1f1f1e', muted: '#52514e', grid: '#ecebe7', axis: '#d9d8d3', surface: '#fcfcfb' };

// 1. Time series: 180 daily values.
export const series = [];
for (let i = 0, v = 1200, d = Date.UTC(2026, 3, 1); i < 180; i++, d += 864e5) {
  v = Math.max(400, v + Math.round(Math.sin(i / 9) * 40 + (i % 7 > 4 ? -90 : 25) + ((i * 37) % 23) - 11));
  series.push({ date: new Date(d), t: d, value: v });
}

// 2. Sorted bars and 4. donut: revenue by channel.
export const channels = [
  { name: 'Organic search', value: 48200 }, { name: 'Paid search', value: 31900 }, { name: 'Email', value: 22400 },
  { name: 'Referral', value: 15100 }, { name: 'Social', value: 9800 },
];

// 3. Stacked composition: tickets by channel per month.
export const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
export const stackKeys = ['Email', 'Chat', 'Phone', 'In-app'];
export const stack = [
  [420, 310, 190, 80], [398, 344, 176, 102], [451, 362, 168, 131],
  [470, 401, 150, 160], [433, 428, 141, 198], [402, 455, 133, 236],
].map((row, i) => ({ month: months[i], ...Object.fromEntries(stackKeys.map((k, j) => [k, row[j]])) }));

export const fmtK = (v) => (v >= 1000 ? `${Math.round(v / 100) / 10}k` : String(v));
export const fmtDay = (t) => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

// Slots on the page; each lib renders into these.
export const slot = (id) => document.querySelector(`#${id} .plot`);
export const size = (id) => { const r = slot(id).getBoundingClientRect(); return { width: Math.floor(r.width), height: Math.floor(r.height) }; };
// Each lib calls this for any chart it cannot draw natively.
export const unsupported = (id, why) => { slot(id).innerHTML = `<div class="na"><b>Not supported natively</b><span>${why}</span></div>`; slot(id).dataset.na = why; };
