// Motion for React (motion/react): layout animations, AnimatePresence, springs, useScroll.
// Library defaults for timing; reduced motion via MotionConfig reducedMotion="user" (default is "never").
import React from 'react';
import { motion, AnimatePresence, MotionConfig, useScroll } from 'motion/react';
import { renderBench, CARDS, ITEMS, STRESS } from './_shell.jsx';

const Config = ({ children }) => <MotionConfig reducedMotion="user">{children}</MotionConfig>;

function Layout({ value }) {
  return (
    <Config>
      <div className="cards">
        {CARDS.map((c, i) => (
          <motion.div layout key={c} data-probe={`card-${i}`} className={`card${value === i ? ' open' : ''}`}>
            <motion.b layout="position">{c}</motion.b>
          </motion.div>
        ))}
      </div>
    </Config>
  );
}

function Presence({ value }) {
  return (
    <Config>
      <ul className="list">
        <AnimatePresence initial={false}>
          {value.map((id) => (
            <motion.li layout key={id} data-probe={`item-${id}`} className="item"
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }}>
              {ITEMS[id]}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </Config>
  );
}

function Interrupt({ value }) {
  return <Config><motion.div className="drawer" data-probe="drawer" initial={false} animate={{ x: value ? 300 : 0 }} /></Config>;
}

function Scroll() {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({ container: ref });
  return (
    <Config>
      <motion.div className="bar" data-probe="bar" style={{ scaleX: scrollYProgress }} />
      <div className="scroller" ref={ref}>
        <div className="filler">Scroll ↓</div>
        <motion.div className="reveal" data-probe="reveal" initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }} viewport={{ root: ref, once: true }}>Revealed on scroll</motion.div>
        <div className="filler" />
      </div>
    </Config>
  );
}

function Stress({ value }) {
  return Array.from({ length: STRESS }, (_, i) => (
    <motion.i key={i} className="box" initial={false} animate={{ x: value ? 240 : 0 }} transition={{ duration: 0.8 }} />
  ));
}

renderBench('Motion (motion/react)', { layout: Layout, presence: Presence, interrupt: Interrupt, scroll: Scroll, stress: Stress }, {
  layout: 'native: layout prop (FLIP with transforms)', presence: 'native: AnimatePresence + layout', interrupt: 'native: spring, keeps velocity',
  scroll: 'native: useScroll (ScrollTimeline when possible) + whileInView', reduced: 'one-line opt-in: MotionConfig reducedMotion="user"',
});
