// Vendored unchanged from the Plate registry (https://platejs.org/r/cursor-overlay-kit.json, MIT) for the benchmark.
'use client';

import { CursorOverlayPlugin } from '@platejs/selection/react';

import { CursorOverlay } from '@/registry/ui/cursor-overlay';

export const CursorOverlayKit = [
  CursorOverlayPlugin.configure({
    render: {
      afterEditable: () => <CursorOverlay />,
    },
  }),
];
