// Size probe: Streamdown on its own (compared with react-markdown in results.json).
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Streamdown } from 'streamdown';
createRoot(document.body).render(<Streamdown>{'**hi**'}</Streamdown>);
