// Tremor 3.18 (npm package; React 18 only). Built on Recharts, styled with Tailwind.
// Colours must be Tailwind colour names, so the validated hex palette is approximated.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { AreaChart, BarChart, DonutChart, Legend } from '@tremor/react';
import { series, channels, stack, stackKeys, fmtK, fmtDay, slot } from '../data.js';

document.getElementById('lib').textContent = 'Tremor 3.18 (npm)';
const colors = ['blue', 'orange', 'emerald', 'amber', 'pink'];
const mount = (id, el) => createRoot(slot(id)).render(el);
const ts = series.map((d) => ({ day: fmtDay(d.t), 'Active users': d.value }));

mount('ts', <AreaChart className="h-full" data={ts} index="day" categories={['Active users']} colors={['blue']} showLegend={false} yAxisWidth={44} showAnimation={false} />);
mount('bar', <BarChart className="h-full" data={channels} index="name" categories={['value']} colors={['blue']} layout="vertical" yAxisWidth={104} valueFormatter={fmtK} showLegend={false} showAnimation={false} />);
mount('stack', <BarChart className="h-full" data={stack} index="month" categories={stackKeys} colors={colors} stack yAxisWidth={44} showAnimation={false} />);
mount('donut', <div className="flex h-full items-center justify-center gap-6">
  <DonutChart className="h-60 w-60" data={channels} category="value" index="name" colors={colors} valueFormatter={fmtK} showAnimation={false} />
  <Legend categories={channels.map((c) => c.name)} colors={colors} className="max-w-[10rem]" /></div>);
