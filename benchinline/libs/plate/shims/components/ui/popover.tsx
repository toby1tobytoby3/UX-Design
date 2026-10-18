// Stand-in for shadcn's Popover (a styled wrapper around Radix Popover); same Radix primitives, portalled content.
import * as React from 'react';
import { Popover as P } from 'radix-ui';
export const Popover = (p: any) => <P.Root {...p} />;
export const PopoverTrigger = (p: any) => <P.Trigger {...p} />;
export const PopoverAnchor = (p: any) => <P.Anchor {...p} />;
export const PopoverContent = ({ align = 'center', sideOffset = 4, className, ...p }: any) => (
  <P.Portal><P.Content align={align} sideOffset={sideOffset} className={['popover', className].filter(Boolean).join(' ')} {...p} /></P.Portal>
);
