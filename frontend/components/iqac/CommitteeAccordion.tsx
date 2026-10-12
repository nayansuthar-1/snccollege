import { Download } from 'lucide-react';
import Prose from '@/components/page/Prose';
import Accordion from '@/components/ui/Accordion';
import { fileTypeLabel, formatFileSize } from '@/lib/format';
import { renderWpHtml } from '@/lib/wp/html';
import type { Committee } from '@/lib/wp/types';

/** One committee: purpose, convener, members table and the order PDF (design system §6.7). */
export default function CommitteeAccordion({ committee, defaultOpen = false }: { committee: Committee; defaultOpen?: boolean }) {
  const order = committee.order_document;
  const fileMeta = order ? [fileTypeLabel(order.mime), formatFileSize(order.size_bytes)].filter(Boolean) : [];

  return (
    <Accordion title={committee.title} meta={committee.year?.name || 'Standing'} defaultOpen={defaultOpen} titleAs="h2">
      {committee.purpose_html && <Prose>{renderWpHtml(committee.purpose_html)}</Prose>}

      {committee.convener && (
        <p className="mt-4 text-sm text-ink-700">
          <span className="font-semibold text-ink-900">Convener:</span> {committee.convener}
        </p>
      )}

      {committee.members.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-ink-200">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Members of the {committee.title}</caption>
            <thead className="bg-ink-100 text-xs font-bold uppercase tracking-wide text-ink-500">
              <tr>
                <th scope="col" className="whitespace-nowrap px-5 py-3">
                  Name
                </th>
                <th scope="col" className="whitespace-nowrap px-5 py-3">
                  Designation
                </th>
                <th scope="col" className="whitespace-nowrap px-5 py-3">
                  Role
                </th>
              </tr>
            </thead>
            <tbody>
              {committee.members.map((member, index) => (
                <tr key={`${member.name}-${index}`} className="border-t border-ink-200">
                  <th scope="row" className="whitespace-nowrap px-5 py-4 font-medium text-ink-900">
                    {member.name}
                  </th>
                  <td className="whitespace-nowrap px-5 py-4 text-ink-700">{member.designation || '—'}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-ink-700">{member.role || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {order && (
        <p className="mt-6">
          <a
            href={order.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Download the order constituting the ${committee.title} (${fileMeta.join(', ')}), opens in new tab`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-800 transition-colors duration-200 hover:text-primary-700 hover:underline"
          >
            <Download aria-hidden="true" size={16} strokeWidth={1.75} />
            Committee order
            {fileMeta.length > 0 && <span className="font-normal text-ink-500">{fileMeta.join(' · ')}</span>}
          </a>
        </p>
      )}
    </Accordion>
  );
}
