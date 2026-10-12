import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import Button from './Button';

type SectionHeaderProps = {
  title: ReactNode;
  eyebrow?: string;
  description?: ReactNode;
  align?: 'left' | 'center';
  action?: { label: string; href: string };
  /** Use on dark backgrounds. */
  invert?: boolean;
  /** id for the heading, for aria-labelledby. */
  id?: string;
  as?: 'h1' | 'h2';
  className?: string;
};

export default function SectionHeader({
  title,
  eyebrow,
  description,
  align = 'left',
  action,
  invert = false,
  id,
  as: Heading = 'h2',
  className,
}: SectionHeaderProps) {
  const centered = align === 'center';

  const text = (
    <div className={cn(centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl')}>
      {eyebrow && (
        <p
          className={cn(
            'mb-3 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em]',
            centered && 'justify-center',
            invert ? 'text-gold-400' : 'text-primary-800',
          )}
        >
          {!centered && <span aria-hidden="true" className="h-0.5 w-8 bg-gold-500" />}
          {eyebrow}
        </p>
      )}
      <Heading
        id={id}
        className={cn(
          'font-serif text-[1.75rem] font-bold leading-snug md:text-4xl md:leading-tight',
          invert ? 'text-white' : 'text-ink-900',
        )}
      >
        {title}
      </Heading>
      {centered && <span aria-hidden="true" className="mx-auto mt-5 block h-0.5 w-12 bg-gold-500" />}
      {description && (
        <div className={cn('mt-4 text-base leading-relaxed md:text-lg', invert ? 'text-white/80' : 'text-ink-700')}>
          {description}
        </div>
      )}
    </div>
  );

  if (action && !centered) {
    return (
      <div className={cn('mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between', className)}>
        {text}
        <Button href={action.href} variant="link" className="shrink-0">
          {action.label}
        </Button>
      </div>
    );
  }

  return <div className={cn('mb-10 md:mb-14', className)}>{text}</div>;
}
