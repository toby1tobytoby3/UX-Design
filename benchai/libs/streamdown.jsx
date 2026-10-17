// Streamdown (Vercel): a drop-in react-markdown replacement for streaming. Same useChat chat as ai-sdk-ui,
// only the markdown renderer changes, so the difference in flicker and main-thread time is Streamdown's.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Streamdown } from 'streamdown';
import { initBench } from '../mock.js';
import { AiSdkChat, AISDK_SELECTORS, AISDK_LEVELS } from './_aisdk-chat.jsx';

initBench('Streamdown (in the same useChat chat)', AISDK_SELECTORS);
window.__bench.levels = { ...AISDK_LEVELS, markdown: 'streamdown' };
const Md = ({ children }) => <Streamdown>{children}</Streamdown>;
createRoot(document.getElementById('app')).render(<AiSdkChat Markdown={Md} />);
window.__bench.ready = true;
