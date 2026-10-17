// The minimal chat a developer writes on top of the AI SDK's useChat hook (it ships no UI).
// Shared by ai-sdk-ui (react-markdown) and streamdown (Streamdown), so only the markdown renderer differs.
// Controls here are thin buttons over the hook's own functions: stop(), regenerate(), addToolApprovalResponse().
import React, { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { lastAssistantMessageIsCompleteWithApprovalResponses } from 'ai';
import { mockTransport } from '../aisdk-transport.js';

const transport = mockTransport();

export function AiSdkChat({ Markdown }) {
  const { messages, sendMessage, status, stop, regenerate, addToolApprovalResponse } = useChat({
    transport, sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
  });
  const [input, setInput] = useState('');
  const busy = status === 'submitted' || status === 'streaming';
  const submit = () => { if (!input.trim()) return; sendMessage({ text: input }); setInput(''); };
  return (
    <div className="chat">
      <div className="scroller">
        {messages.map((m, i) => (
          <div key={m.id} className={`msg ${m.role}`}>
            {m.parts.map((p, j) => {
              if (p.type === 'text') return m.role === 'user' ? <span key={j}>{p.text}</span> : <div key={j} className="md"><Markdown>{p.text}</Markdown></div>;
              if (p.type === 'source-url') return null;
              if (p.type === 'tool-delete_branch' && p.state === 'approval-requested') return (
                <div key={j} className="approval" data-tool="delete_branch">
                  <span>Delete <b>{p.input.branch}</b>? ({p.input.reason})</span>
                  <button data-b="approve" onClick={() => addToolApprovalResponse({ id: p.approval.id, approved: true })}>Approve</button>
                  <button data-b="deny" onClick={() => addToolApprovalResponse({ id: p.approval.id, approved: false })}>Deny</button>
                </div>);
              if (p.type.startsWith('tool-')) return (
                <details key={j} className="step" data-tool={p.type.slice(5)}>
                  <summary>{p.type.slice(5)} · {p.state}</summary>
                  <pre>{JSON.stringify(p.input)}</pre>{p.output && <pre>{JSON.stringify(p.output, null, 1)}</pre>}
                </details>);
              return null;
            })}
            {m.parts.some((p) => p.type === 'source-url') && (
              <div className="sources">{m.parts.filter((p) => p.type === 'source-url').map((p) => <a key={p.sourceId} href={p.url}>{p.title}</a>)}</div>)}
            {m.role === 'assistant' && i === messages.length - 1 && !busy && (
              <div className="actions"><button data-b="retry" onClick={() => regenerate()}>Retry</button></div>)}
          </div>
        ))}
      </div>
      <form className="composer" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <textarea placeholder="Message" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); } }} />
        {busy ? <button type="button" data-b="stop" onClick={() => stop()}>Stop</button> : <button type="submit" data-b="send">Send</button>}
      </form>
    </div>
  );
}

export const AISDK_SELECTORS = { composer: '.composer textarea', send: '[data-b=send]', stop: '[data-b=stop]', retry: '[data-b=retry]',
  edit: null, branch: null, scroller: '.scroller', transcript: '.scroller', approve: '[data-b=approve]', deny: '[data-b=deny]' };
// What the kit itself provides for each control/task: 'ui' (rendered by the kit), 'render-api' (kit slot, your markup),
// 'data' (typed parts/functions only; you write the UI), false (not supported).
export const AISDK_LEVELS = { stop: 'data', retry: 'data', edit: false, branch: false, stick: false,
  steps: 'data', approval: 'data', citations: 'data', markdown: 'yours' };
