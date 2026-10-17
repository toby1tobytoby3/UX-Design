// Baseline: React 19 + react-dom rendering one element. Subtracted from React libraries' bundles.
import React from 'react';
import { createRoot } from 'react-dom/client';
createRoot(document.body).render(<div>baseline</div>);
