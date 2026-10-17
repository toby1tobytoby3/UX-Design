// assistant-ui: unstyled primitives (Radix-style) over its own runtime. Local runtime with a ChatModelAdapter
// that streams from the mock. Markdown via its own @assistant-ui/react-markdown. Styling is ours (the kit's
// styled components are installed as shadcn-registry source, which our stack doesn't use).
import React from 'react';
import { createRoot } from 'react-dom/client';
import { AssistantRuntimeProvider, useLocalRuntime, ThreadPrimitive, MessagePrimitive, ComposerPrimitive,
  ActionBarPrimitive, BranchPickerPrimitive } from '@assistant-ui/react';
import { MarkdownTextPrimitive } from '@assistant-ui/react-markdown';
import remarkGfm from 'remark-gfm';
import { play, initBench } from '../mock.js';

initBench('assistant-ui (primitives + local runtime)', {
  composer: '.composer textarea', send: '[data-b=send]', stop: '[data-b=stop]', retry: '[data-b=retry]', edit: '[data-b=edit]',
  branch: '[data-b=branch]', scroller: '.scroller', transcript: '.scroller', approve: '[data-b=approve]', deny: '[data-b=deny]',
});
window.__bench.levels = { stop: 'ui', retry: 'ui', edit: 'ui', branch: 'ui', stick: 'ui', steps: 'render-api', approval: 'render-api',
  citations: 'render-api', markdown: '@assistant-ui/react-markdown' };

// Converts mock events into assistant-ui content parts (it wants the full content array on every yield).
const adapter = {
  async *run({ messages, abortSignal, unstable_getMessage }) {
    // A continuation after addResult() runs on the same assistant message, which is not in `messages`.
    const current = unstable_getMessage?.();
    const prev = (current?.content ?? []).find((p) => p.type === 'tool-call' && p.toolName === 'delete_branch' && p.result);
    const afterApproval = prev ? (prev.result.approved ? 'approved' : 'denied') : undefined;
    const parts = []; const texts = {};
    const toolPart = (ev, result) => ({ type: 'tool-call', toolCallId: ev.id, toolName: ev.name, args: ev.args, argsText: JSON.stringify(ev.args), ...(result ? { result } : {}) });
    try {
      for await (const ev of play({ signal: abortSignal, afterApproval })) {
        if (ev.type === 'tool-start') parts.push(toolPart(ev));
        else if (ev.type === 'tool-result') parts[parts.findIndex((p) => p.toolCallId === ev.id)] = toolPart(ev, ev.result);
        else if (ev.type === 'text-start') { texts[ev.id] = parts.length; parts.push({ type: 'text', text: '' }); }
        else if (ev.type === 'text-delta') { const i = texts[ev.id]; parts[i] = { type: 'text', text: parts[i].text + ev.delta }; }
        else if (ev.type === 'source') parts.push({ type: 'source', sourceType: 'url', id: ev.id, url: ev.url, title: ev.title });
        else if (ev.type === 'approval-request') parts.push(toolPart(ev));
        else continue;
        yield { content: [...parts] };
      }
      // The documented local-runtime pattern for a human-in-the-loop tool: pause with requires-action and let
      // addResult() continue the run (the tool is also listed in unstable_humanToolNames).
      if (parts.some((p) => p.type === 'tool-call' && p.toolName === 'delete_branch' && !p.result)) {
        yield { content: [...parts], status: { type: 'requires-action', reason: 'tool-calls' } };
      }
    } catch (err) { if (err.name !== 'AbortError') throw err; }
  },
};

const MarkdownText = () => <MarkdownTextPrimitive className="md" remarkPlugins={[remarkGfm]} />;
const ToolStep = ({ toolName, args, result, status }) => (
  <details className="step" data-tool={toolName}><summary>{toolName} · {status.type}</summary>
    <pre>{JSON.stringify(args)}</pre>{result && <pre>{JSON.stringify(result, null, 1)}</pre>}</details>);
const Approval = ({ args, result, addResult, status }) => result ? <div className="step" data-tool="delete_branch">delete_branch · {result.approved ? 'approved' : 'denied'}</div> : (
  <div className="approval" data-tool="delete_branch" data-status={status.type}><span>Delete <b>{args.branch}</b>? ({args.reason})</span>
    <button data-b="approve" onClick={() => addResult({ approved: true })}>Approve</button>
    <button data-b="deny" onClick={() => addResult({ approved: false })}>Deny</button></div>);
const Source = ({ url, title }) => <a className="source" href={url}>{title}</a>;

const UserMessage = () => (
  <MessagePrimitive.Root className="msg user"><MessagePrimitive.Parts />
    <ActionBarPrimitive.Root className="actions"><ActionBarPrimitive.Edit data-b="edit">Edit</ActionBarPrimitive.Edit></ActionBarPrimitive.Root>
  </MessagePrimitive.Root>);
const AssistantMessage = () => (
  <MessagePrimitive.Root className="msg assistant">
    <MessagePrimitive.Parts components={{ Text: MarkdownText, Source, tools: { by_name: { delete_branch: Approval }, Fallback: ToolStep } }} />
    <div className="actions">
      <BranchPickerPrimitive.Root hideWhenSingleBranch data-b="branch"><BranchPickerPrimitive.Previous>‹</BranchPickerPrimitive.Previous>
        <BranchPickerPrimitive.Number />/<BranchPickerPrimitive.Count /><BranchPickerPrimitive.Next>›</BranchPickerPrimitive.Next></BranchPickerPrimitive.Root>
      <ActionBarPrimitive.Root hideWhenRunning><ActionBarPrimitive.Reload data-b="retry">Retry</ActionBarPrimitive.Reload>
        <ActionBarPrimitive.Copy>Copy</ActionBarPrimitive.Copy></ActionBarPrimitive.Root>
    </div>
  </MessagePrimitive.Root>);
const EditComposer = () => (
  <ComposerPrimitive.Root className="composer"><ComposerPrimitive.Input /><ComposerPrimitive.Cancel>Cancel</ComposerPrimitive.Cancel>
    <ComposerPrimitive.Send>Update</ComposerPrimitive.Send></ComposerPrimitive.Root>);

function App() {
  const runtime = useLocalRuntime(adapter, { unstable_humanToolNames: ['delete_branch'] });
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ThreadPrimitive.Root className="chat">
        <ThreadPrimitive.Viewport className="scroller">
          <ThreadPrimitive.Messages components={{ UserMessage, AssistantMessage, EditComposer }} />
        </ThreadPrimitive.Viewport>
        <ComposerPrimitive.Root className="composer">
          <ComposerPrimitive.Input placeholder="Message" />
          <ThreadPrimitive.If running={false}><ComposerPrimitive.Send data-b="send">Send</ComposerPrimitive.Send></ThreadPrimitive.If>
          <ThreadPrimitive.If running><ComposerPrimitive.Cancel data-b="stop">Stop</ComposerPrimitive.Cancel></ThreadPrimitive.If>
        </ComposerPrimitive.Root>
      </ThreadPrimitive.Root>
    </AssistantRuntimeProvider>);
}
createRoot(document.getElementById('app')).render(<App />);
window.__bench.ready = true;
