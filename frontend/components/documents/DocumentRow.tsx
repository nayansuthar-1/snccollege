import { Download, ExternalLink, FileText } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { fileTypeLabel, formatDate, formatFileSize, isNew } from '@/lib/format';
import type { WpFile } from '@/lib/wp/types';

export type DocumentItem = {
  id: number | string;
  title: string;
  date?: string;
  /** Extra meta shown under the title on mobile and as columns on desktop. */
  meta?: { label: string; value: string }[];
  important?: boolean;
  file?: WpFile | null;
  url?: string;
};

export function documentLink(item: DocumentItem) {
  if (item.file) {
    const type = fileTypeLabel(item.file.mime);
    const size = formatFileSize(item.file.size_bytes);
    return {
      href: item.file.url,
      text: [type, size].filter(Boolean).join(' · '),
      label: `Download ${item.title} (${[type, size].filter(Boolean).join(', ')}), opens in new tab`,
      icon: Download,
    };
  }
  if (item.url) {
    return { href: item.url, text: 'Open', label: `Open ${item.title}, opens in new tab`, icon: ExternalLink };
  }
  return null;
}

export function DocumentBadges({ item }: { item: DocumentItem }) {
  const fresh = item.date ? isNew(item.date) : false;
  if (!fresh && !item.important) return null;
  return (
    <span className="inline-flex flex-wrap gap-2">
      {fresh && <Badge tone="new">New</Badge>}
      {item.important && <Badge tone="important">Important</Badge>}
    </span>
  );
}

/** Mobile/stacked representation of a document (used below md). */
export default function DocumentRow({ item }: { item: DocumentItem }) {
  const link = documentLink(item);
  const meta = [item.date ? formatDate(item.date) : '', ...(item.meta?.map((m) => m.value) ?? [])].filter(Boolean);

  return (
    <div className="flex gap-4 border-b border-ink-200 p-4 last:border-b-0">
      <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary-100 text-primary-800">
        <FileText aria-hidden="true" size={20} strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-6 text-ink-900">{item.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
          {meta.map((m) => (
            <span key={m}>{m}</span>
          ))}
          <DocumentBadges item={item} />
        </div>
      </div>
      {link && (
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          className="grid size-11 shrink-0 place-items-center rounded-md border border-ink-200 text-primary-800 transition-colors duration-200 hover:bg-primary-50"
        >
          <link.icon aria-hidden="true" size={18} strokeWidth={1.75} />
        </a>
      )}
    </div>
  );
}
