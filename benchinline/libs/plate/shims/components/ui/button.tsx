// Minimal stand-in for shadcn's Button: a native <button> with the same props surface.
import * as React from 'react';
export function Button({ variant, size, asChild, className, ...props }: any) {
  return <button type="button" className={['btn', variant && `btn-${variant}`, className].filter(Boolean).join(' ')} {...props} />;
}
