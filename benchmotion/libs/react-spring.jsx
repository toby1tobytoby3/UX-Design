// React Spring (@react-spring/web): physics springs, useTransition for presence, useScroll.
// No layout (FLIP) primitive: the shared-element task measures and animates by hand with useSpring.
// Reduced motion: useReducedMotion() hook + Globals.assign({ skipAnimation }) (off by default).
import React, { useLayoutEffect, useRef } from 'react';
import { animated, useSpring, useTransition, useScroll, useInView, useReducedMotion, Globals, to } from '@react-spring/web';
import { renderBench, CARDS, ITEMS, STRESS } from './_shell.jsx';

function ReducedMotion() { const reduce = useReducedMotion(); Globals.assign({ skipAnimation: !!reduce }); return null; }

// Hand-rolled FLIP: measure before/after layout and spring the inverse transform back to zero.
function FlipCard({ i, label, open }) {
  const ref = useRef(null);
  const last = useRef(null);
  const [style, api] = useSpring(() => ({ x: 0, y: 0, sx: 1, sy: 1 }));
  useLayoutEffect(() => {
    const now = ref.current.getBoundingClientRect();
    const prev = last.current;
    last.current = now;
    if (!prev || (prev.width === now.width && prev.left === now.left)) return;
    api.set({ x: prev.left - now.left, y: prev.top - now.top, sx: prev.width / now.width, sy: prev.height / now.height });
    api.start({ x: 0, y: 0, sx: 1, sy: 1 });
  }, [open, api]);
  return (
    <animated.div ref={ref} data-probe={`card-${i}`} className={`card${open ? ' open' : ''}`}
      style={{ transformOrigin: '0 0', transform: to([style.x, style.y, style.sx, style.sy], (x, y, sx, sy) => `translate(${x}px, ${y}px) scale(${sx}, ${sy})`) }}>
      <b>{label}</b>
    </animated.div>
  );
}

function Layout({ value }) {
  return <div className="cards"><ReducedMotion />{CARDS.map((c, i) => <FlipCard key={c} i={i} label={c} open={value === i} />)}</div>;
}

function Presence({ value }) {
  const transitions = useTransition(value, {
    keys: (id) => id, initial: null,
    from: { opacity: 0, y: -12, height: 0 }, enter: { opacity: 1, y: 0, height: 40 }, leave: { opacity: 0, y: 0, height: 0 },
  });
  return (
    <ul className="list">
      {transitions((style, id) => (
        <animated.li data-probe={`item-${id}`} className="item" style={{ opacity: style.opacity, height: style.height, transform: style.y.to((y) => `translateY(${y}px)`), overflow: 'hidden' }}>
          {ITEMS[id]}
        </animated.li>
      ))}
    </ul>
  );
}

function Interrupt({ value }) {
  const style = useSpring({ x: value ? 300 : 0 });
  return <animated.div className="drawer" data-probe="drawer" style={style} />;
}

function Scroll() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ container: ref });
  const [revealRef, inView] = useInView({ root: ref, once: true });
  const reveal = useSpring({ opacity: inView ? 1 : 0, y: inView ? 0 : 24 });
  return (
    <>
      <animated.div className="bar" data-probe="bar" style={{ transform: scrollYProgress.to((p) => `scaleX(${p})`) }} />
      <div className="scroller" ref={ref}>
        <div className="filler">Scroll ↓</div>
        <animated.div className="reveal" data-probe="reveal" ref={revealRef} style={reveal}>Revealed on scroll</animated.div>
        <div className="filler" />
      </div>
    </>
  );
}

function Box({ value }) { const s = useSpring({ x: value ? 240 : 0, config: { duration: 800 } }); return <animated.i className="box" style={s} />; }
function Stress({ value }) { return Array.from({ length: STRESS }, (_, i) => <Box key={i} value={value} />); }

renderBench('React Spring', { layout: Layout, presence: Presence, interrupt: Interrupt, scroll: Scroll, stress: Stress }, {
  layout: 'hand-rolled FLIP with useSpring (no layout primitive)', presence: 'native: useTransition (siblings close the gap via height)',
  interrupt: 'native: spring, keeps velocity', scroll: 'native: useScroll + useInView (JS scroll listener)',
  reduced: 'opt-in: useReducedMotion + Globals.skipAnimation',
});
