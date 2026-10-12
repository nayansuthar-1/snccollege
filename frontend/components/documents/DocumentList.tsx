import { FileX } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/format';
import DocumentRow, { DocumentBadges, documentLink, type DocumentItem } from './DocumentRow';

type DocumentListProps = {
  items: DocumentItem[];
  /** Column headings for item.meta, in order (e.g. ["Programme", "Category", "Type"]). */
  metaColumns?: string[];
  showDate?: boolean;
  caption: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

/** Core document component (design system §5.14): table on md+, stacked rows on mobile. */
export default function DocumentList({
  items,
  metaColumns = [],
  showDate = true,
  caption,
  emptyTitle = 'Nothing published yet',
  emptyDescription = 'Documents are published here as soon as the college releases them.',
}: DocumentListProps) {
  if (items.length === 0) {
    return <EmptyState icon={FileX} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-ink-200 bg-white md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-ink-100 text-xs font-bold uppercase tracking-wide text-ink-500">
            <tr>
              <th scope="col" className="px-5 py-3">
                Title
              </th>
              {metaColumns.map((c) => (
                <th key={c} scope="col" className="px-5 py-3">
                  {c}
                </th>
              ))}
              {showDate && (
                <th scope="col" className="whitespace-nowrap px-5 py-3">
                  Date
                </th>
              )}
              <th scope="col" className="px-5 py-3 text-right">
                File
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const link = documentLink(item);
              return (
                <tr key={item.id} className="border-t border-ink-200 transition-colors duration-200 hover:bg-primary-50">
                  <td className="px-5 py-4">
                    <span className="font-medium leading-6 text-ink-900">{item.title}</span>
                    <span className="ml-2 align-middle">
                      <DocumentBadges item={item} />
                    </span>
                  </td>
                  {metaColumns.map((c, i) => (
                    <td key={c} className="whitespace-nowrap px-5 py-4 text-ink-700">
                      {item.meta?.[i]?.value ?? '—'}
                    </td>
                  ))}
                  {showDate && (
                    <td className="whitespace-nowrap px-5 py-4 text-ink-500">
                      {item.date ? <time dateTime={item.date}>{formatDate(item.date)}</time> : '—'}
                    </td>
                  )}
                  <td className="px-5 py-4 text-right">
                    {link ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.label}
                        className="inline-flex items-center gap-2 whitespace-nowrap font-semibold text-primary-800 hover:text-primary-700 hover:underline"
                      >
                        <link.icon aria-hidden="true" size={16} strokeWidth={1.75} />
                        {link.text}
                      </a>
                    ) : (
                      <span className="text-ink-500">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-200 bg-white md:hidden">
        {items.map((item) => (
          <DocumentRow key={item.id} item={item} />
        ))}
      </div>
    </>
  );
}
