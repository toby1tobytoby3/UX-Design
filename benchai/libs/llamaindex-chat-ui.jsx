// LlamaIndex chat-ui: shadcn-styled components driven by the AI SDK's useChat. Tool steps and citations use
// its own data parts (data-event, data-sources), which the mock transport emits in that shape.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { useChat } from '@ai-sdk/react';
import { ChatSection } from '@llamaindex/chat-ui';
import { initBench } from '../mock.js';
import { mockTransport } from '../aisdk-transport.js';

initBench('LlamaIndex chat-ui (ChatSection + useChat)', {
  composer: 'textarea', send: 'button[type=submit]', stop: 'button:has-text("Stop generating")', retry: 'button[title=Regenerate], button:has-text("Regenerate")',
  edit: null, branch: null, scroller: '#app .overflow-auto', transcript: '#app .overflow-auto', approve: null, deny: null,
});
window.__bench.levels = { stop: 'ui', retry: 'ui', edit: false, branch: false, stick: 'ui', steps: 'ui', approval: false,
  citations: 'ui', markdown: 'built in (react-markdown 8 + highlight.js + katex)' };
const transport = mockTransport({ style: 'llamaindex' });
function App() {
  const handler = useChat({ transport });
  return <ChatSection handler={handler} className="h-full" />;
}
createRoot(document.getElementById('app')).render(<App />);
window.__bench.ready = true;
