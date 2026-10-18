// Stand-in for shadcn's Command (a styled wrapper around cmdk); same cmdk primitives, no styling.
import * as React from 'react';
import { Command as C } from 'cmdk';
export const Command = (p: any) => <C {...p} />;
export const CommandList = (p: any) => <C.List {...p} />;
export const CommandGroup = (p: any) => <C.Group {...p} />;
export const CommandItem = (p: any) => <C.Item {...p} />;
export const CommandInput = (p: any) => <C.Input {...p} />;
export const CommandEmpty = (p: any) => <C.Empty {...p} />;
