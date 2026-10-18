// Stand-in for shadcn's `cn` (clsx + tailwind-merge); merging is irrelevant here, joining class names is enough.
import { clsx } from 'clsx';
export const cn = (...inputs: any[]) => clsx(inputs);
