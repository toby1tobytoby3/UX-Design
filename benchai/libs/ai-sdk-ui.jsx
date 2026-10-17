// Vercel AI SDK UI: useChat (hook only) + react-markdown, the plain renderer most hand-built chats use.
import React from 'react';
import { createRoot } from 'react-dom/client';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { initBench } from '../mock.js';
import { AiSdkChat, AISDK_SELECTORS, AISDK_LEVELS } from './_aisdk-chat.jsx';

initBench('Vercel AI SDK UI (useChat + react-markdown)', AISDK_SELECTORS);
window.__bench.levels = { ...AISDK_LEVELS, markdown: 'react-markdown (yours)' };
const Md = ({ children }) => <Markdown remarkPlugins={[remarkGfm]}>{children}</Markdown>;
createRoot(document.getElementById('app')).render(<AiSdkChat Markdown={Md} />);
window.__bench.ready = true;
