// The platform only: View Transitions (through React 19.3's <ViewTransition>) for layout and presence,
// CSS transitions for the drawer, CSS scroll-driven animations (animation-timeline) for scroll. No animation library.
import React, { ViewTransition, startTransition } from 'react';
import { renderBench, CARDS, ITEMS, STRESS } from './_shell.jsx';

document.head.insertAdjacentHTML('beforeend', `<style>
  #interrupt .drawer, .box { transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1); }
  .box { transition-duration: 800ms; }
  #scroll .view { timeline-scope: --list; }
  #scroll .scroller { scroll-timeline: --list block; }
  #scroll .bar { animation: grow linear both; animation-timeline: --list; }
  #scroll .reveal { animation: reveal linear both; animation-timeline: view(); animation-range: entry 0% entry 100%; }
  @keyframes grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  @keyframes reveal { from { opacity: 0; transform: translateY(24px); } }
  ::view-transition-group(*) { animation-duration: 300ms; }
  @media (prefers-reduced-motion: reduce) {
    #interrupt .drawer, .box { transition: none; }
    ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; }
  }
</style>`);

// Layout and presence: updates inside a transition let <ViewTransition> snapshot before/after and animate.
function wrapUpdate(task, update) {
  if (task === 'layout' || task === 'presence') startTransition(update);
  else update();
}

function Layout({ value }) {
  return <div className="cards">{CARDS.map((c, i) => <ViewTransition key={c} name={`card-${i}`}><div data-probe={`card-${i}`} className={`card${value === i ? ' open' : ''}`}><b>{c}</b></div></ViewTransition>)}</div>;
}

function Presence({ value }) {
  return <ul className="list">{value.map((id) => <ViewTransition key={id} name={`item-${id}`}><li data-probe={`item-${id}`} className="item">{ITEMS[id]}</li></ViewTransition>)}</ul>;
}

function Interrupt({ value }) {
  return <div className="drawer" data-probe="drawer" style={{ transform: `translateX(${value ? 300 : 0}px)` }} />;
}

function Scroll() {
  return (
    <>
      <div className="bar" data-probe="bar" />
      <div className="scroller"><div className="inner"><div className="filler">Scroll ↓</div><div className="reveal" data-probe="reveal">Revealed on scroll</div><div className="filler" /></div></div>
    </>
  );
}

function Stress({ value }) {
  return Array.from({ length: STRESS }, (_, i) => <i key={i} className="box" style={{ transform: `translateX(${value ? 240 : 0}px)` }} />);
}

renderBench('CSS + View Transitions (native)', { layout: Layout, presence: Presence, interrupt: Interrupt, scroll: Scroll, stress: Stress, wrapUpdate }, {
  layout: 'native: React <ViewTransition> + startTransition', presence: 'native: <ViewTransition> per item (default cross-fade for enter/exit)',
  interrupt: 'native: CSS transition retargets from current position', scroll: 'native: CSS scroll-driven animations (scroll-timeline, view())',
  reduced: 'manual: @media (prefers-reduced-motion) rules',
});
