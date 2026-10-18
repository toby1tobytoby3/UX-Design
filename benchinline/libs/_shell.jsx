// Shared page for every inline-AI kit: same four sections, same mock, same probes (run.mjs).
import React from 'react';
import { createRoot } from 'react-dom/client';

const TASKS = {
  ghost: ['Ghost text', 'type a sentence; a suggestion appears after a pause'],
  rewrite: ['Rewrite with diff', 'select the paragraph, Improve writing, review, accept'],
  fill: ['AI form fill', 'four fields filled from a short description'],
  command: ['AI command menu', 'open with the shortcut, presets and free text'],
};

export function renderBench(name, impl, notes = {}) {
  window.__bench = Object.assign(window.__bench ?? {}, { name, notes, ready: false, marks: {}, submits: 0 });
  function App() {
    React.useEffect(() => { window.__bench.ready = true; }, []);
    return (
      <>
        <header><b>{name}</b><span>Same four tasks from one mock · no API key</span></header>
        <main>
          {Object.entries(TASKS).map(([id, [title, sub]]) => {
            const Task = impl[id];
            return (
              <section id={id} key={id} aria-labelledby={`${id}-h`}>
                <h2 id={`${id}-h`}>{title} <small>· {sub}</small></h2>
                <div className="view">{Task ? <Task /> : <div className="na" data-na="1"><b>Not supported</b>{notes[id]}</div>}</div>
              </section>
            );
          })}
        </main>
      </>
    );
  }
  createRoot(document.getElementById('root')).render(<App />);
}
