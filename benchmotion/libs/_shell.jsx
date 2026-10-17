// Shared page for every motion library: same four tasks, same markup, same controls.
// Each library file implements the task components and calls renderBench(); run.mjs drives the
// controls through window.__bench.set(task, value) and samples [data-probe] elements every frame.
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

export const CARDS = ['Revenue', 'Active users', 'Churn'];
export const ITEMS = ['Deploy finished', 'Invoice paid', 'New comment', 'Build failed', 'Member joined', 'Domain verified'];
export const STRESS = 60; // boxes animated together for the frame-timing probe
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const TASKS = {
  layout: ['Shared element', 'card expands into a detail panel and back'],
  presence: ['Enter and exit', 'items added and removed; siblings close the gap'],
  interrupt: ['Interrupted drawer', 'opened, then closed mid-flight'],
  scroll: ['Scroll-linked', 'progress bar and reveal driven by native scroll'],
};

// value per task: layout = open card index or null; presence = visible item ids; interrupt = open boolean;
// scroll is driven by scrolling the .scroller element; stress = boolean.
const initial = { layout: null, presence: [0, 1, 2], interrupt: false, stress: false };

export function renderBench(name, impl, notes = {}) {
  window.__bench = { name, notes, set: null, ready: false };
  function App() {
    const [state, setState] = useState(initial);
    useEffect(() => {
      // Libraries that measure the DOM before and after a change (FLIP, View Transitions) wrap the update.
      window.__bench.set = (task, value) => {
        const apply = () => setState((s) => ({ ...s, [task]: value }));
        impl.wrapUpdate ? impl.wrapUpdate(task, apply) : apply();
      };
      window.__bench.ready = true;
    }, []);
    return (
      <>
        <header><b>{name}</b><span>Same four tasks in every library · run.mjs samples each frame</span></header>
        <main>
          {Object.entries(TASKS).map(([id, [title, sub]]) => {
            const Task = impl[id];
            return (
              <section id={id} key={id}>
                <h2>{title} <small>· {sub}</small></h2>
                <div className="view">
                  {Task ? <Task value={state[id]} /> : <div className="na" data-na="1"><b>Not supported</b>{notes[id]}</div>}
                </div>
              </section>
            );
          })}
        </main>
        <div id="stress">{impl.stress && <impl.stress value={state.stress} />}</div>
      </>
    );
  }
  createRoot(document.getElementById('root')).render(<App />);
}
