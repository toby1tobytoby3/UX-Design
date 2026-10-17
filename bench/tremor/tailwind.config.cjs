// Minimal Tailwind 3 config Tremor's docs require (tremor-* colour tokens + safelisted chart colours).
const colors = require('tailwindcss/colors');
module.exports = {
  content: ['../libs/tremor.jsx', './node_modules/@tremor/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {
    colors: { tremor: {
      brand: { faint: colors.blue[50], muted: colors.blue[200], subtle: colors.blue[400], DEFAULT: colors.blue[500], emphasis: colors.blue[700], inverted: colors.white },
      background: { muted: colors.gray[50], subtle: colors.gray[100], DEFAULT: colors.white, emphasis: colors.gray[700] },
      border: { DEFAULT: colors.gray[200] }, ring: { DEFAULT: colors.gray[200] },
      content: { subtle: colors.gray[400], DEFAULT: colors.gray[500], emphasis: colors.gray[700], strong: colors.gray[900], inverted: colors.white } } },
    fontSize: { 'tremor-label': ['0.75rem', { lineHeight: '1rem' }], 'tremor-default': ['0.875rem', { lineHeight: '1.25rem' }] },
    borderRadius: { 'tremor-small': '0.375rem', 'tremor-default': '0.5rem' } } },
  safelist: [{ pattern: /^(bg|text|border|ring|stroke|fill)-(blue|orange|emerald|amber|pink)-(50|100|200|300|400|500|600|700|800|900|950)$/, variants: ['hover', 'ui-selected'] }],
};
