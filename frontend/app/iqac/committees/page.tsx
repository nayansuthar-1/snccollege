import type { Metadata } from 'next';
import { Users } from 'lucide-react';
import CommitteeAccordion from '@/components/iqac/CommitteeAccordion';
import Prose from '@/components/page/Prose';
import SectionPageLayout from '@/components/page/SectionPageLayout';
import EmptyState from '@/components/ui/EmptyState';
import SessionSelect from '@/components/ui/SessionSelect';
import { param, type SearchParams } from '@/lib/search-params';
import { getCommittees, getPage } from '@/lib/wp/api';
import { renderWpHtml } from '@/lib/wp/html';

const PATH = '/iqac/committees';
const WP_PATH = 'iqac/committees';
const FALLBACK_TITLE = 'College Committees';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(WP_PATH);
  return {
    title: page?.title ?? FALLBACK_TITLE,
    description: page?.excerpt || 'Committees and cells of Shiv Narayan Choubisa College, Simalwara, with their members.',
    alternates: { canonical: PATH },
  };
}

export default async function CommitteesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const year = param(sp, 'year');

  const [page, data] = await Promise.all([getPage(WP_PATH), getCommittees(year)]);
  const session = data.years.find((y) => y.slug === data.selected_year)?.name ?? data.selected_year;

  return (
    <SectionPageLayout
      title={page?.title ?? FALLBACK_TITLE}
      subtitle={page?.subtitle || 'Committees and cells constituted by the college, with their members.'}
      path={PATH}
      heroImage={page?.hero_image}
    >
      {page?.content_html && <Prose className="mb-10">{renderWpHtml(page.content_html)}</Prose>}

      {data.years.length > 1 && (
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <SessionSelect years={data.years} selected={data.selected_year} />
          <p className="text-sm text-ink-500" role="status">
            {data.items.length} {data.items.length === 1 ? 'committee' : 'committees'}
            {session ? ` for session ${session}` : ''}.
          </p>
        </div>
      )}

      {data.items.length === 0 ? (
        <EmptyState
          icon={Users}
          title={session ? `No committees published for ${session} yet` : 'No committees published yet'}
          description="Committees appear here as soon as the college publishes the constituting order."
        />
      ) : (
        <div className="space-y-3">
          {data.items.map((committee, index) => (
            <CommitteeAccordion key={committee.id} committee={committee} defaultOpen={index === 0} />
          ))}
        </div>
      )}
    </SectionPageLayout>
  );
}
