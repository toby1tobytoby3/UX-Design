// Mock ChatTransport for kits built on the Vercel AI SDK's useChat (ai-sdk-ui, streamdown, llamaindex-chat-ui).
// Converts the kit-neutral events from mock.js into AI SDK UI message chunks. `style: 'llamaindex'` emits the
// tool step and sources as LlamaIndex's own data parts (data-event, data-sources), which is what that kit renders.
import { play } from './mock.js';

export function mockTransport({ style = 'aisdk' } = {}) {
  return {
    async sendMessages({ messages, abortSignal }) {
      const last = messages.at(-1);
      const answered = last?.role === 'assistant' && last.parts.find((p) => p.type === 'tool-delete_branch' && p.state === 'approval-responded');
      const afterApproval = answered ? (answered.approval.approved ? 'approved' : 'denied') : undefined;
      return new ReadableStream({
        async start(c) {
          const put = (chunk) => c.enqueue(chunk);
          const sources = [];
          if (!afterApproval) put({ type: 'start' });
          put({ type: 'start-step' });
          if (afterApproval === 'approved') put({ type: 'tool-output-available', toolCallId: answered.toolCallId, output: { deleted: 'feature/old-nav' } });
          if (afterApproval === 'denied') put({ type: 'tool-output-denied', toolCallId: answered.toolCallId });
          try {
            for await (const ev of play({ signal: abortSignal, afterApproval })) {
              if (ev.type === 'tool-start') {
                if (style === 'llamaindex') put({ type: 'data-event', id: ev.id, data: { title: `Calling ${ev.name}`, description: JSON.stringify(ev.args), status: 'pending' } });
                else put({ type: 'tool-input-available', toolCallId: ev.id, toolName: ev.name, input: ev.args });
              } else if (ev.type === 'tool-result') {
                if (style === 'llamaindex') put({ type: 'data-event', id: ev.id, data: { title: `Called ${ev.name}`, description: JSON.stringify(ev.args), status: 'success', data: ev.result } });
                else put({ type: 'tool-output-available', toolCallId: ev.id, output: ev.result });
              } else if (ev.type === 'text-start' || ev.type === 'text-end') put({ type: ev.type, id: ev.id });
              else if (ev.type === 'text-delta') put({ type: 'text-delta', id: ev.id, delta: ev.delta });
              else if (ev.type === 'source') {
                if (style === 'llamaindex') sources.push(ev);
                else put({ type: 'source-url', sourceId: ev.id, url: ev.url, title: ev.title });
                if (style === 'llamaindex' && sources.length === 2) put({ type: 'data-sources', id: 'sources', data: { nodes: sources.map((s) => ({ id: s.id, url: s.url, text: s.title, metadata: { title: s.title, URL: s.url } })) } });
              } else if (ev.type === 'approval-request') {
                put({ type: 'finish-step' }); put({ type: 'start-step' });
                put({ type: 'tool-input-available', toolCallId: ev.id, toolName: ev.name, input: ev.args });
                put({ type: 'tool-approval-request', approvalId: `approval_${ev.id}`, toolCallId: ev.id });
              } else if (ev.type === 'finish') { put({ type: 'finish-step' }); put({ type: 'finish' }); }
            }
          } catch (err) {
            if (err.name !== 'AbortError') throw err;
          }
          try { c.close(); } catch {}
        },
      });
    },
    async reconnectToStream() { return null; },
  };
}
