import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Wrapper for HTML coming from WordPress. Styles live in globals.css (.prose-snc). */
export default function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('prose-snc', className)}>{children}</div>;
}
