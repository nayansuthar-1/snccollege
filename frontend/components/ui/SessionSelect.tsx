'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { cn } from '@/lib/cn';
import type { Term } from '@/lib/wp/types';

type SessionSelectProps = {
  /** Sessions that have content, newest first. */
  years: Term[];
  selected: string;
  /** Query parameter to write, e.g. "year". */
  name?: string;
  label?: string;
  className?: string;
};

/** Academic-session picker whose state lives in the URL, so links are shareable. */
export default function SessionSelect({ years, selected, name = 'year', label = 'Session', className }: SessionSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function change(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    params.delete('page');
    const search = params.toString();
    startTransition(() => router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false }));
  }

  return (
    <label className={cn('flex items-center gap-2 text-sm transition-opacity duration-200 print:hidden', isPending && 'opacity-60', className)}>
      <span className="shrink-0 text-ink-500">{label}</span>
      <select
        value={selected}
        onChange={(event) => change(event.target.value)}
        className="h-11 rounded-md border border-ink-300 bg-white px-3 text-sm text-ink-900 focus:border-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-800/20"
      >
        {years.map((year) => (
          <option key={year.slug} value={year.slug}>
            {year.name}
          </option>
        ))}
      </select>
    </label>
  );
}
