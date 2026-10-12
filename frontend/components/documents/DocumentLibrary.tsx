import { FileX } from 'lucide-react';
import Accordion from '@/components/ui/Accordion';
import EmptyState from '@/components/ui/EmptyState';
import type { DocumentSection } from '@/config/documents';
import { getDocuments } from '@/lib/wp/api';
import type { Doc } from '@/lib/wp/types';
import DocumentList from './DocumentList';
import type { DocumentItem } from './DocumentRow';

/** Documents of one or more types, optionally grouped into an accordion per session. */
export default async function DocumentLibrary({ config }: { config: DocumentSection }) {
  const { items } = await getDocuments({ type: config.types });

  const toItem = (doc: Doc): DocumentItem => ({
    id: doc.id,
    title: doc.title,
    date: doc.date,
    meta: config.showProgramme ? [{ label: 'Programme', value: doc.programme?.name ?? '—' }] : undefined,
    file: doc.file,
    url: doc.url,
  });

  const columns = config.showProgramme ? ['Programme'] : [];

  const heading = (
    <h2 className="mb-6 font-serif text-[1.75rem] font-bold leading-snug text-ink-900 md:text-3xl">{config.heading}</h2>
  );

  if (items.length === 0) {
    return (
      <section className="mt-12">
        {heading}
        <EmptyState icon={FileX} title={config.emptyTitle} description={config.emptyDescription} />
      </section>
    );
  }

  // Group by academic session, newest first, with untagged documents last.
  const groups = new Map<string, { name: string; docs: Doc[] }>();
  for (const doc of items) {
    const key = doc.year?.slug ?? '';
    if (!groups.has(key)) groups.set(key, { name: doc.year?.name ?? 'Other documents', docs: [] });
    groups.get(key)!.docs.push(doc);
  }
  const ordered = [...groups.entries()].sort(([a], [b]) => {
    if (a === '') return 1;
    if (b === '') return -1;
    return b.localeCompare(a);
  });

  if (!config.groupByYear || ordered.length <= 1) {
    return (
      <section className="mt-12">
        {heading}
        <DocumentList items={items.map(toItem)} metaColumns={columns} caption={config.heading} />
      </section>
    );
  }

  return (
    <section className="mt-12">
      {heading}
      <div className="space-y-3">
        {ordered.map(([slug, group], index) => (
          <Accordion
            key={slug || 'other'}
            title={group.name}
            meta={`${group.docs.length} ${group.docs.length === 1 ? 'document' : 'documents'}`}
            defaultOpen={index === 0}
          >
            <DocumentList items={group.docs.map(toItem)} metaColumns={columns} caption={`${config.heading} — ${group.name}`} />
          </Accordion>
        ))}
      </div>
    </section>
  );
}
