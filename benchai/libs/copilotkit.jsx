// CopilotKit v2: <CopilotChat> over an AG-UI agent. Instead of its runtime server, a self-managed client-side
// agent replays the mock as AG-UI events. Tool steps use its default tool renderer; approval uses useHumanInTheLoop.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Observable } from 'rxjs';
import { CopilotKitProvider, CopilotChat, AbstractAgent, EventType, useHumanInTheLoop, useDefaultRenderTool } from '@copilotkit/react-core/v2';
import '@copilotkit/react-core/v2/styles.css';
import { play, initBench } from '../mock.js';

initBench('CopilotKit (CopilotChat + self-managed AG-UI agent)', window.__SEL ?? {});
window.__bench.levels = { stop: 'ui', retry: 'ui', edit: 'ui', branch: false, stick: 'ui', steps: 'ui', approval: 'render-api',
  citations: false, markdown: 'built in (Streamdown)' };

class MockAgent extends AbstractAgent {
  run(input) {
    return new Observable((sub) => {
      const ctrl = new AbortController();
      const last = input.messages.at(-1);
      const afterApproval = last?.role === 'tool' ? (/"approved":\s*false/.test(last.content) ? 'denied' : 'approved') : undefined;
      const emit = (e) => sub.next(e);
      (async () => {
        emit({ type: EventType.RUN_STARTED, threadId: input.threadId, runId: input.runId });
        let msgId;
        try {
          for await (const ev of play({ signal: ctrl.signal, afterApproval })) {
            if (ev.type === 'tool-start' || ev.type === 'approval-request') {
              emit({ type: EventType.TOOL_CALL_START, toolCallId: ev.id, toolCallName: ev.name, parentMessageId: `m_${ev.id}` });
              emit({ type: EventType.TOOL_CALL_ARGS, toolCallId: ev.id, delta: JSON.stringify(ev.args) });
              emit({ type: EventType.TOOL_CALL_END, toolCallId: ev.id });
            } else if (ev.type === 'tool-result') {
              emit({ type: EventType.TOOL_CALL_RESULT, messageId: `r_${ev.id}`, toolCallId: ev.id, content: JSON.stringify(ev.result), role: 'tool' });
            } else if (ev.type === 'text-start') { msgId = `${ev.id}_${input.runId}`; emit({ type: EventType.TEXT_MESSAGE_START, messageId: msgId, role: 'assistant' }); }
            else if (ev.type === 'text-delta') emit({ type: EventType.TEXT_MESSAGE_CONTENT, messageId: msgId, delta: ev.delta });
            else if (ev.type === 'text-end') emit({ type: EventType.TEXT_MESSAGE_END, messageId: msgId });
            // 'source' events: AG-UI has no citation/source event type, so they are dropped (citations unsupported).
          }
          emit({ type: EventType.RUN_FINISHED, threadId: input.threadId, runId: input.runId });
          sub.complete();
        } catch (err) { if (err.name === 'AbortError') sub.complete(); else sub.error(err); }
      })();
      return () => ctrl.abort();
    });
  }
}
const agent = new MockAgent({ agentId: 'default' });

function Tools() {
  useDefaultRenderTool();
  useHumanInTheLoop({
    name: 'delete_branch', description: 'Delete a git branch',
    render: ({ args, status, respond, result }) => (
      <div className="approval" data-tool="delete_branch">
        <span>Delete <b>{args.branch}</b>? ({args.reason})</span>
        {status === 'executing' && respond ? <>
          <button data-b="approve" onClick={() => respond({ approved: true })}>Approve</button>
          <button data-b="deny" onClick={() => respond({ approved: false })}>Deny</button></> : <span>{result ? 'answered' : status}</span>}
      </div>),
  });
  return null;
}
createRoot(document.getElementById('app')).render(
  <CopilotKitProvider selfManagedAgents={{ default: agent }} showDevConsole={false}>
    <Tools />
    <div style={{ height: '100%' }}><CopilotChat agentId="default" labels={{ chatInputPlaceholder: 'Message' }} /></div>
  </CopilotKitProvider>);
window.__bench.ready = true;
