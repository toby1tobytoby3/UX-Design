// BlockNote + @blocknote/xl-ai (GPL-3.0 or a paid BlockNote Business licence for closed source). Wired as its docs
// show: AIExtension with a transport, the AI menu controller, the AI button in the formatting toolbar and the AI slash
// menu items. Offline: ClientSideTransport runs a mock model (xl-ai bundles its own AI SDK v6, so the mock comes from
// that copy) that answers with the same rewrite as every other kit, as an applyDocumentOperations tool call.
import React from 'react';
import '@blocknote/mantine/style.css';
import '@blocknote/xl-ai/style.css';
import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote, FormattingToolbar, FormattingToolbarController, getFormattingToolbarItems,
  SuggestionMenuController, getDefaultReactSlashMenuItems } from '@blocknote/react';
import { filterSuggestionItems } from '@blocknote/core/extensions';
import { en } from '@blocknote/core/locales';
import { AIExtension, AIMenuController, AIToolbarButton, getAISlashMenuItems, ClientSideTransport } from '@blocknote/xl-ai';
import { en as aiEn } from '@blocknote/xl-ai/locales';
import { MockLanguageModelV3, simulateReadableStream } from '../node_modules/@blocknote/xl-ai/node_modules/ai/dist/test/index.mjs';
import { renderBench } from './_shell.jsx';
import { chunk, LATENCY_MS, REWRITE_ORIGINAL, REWRITE_IMPROVED } from '../mock.js';

const b = (window.__bench ??= {});
b.calls ??= {}; b.aborted ??= {};

// The mock "model": count the call, then stream an update of the selected block (ids carry a trailing $).
const model = new MockLanguageModelV3({
  doStream: async ({ prompt, abortSignal }) => {
    b.calls.model = (b.calls.model ?? 0) + 1;
    abortSignal?.addEventListener('abort', () => { b.aborted.model = (b.aborted.model ?? 0) + 1; });
    const id = JSON.stringify(prompt).match(/\\"id\\":\\"([^\\"]+\$)\\"/)?.[1] ?? 'p1$';
    const input = JSON.stringify({ operations: [{ type: 'update', id, block: `<p>${REWRITE_IMPROVED}</p>` }] });
    const call = 'call-1';
    return {
      stream: simulateReadableStream({ initialDelayInMs: LATENCY_MS, chunkDelayInMs: 8, chunks: [
        { type: 'stream-start', warnings: [] },
        { type: 'tool-input-start', id: call, toolName: 'applyDocumentOperations' },
        ...chunk(input, 6).map((delta) => ({ type: 'tool-input-delta', id: call, delta })),
        { type: 'tool-input-end', id: call },
        { type: 'tool-call', toolCallId: call, toolName: 'applyDocumentOperations', input },
        { type: 'finish', finishReason: { unified: 'tool-calls', raw: 'tool_use' }, usage: { inputTokens: { total: 10 }, outputTokens: { total: 10 } } },
      ] }),
    };
  },
});

function Editor({ id, text }) {
  const editor = useCreateBlockNote({
    dictionary: { ...en, ai: aiEn },
    extensions: [AIExtension({ transport: new ClientSideTransport({ model }) })],
    initialContent: [{ id, type: 'paragraph', content: text }],
  });
  return (
    <BlockNoteView editor={editor} formattingToolbar={false} slashMenu={false} theme="light">
      <AIMenuController />
      <FormattingToolbarController formattingToolbar={() => <FormattingToolbar>{...getFormattingToolbarItems()}<AIToolbarButton /></FormattingToolbar>} />
      <SuggestionMenuController triggerCharacter="/" getItems={async (q) => filterSuggestionItems([...getDefaultReactSlashMenuItems(editor), ...getAISlashMenuItems(editor)], q)} />
    </BlockNoteView>
  );
}

renderBench('BlockNote + @blocknote/xl-ai', {
  rewrite: () => <Editor id="p1" text={REWRITE_ORIGINAL} />,
  command: () => <Editor id="c1" text="Thanks for the update, I will review it tomorrow." />,
}, {
  ghost: 'No ghost-text autocomplete in @blocknote/xl-ai 0.56: its AI works through the AI menu.',
  fill: 'No structured form fill: BlockNote AI edits document blocks only.',
});
window.__bench.config = {
  rewrite: { field: '#rewrite .bn-editor', toolbarButton: 'button[aria-label="Edit with AI"], [data-test="editwithAI"]', preset: '[role=option]:has-text("Improve Writing"), [role=menuitem]:has-text("Improve Writing")' },
  command: { field: '#command .bn-editor', slash: '/ai', menuInput: '.bn-combobox-input input, .bn-ai-menu input, [placeholder*="Ask AI"]' },
};
