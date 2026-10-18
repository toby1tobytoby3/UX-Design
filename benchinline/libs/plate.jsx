// Plate + @platejs/ai, wired with the Plate registry's own kits (vendored in libs/plate/registry, MIT): CopilotKit
// (ghost text), AIKit (⌘J AI menu, streaming edits as suggestions), SuggestionKit (inline diff), BlockSelectionKit.
// Only the shadcn primitives (Button, Command, Popover) are thin shims over the same cmdk and Radix parts, and the
// comment/discussion UI is stubbed because comments aren't benchmarked. The model routes the registry calls
// (/api/ai/copilot, /api/ai/command) are answered by the shared mock.
import React from 'react';
import { Plate, PlateContent, usePlateEditor } from 'platejs/react';
import { CopilotKit } from '@/registry/components/editor/plugins/copilot-kit';
import { AIKit } from '@/registry/components/editor/plugins/ai-kit';
import { SuggestionKit } from '@/registry/components/editor/plugins/suggestion-kit';
import { BlockSelectionKit } from '@/registry/components/editor/plugins/block-selection-kit';
import { DiscussionKit } from '@/registry/components/editor/plugins/discussion-kit';
import { CommentKit } from '@/registry/components/editor/plugins/comment-kit';
import { renderBench } from './_shell.jsx';
import { installFetchMock, uiMessageStream, sleep, LATENCY_MS, GHOST_TEXT, REWRITE_ORIGINAL, REWRITE_IMPROVED } from '../mock.js';

installFetchMock({
  '/api/ai/copilot': async ({ signal }) => { await sleep(LATENCY_MS, signal); return Response.json({ text: GHOST_TEXT }); },
  '/api/ai/command': ({ signal }) => uiMessageStream(REWRITE_IMPROVED, signal, [{ type: 'data-toolName', data: 'edit' }]),
});

const p = (text) => [{ type: 'p', children: [{ text }] }];
const AI_PLUGINS = [...DiscussionKit, ...CommentKit, ...SuggestionKit, ...BlockSelectionKit, ...AIKit];

function Editor({ label, value, plugins }) {
  const editor = usePlateEditor({ plugins, value });
  return <Plate editor={editor}><PlateContent aria-label={label} placeholder="Type here…" /></Plate>;
}

renderBench('Plate + @platejs/ai (registry kits)', {
  ghost: () => <Editor label="Update" value={p('')} plugins={[...CopilotKit]} />,
  rewrite: () => <Editor label="Release notes" value={p(REWRITE_ORIGINAL)} plugins={AI_PLUGINS} />,
  command: () => <Editor label="Draft" value={p('Thanks for the update, I will review it tomorrow.')} plugins={AI_PLUGINS} />,
}, { fill: 'No structured form fill: Plate AI works on editor content. Use the AI SDK useObject (see ai-sdk-inline).' });
window.__bench.config = {
  ghost: { field: '#ghost [data-slate-editor]' },
  rewrite: { field: '#rewrite [data-slate-editor]', open: 'Control+j', preset: '[cmdk-item]:has-text("Improve writing")' },
  command: { field: '#command [data-slate-editor]', open: 'Control+j', menuInput: '[cmdk-input]' },
};
