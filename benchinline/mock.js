// One deterministic "model" for every kit: the same ghost-text suggestion, the same 300-word rewrite and the same form
// object, served by an in-page fetch mock so kits that call their documented API routes (/api/ai/*) need no server
// and no API key. Every call and every abort is counted in window.__bench so run.mjs can check debounce and cancellation.

export const GHOST_PREFIX = 'The quarterly report shows revenue growth ';
export const GHOST_TEXT = 'of twelve percent across enterprise accounts.';
export const LATENCY_MS = 300; // fixed "model" latency before a suggestion or the first chunk
const CHUNK_MS = globalThis.__CHUNK_MS ?? 8; // override for cadence experiments

const sentences = [
  ['Our team has been working hard on the new onboarding flow for the last few weeks', 'Over the past few weeks, the team has rebuilt the onboarding flow'],
  ['and we think that it is now a lot better than it was before in most of the ways that matter', 'and it now works better in the ways that matter most'],
  ['The first thing that people see is a short welcome screen that explains what the product does', 'New users first see a short welcome screen that explains what the product does'],
  ['and then they are asked to pick a goal so that we can show them the right things first', 'then pick a goal so we can show them the most relevant features first'],
  ['We removed three of the steps that people told us were confusing or that felt like a waste of time', 'We removed three steps that users called confusing or slow'],
  ['and we also made the progress bar more visible so that people know how far along they are', 'and made the progress bar more visible so people always know where they are'],
  ['In testing with twelve customers the completion rate went up from sixty percent to eighty one percent', 'In tests with twelve customers, completion rose from 60% to 81%'],
  ['which is a really big improvement and much more than we were expecting when we started the project', 'well beyond what we expected when we started'],
  ['There are still some problems that we need to fix before we can launch it to everyone', 'A few problems remain before we launch to everyone'],
  ['for example the import step is still too slow when people have a lot of data to bring in', 'such as the import step, which is still slow for large data sets'],
  ['and some of the text on the last screen is hard to read on smaller laptop screens', 'and text on the final screen that is hard to read on small laptops'],
  ['We would like to get feedback from the design team and from support before the end of next week', 'We would like feedback from design and support by the end of next week'],
  ['so that we have enough time to make changes before the planned launch date at the start of next month', 'so there is time to make changes before the launch early next month'],
  ['Please leave your comments directly in the document or send them to me in a message', 'Please comment in the document or send me a message'],
  ['and I will make sure that every single one of them is read and answered by the team', 'and the team will read and reply to every comment'],
];
// Pieces pair up into sentences: odd-indexed pieces end one.
const join = (pick) => sentences.map((s, i) => pick(s) + (i % 2 ? '.' : '')).join(' ');
export const REWRITE_ORIGINAL = join(([a]) => a);
export const REWRITE_IMPROVED = join(([, b]) => b);
export const REWRITE_WORDS = REWRITE_ORIGINAL.split(/\s+/).length;

export const FILL_DESCRIPTION = 'Customers on the Team plan cannot export invoices as PDF since yesterday; the button spins forever. Urgent for finance month-end.';
export const FILL_OBJECT = {
  title: 'Invoice PDF export hangs for Team plan',
  category: 'Bug',
  tags: ['billing', 'export', 'pdf'],
  summary: 'Since yesterday the PDF export on invoices never completes for Team plan customers, blocking month-end close for finance.',
};

const sleep = (ms, signal) => new Promise((resolve, reject) => {
  const t = setTimeout(resolve, ms);
  signal?.addEventListener('abort', () => { clearTimeout(t); reject(new DOMException('Aborted', 'AbortError')); });
});
export const chunk = (text, size = 4) => text.match(new RegExp(`[\\s\\S]{1,${size}}`, 'g')) ?? [];

// A ReadableStream that emits `pieces` every CHUNK_MS after LATENCY_MS, stopping on abort.
function streamOf(pieces, signal, encode = (p) => p) {
  const enc = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        await sleep(LATENCY_MS, signal);
        for (const p of pieces) { await sleep(CHUNK_MS, signal); controller.enqueue(enc.encode(encode(p))); }
        controller.close();
      } catch { controller.error(new DOMException('Aborted', 'AbortError')); }
    },
  });
}

// AI SDK UI message stream (SSE) with optional data parts before the text.
export function uiMessageStream(text, signal, dataParts = []) {
  const id = 'txt-1';
  const parts = [{ type: 'start' }, { type: 'start-step' }, ...dataParts, { type: 'text-start', id },
    ...chunk(text).map((delta) => ({ type: 'text-delta', id, delta })), { type: 'text-end', id }, { type: 'finish-step' }, { type: 'finish' }];
  return new Response(streamOf([...parts.map((p) => `data: ${JSON.stringify(p)}\n\n`), 'data: [DONE]\n\n'], signal),
    { headers: { 'content-type': 'text/event-stream', 'x-vercel-ai-ui-message-stream': 'v1' } });
}

export const textStream = (text, signal) => new Response(streamOf(chunk(text), signal), { headers: { 'content-type': 'text/plain; charset=utf-8' } });

// Route table → Response. Kits call their documented endpoints; we answer them here.
export function installFetchMock(routes) {
  const b = (window.__bench ??= {});
  b.calls ??= {}; b.aborted ??= {}; b.bodies ??= {};
  const original = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    const path = new URL(url, location.href).pathname;
    const route = routes[path];
    if (!route) return original(input, init);
    b.calls[path] = (b.calls[path] ?? 0) + 1;
    b.bodies[path] = init.body ?? null;
    init.signal?.addEventListener('abort', () => { b.aborted[path] = (b.aborted[path] ?? 0) + 1; });
    return route({ init, signal: init.signal, body: init.body ? JSON.parse(init.body) : null });
  };
  return { sleep };
}
export { sleep };
