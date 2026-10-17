// Size probe: the AI SDK useChat hook on its own, with no markdown renderer.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { useChat } from '@ai-sdk/react';
function App() { const { messages } = useChat(); return <div>{messages.length}</div>; }
createRoot(document.body).render(<App />);
