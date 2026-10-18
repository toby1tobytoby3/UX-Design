// Reference build: inline AI on ordinary form fields with the AI SDK, no editor framework.
//   <AiTextField>     ghost text in a real <textarea> (rich-textarea draws the grey suggestion behind the caret)
//   <AiRewriteField>  ⌘J / Ctrl+J menu → "Improve writing" → word diff preview → Accept · Discard · Try again
//   <AiFillForm>      fill empty fields from a description with useObject; each AI value is labelled and revertible
// Defaults follow research/E6-inline-ai.md: 300 ms debounce, trigger only at the end of the text after a space,
// cancel on every keystroke, Tab accepts only while a suggestion shows, Esc dismisses, Ctrl/⌘+→ accepts a word, no
// suggestions during IME composition, the ghost is hidden from screen readers and announced once, and every change
// goes through the field's native undo (Ctrl/⌘+Z restores the original).
import React, { useEffect, useId, useRef, useState } from 'react';
import { useCompletion, useObject } from '@ai-sdk/react';
import { RichTextarea } from 'rich-textarea';
import { diffWords } from 'diff';
import { z } from 'zod';
import { renderBench } from './_shell.jsx';
import { installFetchMock, textStream, GHOST_TEXT, REWRITE_ORIGINAL, REWRITE_IMPROVED, FILL_DESCRIPTION, FILL_OBJECT } from '../mock.js';

installFetchMock({
  '/api/complete': ({ signal }) => textStream(GHOST_TEXT, signal),
  '/api/rewrite': ({ signal }) => textStream(REWRITE_IMPROVED, signal),
  '/api/fill': ({ signal }) => textStream(JSON.stringify(FILL_OBJECT), signal),
});

// ── Shared helpers ────────────────────────────────────────────────────────────────────────────────────────────────

// Replace a range through the browser's editing pipeline so the change lands on the native undo stack.
function replaceRange(el, start, end, text) {
  el.focus();
  el.setSelectionRange(start, end);
  if (!document.execCommand('insertText', false, text)) el.setRangeText(text, start, end, 'end');
}

// One polite live region per component: say each message once, never stream into it.
function useAnnouncer() {
  const [message, setMessage] = useState('');
  const say = (m) => { setMessage(''); requestAnimationFrame(() => setMessage(m)); };
  return [<div role="status" className="sr-only">{message}</div>, say];
}

const isComposing = (e) => e.nativeEvent.isComposing || e.keyCode === 229;
const nextWord = (s) => s.match(/^\s*\S+/)?.[0] ?? s;

// ── Ghost text ────────────────────────────────────────────────────────────────────────────────────────────────────

export function AiTextField({ label, defaultValue = '', api = '/api/complete', debounceMs = 300, ...props }) {
  const id = useId();
  const ref = useRef(null);
  const timer = useRef(0);
  const composing = useRef(false);
  const [value, setValue] = useState(defaultValue);
  const [atEnd, setAtEnd] = useState(true);
  const [live, announce] = useAnnouncer();
  const { complete, stop, completion, setCompletion } = useCompletion({ api, streamProtocol: 'text', experimental_throttle: 50 });
  const suggestion = atEnd && !composing.current ? completion : '';

  const dismiss = () => { clearTimeout(timer.current); stop(); setCompletion(''); };
  useEffect(() => () => clearTimeout(timer.current), []);
  // Announce once per new suggestion, when it first appears.
  const announced = useRef(false);
  useEffect(() => {
    if (suggestion && !announced.current) { announced.current = true; announce('Suggestion available. Tab to accept, Escape to dismiss.'); }
    if (!suggestion) announced.current = false;
  }, [suggestion]);

  function onChange(e) {
    const next = e.target.value;
    setValue(next);
    dismiss(); // every keystroke cancels the pending or in-flight request
    const end = e.target.selectionStart === next.length;
    setAtEnd(end);
    if (end && next.trim() && next.endsWith(' ') && !composing.current) {
      timer.current = setTimeout(() => { window.__bench.marks.ghost_requested = performance.now(); complete(next); }, debounceMs);
    }
  }

  function accept(text) {
    const el = ref.current;
    replaceRange(el, el.value.length, el.value.length, text);
    setCompletion(completion.slice(text.length));
    if (text === completion) setCompletion('');
  }

  function onKeyDown(e) {
    if (isComposing(e) || !suggestion) return;
    if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); accept(completion); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); dismiss(); }
    else if (e.key === 'ArrowRight' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); accept(nextWord(completion)); }
  }

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <RichTextarea id={id} ref={ref} value={value} onChange={onChange} onKeyDown={onKeyDown}
        onSelectionChange={(p) => setAtEnd(p.selectionStart === value.length && p.selectionEnd === value.length)}
        onCompositionStart={() => { composing.current = true; dismiss(); }}
        onCompositionEnd={() => { composing.current = false; }}
        onBlur={dismiss} aria-describedby={`${id}-hint`} style={{ width: '100%', height: 110 }} {...props}>
        {(v) => <>{v}{suggestion ? <span className="ghost" aria-hidden="true">{suggestion}</span> : null}</>}
      </RichTextarea>
      <p id={`${id}-hint`} className="hint">Pause to get a suggestion. Tab accepts, Esc dismisses, Ctrl+→ accepts one word.</p>
      {live}
    </div>
  );
}

// ── AI command menu (⌘J / Ctrl+J) ─────────────────────────────────────────────────────────────────────────────────

const PRESETS = ['Improve writing', 'Make shorter', 'Fix spelling and grammar', 'Summarise'];

function AiCommandMenu({ onRun, onClose }) {
  const id = useId();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const options = [...PRESETS.filter((p) => p.toLowerCase().includes(query.toLowerCase())), ...(query ? [`Ask AI: ${query}`] : [])];
  function onKeyDown(e) {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onClose(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, options.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && options[active]) { e.preventDefault(); onRun(options[active]); }
  }
  return (
    <div className="menu" role="dialog" aria-label="AI actions">
      <input autoFocus role="combobox" aria-expanded="true" aria-controls={`${id}-list`} aria-autocomplete="list"
        aria-activedescendant={options[active] ? `${id}-${active}` : undefined} aria-label="Ask AI or choose an action"
        placeholder="Ask AI anything…" value={query} onChange={(e) => { setQuery(e.target.value); setActive(0); }} onKeyDown={onKeyDown} />
      <ul role="listbox" id={`${id}-list`} aria-label="AI actions">
        {options.map((o, i) => (
          <li key={o} id={`${id}-${i}`} role="option" aria-selected={i === active} onMouseDown={(e) => e.preventDefault()} onClick={() => onRun(o)}>{o}</li>
        ))}
      </ul>
    </div>
  );
}

// ── Rewrite with diff ─────────────────────────────────────────────────────────────────────────────────────────────

export function AiRewriteField({ label, defaultValue, api = '/api/rewrite' }) {
  const id = useId();
  const ref = useRef(null);
  const [menu, setMenu] = useState(false);
  const [target, setTarget] = useState(null); // { start, end, text, action } while a rewrite is pending review
  const [live, announce] = useAnnouncer();
  const { complete, stop, completion, setCompletion, isLoading } = useCompletion({ api, streamProtocol: 'text', experimental_throttle: 50,
    onFinish: () => { window.__bench.marks.rewrite_done = performance.now(); announce('Suggestion ready. Review the changes, then accept or discard.'); } });

  const selection = () => {
    const el = ref.current;
    const [start, end] = el.selectionStart === el.selectionEnd ? [0, el.value.length] : [el.selectionStart, el.selectionEnd];
    return { start, end, text: el.value.slice(start, end) };
  };
  const run = (action, t = target ?? selection()) => {
    setMenu(false);
    setTarget({ ...t, action });
    setCompletion('');
    window.__bench.marks.rewrite_start = performance.now();
    complete(t.text, { body: { action } });
    ref.current.focus();
  };
  const close = () => { stop(); setTarget(null); setCompletion(''); const el = ref.current; el.focus(); };
  const accept = () => { replaceRange(ref.current, target.start, target.start + target.text.length, completion); setTarget(null); setCompletion(''); announce('Change applied. Undo with Ctrl+Z.'); };

  function onKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') { e.preventDefault(); setMenu(true); }
    else if (e.key === 'Escape' && target) { e.preventDefault(); close(); }
  }

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} ref={ref} defaultValue={defaultValue} onKeyDown={onKeyDown} aria-describedby={`${id}-hint`} rows={6} />
      <p id={`${id}-hint`} className="hint">Select text and press Ctrl+J (⌘J) for AI actions.</p>
      {menu && <AiCommandMenu onRun={(a) => run(a)} onClose={() => { setMenu(false); ref.current.focus(); }} />}
      {target && (
        <div className="review" aria-label="Suggested change">
          <p className="diff">
            {diffWords(target.text, completion || target.text).map((p, i) => p.added ? <ins key={i}><span className="sr-only">added: </span>{p.value}</ins>
              : p.removed ? <del key={i}><span className="sr-only">removed: </span>{p.value}</del> : <span key={i}>{p.value}</span>)}
          </p>
          <div className="actions">
            {isLoading ? <><span className="pill">Writing…</span><button type="button" onClick={close}>Stop (Esc)</button></>
              : <><button type="button" onClick={accept}>Accept</button><button type="button" onClick={close}>Discard</button>
                <button type="button" onClick={() => run(target.action, target)}>Try again</button></>}
          </div>
        </div>
      )}
      {live}
    </div>
  );
}

// ── AI form fill ──────────────────────────────────────────────────────────────────────────────────────────────────

const ticketSchema = z.object({ title: z.string(), category: z.string(), tags: z.array(z.string()), summary: z.string() });
const FIELDS = [['title', 'Title', 'input'], ['category', 'Category', 'input'], ['tags', 'Tags', 'input'], ['summary', 'Summary', 'textarea']];

export function AiFillForm({ api = '/api/fill', initial = {} }) {
  // Each field: { value, ai: boolean, before: value before AI touched it }
  const [fields, setFields] = useState(() => Object.fromEntries(FIELDS.map(([k]) => [k, { value: initial[k] ?? '', ai: false, before: '' }])));
  const [description, setDescription] = useState(FILL_DESCRIPTION);
  const [live, announce] = useAnnouncer();
  const filling = useRef(null); // keys the current fill may write (empty or previously AI-filled when it started)
  const { submit, object, isLoading, stop } = useObject({ api, schema: ticketSchema,
    onFinish: () => { announce(`Filled ${filling.current.length} fields with AI. Review them before saving.`); filling.current = null; } });

  useEffect(() => {
    if (!object || !filling.current) return;
    setFields((f) => {
      const next = { ...f };
      for (const k of filling.current) {
        const v = object[k];
        if (v == null) continue;
        next[k] = { value: Array.isArray(v) ? v.filter(Boolean).join(', ') : String(v), ai: true, before: f[k].ai ? f[k].before : f[k].value };
      }
      return next;
    });
  }, [object]);

  const fill = () => {
    filling.current = FIELDS.map(([k]) => k).filter((k) => !fields[k].value.trim() || fields[k].ai); // never overwrite the user's text
    submit({ description });
  };
  const edit = (k, value) => setFields((f) => ({ ...f, [k]: { value, ai: false, before: '' } }));
  const revert = (k) => setFields((f) => ({ ...f, [k]: { value: f[k].before, ai: false, before: '' } }));

  return (
    <form className="fill" onSubmit={(e) => { e.preventDefault(); window.__bench.submits++; }}>
      <label>Describe the issue<textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
      <div className="actions">
        <button type="button" onClick={fill} disabled={isLoading}>Fill empty fields with AI</button>
        {isLoading && <button type="button" onClick={stop}>Stop</button>}
      </div>
      {FIELDS.map(([k, label, tag]) => {
        const Tag = tag;
        return (
          <div className="row" key={k} data-field={k} data-ai-filled={fields[k].ai || undefined}>
            <label htmlFor={`f-${k}`}>{label}{fields[k].ai && <span className="ai-chip" title="Filled by AI: review before saving">AI</span>}</label>
            <Tag id={`f-${k}`} value={fields[k].value} onChange={(e) => edit(k, e.target.value)} {...(tag === 'textarea' ? { rows: 2 } : {})} />
            {fields[k].ai && <button type="button" className="revert" onClick={() => revert(k)} aria-label={`Revert ${label} to your value`}>Revert</button>}
          </div>
        );
      })}
      <button type="submit">Save ticket</button>
      {live}
    </form>
  );
}

// ── Bench wiring ──────────────────────────────────────────────────────────────────────────────────────────────────

renderBench('AI SDK + rich-textarea (our reference build)', {
  ghost: () => <AiTextField label="Update" />,
  rewrite: () => <AiRewriteField label="Release notes" defaultValue={REWRITE_ORIGINAL} />,
  fill: () => <AiFillForm initial={{ category: 'Billing' }} />,
  command: () => <AiRewriteField label="Draft" defaultValue="Thanks for the update, I will review it tomorrow." />,
}, {});
window.__bench.config = {
  ghost: { field: '#ghost textarea' },
  rewrite: { field: '#rewrite textarea', open: 'Control+j', preset: '#rewrite [role=option]:has-text("Improve writing")' },
  command: { field: '#command textarea', open: 'Control+j', menuInput: '#command [role=combobox]' },
  fill: { button: '#fill button:has-text("Fill empty fields")', prefilled: 'category' },
};
