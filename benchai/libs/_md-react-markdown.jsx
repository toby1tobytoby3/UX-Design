// Size probe: react-markdown + remark-gfm on its own (compared with Streamdown in results.json).
import React from 'react';
import { createRoot } from 'react-dom/client';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
createRoot(document.body).render(<Markdown remarkPlugins={[remarkGfm]}>{'**hi**'}</Markdown>);
