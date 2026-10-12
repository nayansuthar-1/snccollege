import Link from 'next/link';
import { Bell } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { dateTileParts, isNew } from '@/lib/format';
import type { Notice } from '@/lib/wp/types';

function noticeHref(n: Notice): { href: string; external: boolean } {
  if (n.file) return { href: n.file.url, external: true };
  if (n.url) return { href: n.url, external: /^https?:\/\//.test(n.url) };
  return { href: '/students/notices', external: false };
}

/** Latest notices, static list (design system §5.15). */
export default function NoticeBoard({ notices }: { notices: Notice[] }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm">
      <div className="flex items-center justify-between bg-primary-900 px-6 py-4">
        <h2 className="flex items-center gap-2.5 font-serif text-lg font-bold text-white">
          <Bell aria-hidden="true" size={18} strokeWidth={1.75} className="text-gold-400" />
          Notice Board
        </h2>
        <Link href="/students/notices" className="text-sm font-semibold text-gold-400 hover:text-gold-500">
          View all
        </Link>
      </div>

      {notices.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-ink-500">No notices have been published yet.</p>
      ) : (
        <ul className="divide-y divide-ink-200">
          {notices.map((n) => {
            const tile = dateTileParts(n.date);
            const { href, external } = noticeHref(n);
            const content = (
              <>
                {tile && (
                  <span className="w-14 shrink-0 rounded-md border border-ink-200 py-1.5 text-center" aria-hidden="true">
                    <span className="block text-lg font-bold leading-tight text-primary-800">{tile.day}</span>
                    <span className="block text-[11px] uppercase tracking-wide text-ink-500">{tile.month}</span>
                  </span>
                )}
                <span className="min-w-0">
                  <span className="line-clamp-2 text-sm font-medium leading-6 text-ink-900 group-hover:text-primary-800">{n.title}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-2">
                    <time dateTime={n.date} className="sr-only">
                      {n.date}
                    </time>
                    {isNew(n.date) && <Badge tone="new">New</Badge>}
                    {n.important && <Badge tone="important">Important</Badge>}
                    {n.type && <span className="text-xs text-ink-500">{n.type.name}</span>}
                  </span>
                </span>
              </>
            );
            const cls = 'group flex gap-4 px-6 py-4 transition-colors duration-200 hover:bg-primary-50';
            return (
              <li key={n.id}>
                {external ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
                    {content}
                    <span className="sr-only">(opens in new tab)</span>
                  </a>
                ) : (
                  <Link href={href} className={cls}>
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
