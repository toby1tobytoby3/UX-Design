// Stub for the registry's BlockSelection overlay (it needs @platejs/dnd); a plain highlight is enough here.
import * as React from 'react';
import { useBlockSelected } from '@platejs/selection/react';
export function BlockSelection() {
  const selected = useBlockSelected();
  return selected ? <div className="block-selected" contentEditable={false} /> : null;
}
