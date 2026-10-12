'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Term } from '@/lib/wp/types';

export type FilterValues = { year: string; programme: string; list_type: string; category: string; q: string };

type DocumentFiltersProps = {
  years: Term[];
  programmes: Term[];
  listTypes: Term[];
  categories: Term[];
  selected: FilterValues;
};

const selectClasses =
  'h-11 rounded-md border border-ink-300 bg-white px-3 text-sm text-ink-900 focus:border-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-800/20';

/** Filter bar for merit lists (design system §5.14). State lives in the URL, so links are shareable. */
export default function DocumentFilters({ years, programmes, listTypes, categories, selected }: DocumentFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(selected.q);
  const [urlQuery, setUrlQuery] = useState(selected.q);

  // Adjust the input when the URL changes from elsewhere (back/forward, "Clear filters").
  // Setting state during render is the documented way to react to a changed prop.
  if (selected.q !== urlQuery) {
    setUrlQuery(selected.q);
    setQuery(selected.q);
  }

  function apply(changes: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [name, value] of Object.entries(changes)) {
      if (value) params.set(name, value);
      else params.delete(name);
    }
    params.delete('page');
    const search = params.toString();
    startTransition(() => router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false }));
  }

  // Debounce typing into the URL so the list updates as the user types.
  useEffect(() => {
    if (query === selected.q) return;
    const timer = setTimeout(() => apply({ q: query }), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selected.q]);

  const hasFilters = Boolean(selected.programme || selected.list_type || selected.category || selected.q);

  return (
    <div className={cn('mb-6 transition-opacity duration-200 print:hidden', isPending && 'opacity-60')} aria-busy={isPending}>
      <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:justify-between">
        {programmes.length > 1 && (
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by programme">
            <button
              type="button"
              onClick={() => apply({ programme: '' })}
              aria-pressed={selected.programme === ''}
              className={cn(
                'h-9 rounded-md px-4 text-sm font-semibold transition-colors duration-200',
                selected.programme === '' ? 'bg-primary-800 text-white' : 'border border-ink-300 text-ink-700 hover:bg-primary-50',
              )}
            >
              All
            </button>
            {programmes.map((p) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => apply({ programme: p.slug })}
                aria-pressed={selected.programme === p.slug}
                className={cn(
                  'h-9 rounded-md px-4 text-sm font-semibold transition-colors duration-200',
                  selected.programme === p.slug ? 'bg-primary-800 text-white' : 'border border-ink-300 text-ink-700 hover:bg-primary-50',
                )}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {years.length > 1 && (
            <label className="flex items-center gap-2 text-sm">
              <span className="shrink-0 text-ink-500">Session</span>
              <select value={selected.year} onChange={(e) => apply({ year: e.target.value })} className={selectClasses}>
                {years.map((y) => (
                  <option key={y.slug} value={y.slug}>
                    {y.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {listTypes.length > 1 && (
            <label>
              <span className="sr-only">List type</span>
              <select value={selected.list_type} onChange={(e) => apply({ list_type: e.target.value })} className={selectClasses}>
                <option value="">All list types</option>
                {listTypes.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {categories.length > 1 && (
            <label>
              <span className="sr-only">Category</span>
              <select value={selected.category} onChange={(e) => apply({ category: e.target.value })} className={selectClasses}>
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="relative">
            <label htmlFor="document-search" className="sr-only">
              Search by title
            </label>
            <Search aria-hidden="true" size={16} strokeWidth={1.75} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              id="document-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title"
              className="h-11 w-full rounded-md border border-ink-300 bg-white pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-500 focus:border-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-800/20 sm:w-56"
            />
          </div>
        </div>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => apply({ programme: '', list_type: '', category: '', q: '' })}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-800 hover:text-primary-700 hover:underline"
        >
          <X aria-hidden="true" size={14} strokeWidth={2} />
          Clear filters
        </button>
      )}
    </div>
  );
}
