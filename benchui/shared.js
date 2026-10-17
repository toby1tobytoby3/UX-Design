// Shared content for every library: same labels, same 8 menu items, same 50 countries, same 4 tabs.
import React from 'react';
import { createRoot } from 'react-dom/client';

export const MENU_ITEMS = ['Edit', 'Duplicate', 'Archive', 'Move', 'Share', 'Export', 'Rename', 'Delete'];
export const COUNTRIES = ['Argentina', 'Australia', 'Austria', 'Belgium', 'Brazil', 'Canada', 'Chile', 'China', 'Colombia',
  'Czechia', 'Denmark', 'Egypt', 'Estonia', 'Finland', 'France', 'Germany', 'Ghana', 'Greece', 'Hungary', 'Iceland', 'India',
  'Indonesia', 'Ireland', 'Israel', 'Italy', 'Japan', 'Kenya', 'Latvia', 'Lithuania', 'Mexico', 'Morocco', 'Netherlands',
  'New Zealand', 'Nigeria', 'Norway', 'Peru', 'Poland', 'Portugal', 'Romania', 'Singapore', 'South Africa', 'South Korea',
  'Spain', 'Sweden', 'Switzerland', 'Tunisia', 'Turkey', 'United Arab Emirates', 'United Kingdom', 'United States'];
export const TABS = [
  ['overview', 'Overview', 'Project summary, owners and recent activity.'],
  ['activity', 'Activity', 'A timeline of edits, comments and deploys.'],
  ['members', 'Members', 'Twelve people have access to this project.'],
  ['settings', 'Settings', 'Name, visibility and danger zone.'],
];
export const filterCountries = (q) => COUNTRIES.filter((c) => c.toLowerCase().includes(q.toLowerCase()));

const view = (id) => document.querySelector(`#${id} .view`);
export const mount = (id, el) => createRoot(view(id)).render(el);
// A task the library doesn't provide: say so, never hand-roll it.
export function na(id, note) {
  const el = view(id); el.dataset.na = '1'; (window.__bench.notes[id] = note);
  el.innerHTML = `<div class="na"><b>Not in the library</b><span>${note}</span></div>`;
}
window.__bench = { notes: {} };
export const note = (id, text) => { window.__bench.notes[id] = text; };
export const title = (t) => { document.getElementById('lib').textContent = t; };
export { React };
