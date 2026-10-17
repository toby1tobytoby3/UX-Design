// AutoAnimate (@formkit/auto-animate): one hook animates a parent's children being added, removed or moved.
// It is not a general animation library: no tweens, springs or scroll. Respects reduced motion by default.
import React from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { renderBench, CARDS, ITEMS } from './_shell.jsx';

function Layout({ value }) {
  const [ref] = useAutoAnimate();
  return <div className="cards" ref={ref}>{CARDS.map((c, i) => <div key={c} data-probe={`card-${i}`} className={`card${value === i ? ' open' : ''}`}><b>{c}</b></div>)}</div>;
}

function Presence({ value }) {
  const [ref] = useAutoAnimate();
  return <ul className="list" ref={ref}>{value.map((id) => <li key={id} data-probe={`item-${id}`} className="item">{ITEMS[id]}</li>)}</ul>;
}

renderBench('AutoAnimate', { layout: Layout, presence: Presence }, {
  interrupt: 'Not a tween/spring library: animates DOM additions, removals and moves only.',
  scroll: 'No scroll-linked animation.', layout: 'native: animates size/position changes of children',
  presence: 'native: one hook on the parent', reduced: 'default: honours prefers-reduced-motion',
});
