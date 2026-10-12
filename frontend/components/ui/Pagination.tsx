import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

type PaginationProps = {
  page: number;
  totalPages: number;
  /** e.g. "/students/notices?type=exam" — the page param is appended. */
  baseHref: string;
  className?: string;
};

function hrefFor(baseHref: string, page: number) {
  const [path, query = ''] = baseHref.split('?');
  const params = new URLSearchParams(query);
  if (page <= 1) params.delete('page');
  else params.set('page', String(page));
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

function pageWindow(page: number, total: number): (number | 'gap')[] {
  const pages = [...new Set([1, total, page - 1, page, page + 1])].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) out.push('gap');
    out.push(p);
  });
  return out;
}

const cell = 'grid h-10 min-w-10 place-items-center rounded-md px-3 text-sm font-semibold transition-colors duration-200';

export default function Pagination({ page, totalPages, baseHref, className }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className={cn('mt-10 flex items-center justify-center gap-1', className)}>
      {page > 1 ? (
        <Link href={hrefFor(baseHref, page - 1)} className={cn(cell, 'text-ink-700 hover:bg-primary-50')} aria-label="Previous page">
          <ChevronLeft aria-hidden="true" size={18} />
        </Link>
      ) : (
        <span className={cn(cell, 'text-ink-300')} aria-hidden="true">
          <ChevronLeft size={18} />
        </span>
      )}
      {pageWindow(page, totalPages).map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className="px-2 text-ink-500" aria-hidden="true">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(baseHref, p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(cell, p === page ? 'bg-primary-800 text-white' : 'text-ink-700 hover:bg-primary-50')}
          >
            {p}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link href={hrefFor(baseHref, page + 1)} className={cn(cell, 'text-ink-700 hover:bg-primary-50')} aria-label="Next page">
          <ChevronRight aria-hidden="true" size={18} />
        </Link>
      ) : (
        <span className={cn(cell, 'text-ink-300')} aria-hidden="true">
          <ChevronRight size={18} />
        </span>
      )}
    </nav>
  );
}
