// anime.js v4: animate(), createLayout() for layout/FLIP, onScroll(), springs.
// Not React-specific: animations run in effects against refs. Reduced motion has no built-in hook (manual check).
import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { animate, createLayout, onScroll } from 'animejs';
import { flushSync } from 'react-dom';
import { renderBench, CARDS, ITEMS, STRESS, reducedMotion } from './_shell.jsx';

const d = (ms) => (reducedMotion() ? 0 : ms);
const layouts = {};
// Layout: record the old state, let React update, then animate to the new one.
function wrapUpdate(task, update) {
  if (task !== 'layout') return update();
  const layout = (layouts.layout ??= createLayout('#layout .cards', { duration: d(500) }));
  layout.record();
  flushSync(update);
  layout.animate({ duration: d(500) });
}

function Layout({ value }) {
  return <div className="cards">{CARDS.map((c, i) => <div key={c} data-probe={`card-${i}`} className={`card${value === i ? ' open' : ''}`}><b>{c}</b></div>)}</div>;
}

// Exit: React removes nodes immediately, so removed items are kept until their animation completes (hand-rolled).
function Presence({ value }) {
  const [shown, setShown] = useState(value);
  useLayoutEffect(() => {
    const removed = shown.filter((id) => !value.includes(id));
    const added = value.filter((id) => !shown.includes(id));
    added.forEach((id) => animate(`[data-probe="item-${id}"]`, { opacity: [0, 1], y: [-12, 0], duration: d(300) }));
    if (!removed.length) { if (added.length) setShown(value); return; }
    animate(removed.map((id) => `[data-probe="item-${id}"]`), { opacity: 0, x: 40, duration: d(300),
      onComplete: () => { const l = layouts.presence ??= createLayout('#presence .list'); l.record(); setShown(value); requestAnimationFrame(() => l.animate({ duration: d(300) })); } });
  }, [value]);
  const ids = [...new Set([...shown, ...value])].sort((a, b) => a - b);
  return <ul className="list">{ids.map((id) => <li key={id} data-probe={`item-${id}`} className="item">{ITEMS[id]}</li>)}</ul>;
}

function Interrupt({ value }) {
  const ref = useRef(null);
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } animate(ref.current, { x: value ? 300 : 0, duration: d(1000) }); }, [value]);
  return <div className="drawer" data-probe="drawer" ref={ref} />;
}

function Scroll() {
  const ref = useRef(null);
  useEffect(() => {
    const scroller = ref.current.querySelector('.scroller');
    const a = animate(ref.current.querySelector('.bar'), { scaleX: [0, 1], ease: 'linear', autoplay: onScroll({ container: scroller, target: scroller.firstElementChild, enter: 'top top', leave: 'bottom bottom', sync: true }) });
    const r = animate(ref.current.querySelector('.reveal'), { opacity: [0, 1], y: [24, 0], duration: d(600), autoplay: onScroll({ container: scroller }) });
    return () => { a.revert(); r.revert(); };
  }, []);
  return (
    <div ref={ref} className="fill">
      <div className="bar" data-probe="bar" />
      <div className="scroller"><div className="inner"><div className="filler">Scroll ↓</div><div className="reveal" data-probe="reveal">Revealed on scroll</div><div className="filler" /></div></div>
    </div>
  );
}

function Stress({ value }) {
  const ref = useRef(null);
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } animate(ref.current.children, { x: value ? 240 : 0, duration: 800 }); }, [value]);
  return <div ref={ref}>{Array.from({ length: STRESS }, (_, i) => <i key={i} className="box" />)}</div>;
}

renderBench('anime.js v4', { layout: Layout, presence: Presence, interrupt: Interrupt, scroll: Scroll, stress: Stress, wrapUpdate }, {
  layout: 'native: createLayout (record → update → animate)', presence: 'hand-rolled exit + createLayout for siblings',
  interrupt: 'native: new animate() retargets from current value', scroll: 'native: onScroll (JS scroll listener)',
  reduced: 'manual: no built-in support',
});
