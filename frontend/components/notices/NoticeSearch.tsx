'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';

type NoticeSearchProps = {
  selectedQuery?: string;
  className?: string;
};

export default function NoticeSearch({ selectedQuery = '', className }: NoticeSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(selectedQuery);
  const [urlQuery, setUrlQuery] = useState(selectedQuery);

  // Sync state if URL search query changes via browser navigation
  if (selectedQuery !== urlQuery) {
    setUrlQuery(selectedQuery);
    setQuery(selectedQuery);
  }

  function apply(q: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set('q', q);
    else params.delete('q');
    params.delete('page');
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  useEffect(() => {
    if (query === selectedQuery) return;
    const timer = setTimeout(() => apply(query), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selectedQuery]);

  return (
    <div className={cn('relative w-full max-w-md print:hidden', isPending && 'opacity-60', className)}>
      <label htmlFor="notice-search-input" className="sr-only">
        Search notices by subject
      </label>
      <Search
        aria-hidden="true"
        size={18}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500"
      />
      <input
        id="notice-search-input"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search notices by subject…"
        className="h-11 w-full rounded-md border border-ink-300 bg-white pl-10 pr-9 text-sm text-ink-900 placeholder:text-ink-500 focus:border-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-800/20"
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery('');
            apply('');
          }}
          aria-label="Clear notice search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-ink-500 transition-colors duration-200 hover:text-ink-900"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
