import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

type AccordionProps = {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  /** Small text at the right of the summary, e.g. "2026-27". */
  meta?: ReactNode;
  /** Render the title as a heading when the accordion is a document section (keeps heading order intact). */
  titleAs?: 'span' | 'h2' | 'h3';
  className?: string;
};

/** One accordion item on native <details>; works without JavaScript. Stack items with "space-y-3". */
export default function Accordion({ title, children, defaultOpen = false, meta, titleAs: Title = 'span', className }: AccordionProps) {
  return (
    <details open={defaultOpen} className={cn('group rounded-xl border border-ink-200 bg-white', className)}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-6 py-5 font-semibold text-ink-900 [&::-webkit-details-marker]:hidden">
        <Title>{title}</Title>
        <span className="flex shrink-0 items-center gap-3">
          {meta && <span className="text-sm font-normal text-ink-500">{meta}</span>}
          <ChevronDown
            aria-hidden="true"
            size={20}
            strokeWidth={1.75}
            className="text-ink-500 transition-transform duration-200 group-open:rotate-180"
          />
        </span>
      </summary>
      <div className="px-6 pb-6 text-ink-700">{children}</div>
    </details>
  );
}
