import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import Container from './Container';

export type SectionTone = 'white' | 'muted' | 'dark';

type SectionProps = {
  children: ReactNode;
  tone?: SectionTone;
  /** band = thin strip (py-8 md:py-10). */
  size?: 'default' | 'band';
  id?: string;
  className?: string;
  containerClassName?: string;
  labelledBy?: string;
};

const tones: Record<SectionTone, string> = {
  white: 'bg-white',
  muted: 'bg-ink-50',
  dark: 'bg-primary-950 text-white/80',
};

export default function Section({
  children,
  tone = 'white',
  size = 'default',
  id,
  className,
  containerClassName,
  labelledBy,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(size === 'band' ? 'py-8 md:py-10' : 'py-16 md:py-24', tones[tone], className)}
    >
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
