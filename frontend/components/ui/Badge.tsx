import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone = 'new' | 'important' | 'neutral' | 'info';

const tones: Record<BadgeTone, string> = {
  new: 'bg-danger-700 text-white',
  important: 'bg-gold-100 text-primary-950',
  neutral: 'bg-ink-100 text-ink-700',
  info: 'bg-primary-100 text-primary-800',
};

type BadgeProps = { children: ReactNode; tone?: BadgeTone; className?: string };

export default function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold', tones[tone], className)}>
      {children}
    </span>
  );
}
