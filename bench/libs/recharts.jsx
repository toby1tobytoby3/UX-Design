// Recharts 3 (React 19).
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush, LabelList } from 'recharts';
import { COLORS, INK, series, channels, stack, stackKeys, fmtK, fmtDay, slot } from '../data.js';

document.getElementById('lib').textContent = 'Recharts 3.10';
const tick = { fill: INK.muted, fontSize: 11 };
const mount = (id, el) => createRoot(slot(id)).render(<ResponsiveContainer width="100%" height="100%">{el}</ResponsiveContainer>);

mount('ts',
  <AreaChart data={series} margin={{ top: 8, right: 12, left: 0, bottom: 0 }} accessibilityLayer>
    <CartesianGrid stroke={INK.grid} vertical={false} />
    <XAxis dataKey="t" type="number" scale="time" domain={['dataMin', 'dataMax']} tickFormatter={fmtDay} tick={tick} stroke={INK.axis} />
    <YAxis tick={tick} stroke={INK.axis} width={40} />
    <Tooltip labelFormatter={fmtDay} />
    <Area dataKey="value" name="Active users" stroke={COLORS[0]} strokeWidth={2} fill={COLORS[0]} fillOpacity={0.12} isAnimationActive={false} />
    <Brush dataKey="t" height={22} stroke={COLORS[0]} startIndex={90} tickFormatter={fmtDay} />
  </AreaChart>);
mount('bar',
  <BarChart data={channels} layout="vertical" margin={{ top: 4, right: 48, left: 8, bottom: 0 }} accessibilityLayer>
    <CartesianGrid stroke={INK.grid} horizontal={false} />
    <XAxis type="number" tickFormatter={fmtK} tick={tick} stroke={INK.axis} />
    <YAxis type="category" dataKey="name" tick={tick} width={96} stroke={INK.axis} />
    <Tooltip />
    <Bar dataKey="value" barSize={18} radius={[0, 4, 4, 0]} isAnimationActive={false}>
      {channels.map((c, i) => <Cell key={c.name} fill={COLORS[i]} />)}
      <LabelList dataKey="value" position="right" formatter={fmtK} fill={INK.muted} fontSize={11} />
    </Bar>
  </BarChart>);
mount('stack',
  <BarChart data={stack} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} accessibilityLayer>
    <CartesianGrid stroke={INK.grid} vertical={false} />
    <XAxis dataKey="month" tick={tick} stroke={INK.axis} /><YAxis tick={tick} width={40} stroke={INK.axis} />
    <Tooltip /><Legend verticalAlign="top" align="right" height={26} iconType="square" />
    {stackKeys.map((k, i) => <Bar key={k} dataKey={k} stackId="t" fill={COLORS[i]} stroke={INK.surface} isAnimationActive={false} />)}
  </BarChart>);
mount('donut',
  <PieChart accessibilityLayer>
    <Tooltip />
    <Pie data={channels} dataKey="value" nameKey="name" innerRadius="42%" outerRadius="70%" stroke={INK.surface} strokeWidth={2}
         label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} isAnimationActive={false}>
      {channels.map((c, i) => <Cell key={c.name} fill={COLORS[i]} />)}
    </Pie>
  </PieChart>);
