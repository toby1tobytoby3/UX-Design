// GSAP 3 + @gsap/react: tweens, Flip plugin for layout, ScrollTrigger for scroll.
// Free under GSAP's "Standard no-charge" licence (not an OSI open-source licence).
// No presence for React: removed items stay rendered until their exit tween finishes (hand-rolled).
// Reduced motion: gsap.matchMedia() (opt-in).
import React, { useRef, useState, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { flushSync } from 'react-dom';
import { renderBench, CARDS, ITEMS, STRESS } from './_shell.jsx';

gsap.registerPlugin(Flip, ScrollTrigger, useGSAP);
gsap.matchMedia().add('(prefers-reduced-motion: reduce)', () => { gsap.globalTimeline.timeScale(100); });

// Flip: record positions, let React update the DOM, animate from the recorded state.
function wrapUpdate(task, update) {
  if (task !== 'layout') return update();
  const targets = document.querySelectorAll('#layout [data-probe]');
  const state = Flip.getState(targets);
  flushSync(update);
  Flip.from(state, { duration: 0.5, ease: 'power1.inOut', absolute: true, nested: true });
}

function Layout({ value }) {
  return <div className="cards">{CARDS.map((c, i) => <div key={c} data-probe={`card-${i}`} className={`card${value === i ? ' open' : ''}`}><b>{c}</b></div>)}</div>;
}

function Presence({ value }) {
  const [shown, setShown] = useState(value);
  const ref = useRef(null);
  const { contextSafe } = useGSAP({ scope: ref });
  useLayoutEffect(() => {
    const removed = shown.filter((id) => !value.includes(id));
    const added = value.filter((id) => !shown.includes(id));
    added.forEach((id) => gsap.from(`[data-probe="item-${id}"]`, { opacity: 0, y: -12, duration: 0.3 }));
    if (!removed.length) { if (added.length) setShown(value); return; }
    contextSafe(() => gsap.to(removed.map((id) => `[data-probe="item-${id}"]`), {
      opacity: 0, x: 40, duration: 0.3,
      onComplete: () => { const state = Flip.getState('#presence [data-probe]'); setShown(value); requestAnimationFrame(() => Flip.from(state, { duration: 0.3 })); },
    }))();
  }, [value]);
  const ids = [...new Set([...shown, ...value])].sort((a, b) => a - b);
  return <ul className="list" ref={ref}>{ids.map((id) => <li key={id} data-probe={`item-${id}`} className="item">{ITEMS[id]}</li>)}</ul>;
}

function Interrupt({ value }) {
  const ref = useRef(null);
  useGSAP(() => { gsap.to(ref.current, { x: value ? 300 : 0, overwrite: 'auto' }); }, { dependencies: [value] });
  return <div className="drawer" data-probe="drawer" ref={ref} />;
}

function Scroll() {
  const scope = useRef(null);
  useGSAP(() => {
    const scroller = scope.current.querySelector('.scroller');
    gsap.fromTo('.bar', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { scroller, trigger: scroller.firstElementChild, start: 'top top', end: () => `+=${scroller.scrollHeight - scroller.clientHeight}`, scrub: true } });
    gsap.from('.reveal', { opacity: 0, y: 24, scrollTrigger: { scroller, trigger: '.reveal', start: 'top 90%', once: true } });
  }, { scope });
  return (
    <div ref={scope} className="fill">
      <div className="bar" data-probe="bar" />
      <div className="scroller"><div className="inner"><div className="filler">Scroll ↓</div><div className="reveal" data-probe="reveal">Revealed on scroll</div><div className="filler" /></div></div>
    </div>
  );
}

function Stress({ value }) {
  const ref = useRef(null);
  useGSAP(() => { gsap.to(ref.current.children, { x: value ? 240 : 0, duration: 0.8 }); }, { dependencies: [value], scope: ref });
  return <div ref={ref}>{Array.from({ length: STRESS }, (_, i) => <i key={i} className="box" />)}</div>;
}

renderBench('GSAP', { layout: Layout, presence: Presence, interrupt: Interrupt, scroll: Scroll, stress: Stress, wrapUpdate }, {
  layout: 'native: Flip plugin', presence: 'hand-rolled exit (keep items until tween ends) + Flip for siblings',
  interrupt: 'native: overwrite:auto retargets from current position', scroll: 'native: ScrollTrigger (JS scroll listener)',
  reduced: 'opt-in: gsap.matchMedia()',
});
