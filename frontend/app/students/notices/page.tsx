import type { Metadata } from 'next';
import DocumentList from '@/components/documents/DocumentList';
import type { DocumentItem } from '@/components/documents/DocumentRow';
import Prose from '@/components/page/Prose';
import SectionPageLayout from '@/components/page/SectionPageLayout';
import Pagination from '@/components/ui/Pagination';
import TabLinks from '@/components/ui/TabLinks';
import { siteConfig } from '@/config/site';
import { getNotices, getPage } from '@/lib/wp/api';
import { renderWpHtml } from '@/lib/wp/html';
import { pageParam, param, type SearchParams } from '@/lib/search-params';
import type { Notice } from '@/lib/wp/types';

const PATH = '/students/notices';
const WP_PATH = 'students/notices';
const FALLBACK_TITLE = 'Notices';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(WP_PATH);
  return {
    title: page?.title ?? FALLBACK_TITLE,
    description: page?.excerpt || 'Notices and circulars published by Shiv Narayan Choubisa College, Simalwara.',
    alternates: { canonical: PATH },
  };
}

export default async function NoticesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const type = param(sp, 'type');
  const page = pageParam(sp);

  const [wpPage, data] = await Promise.all([getPage(WP_PATH), getNotices({ type, page, perPage: siteConfig.pageSize })]);

  const toItem = (notice: Notice): DocumentItem => ({
    id: notice.id,
    title: notice.title,
    date: notice.date,
    important: notice.important,
    meta: [{ label: 'Type', value: notice.type?.name ?? '—' }],
    file: notice.file,
    url: notice.url,
  });

  const tabs = [
    { label: 'All', href: PATH, active: type === '' },
    ...data.types.map((t) => ({ label: t.name, href: `${PATH}?type=${t.slug}`, active: type === t.slug })),
  ];
  const activeType = data.types.find((t) => t.slug === type);

  return (
    <SectionPageLayout
      title={wpPage?.title ?? FALLBACK_TITLE}
      subtitle={wpPage?.subtitle || 'Latest notices and circulars from the college.'}
      path={PATH}
      heroImage={wpPage?.hero_image}
    >
      {wpPage?.content_html && <Prose className="mb-10">{renderWpHtml(wpPage.content_html)}</Prose>}

      {data.types.length > 1 && <TabLinks items={tabs} label="Filter notices by type" className="mb-8" />}

      <DocumentList
        items={data.items.map(toItem)}
        metaColumns={['Type']}
        caption={activeType ? `${activeType.name} notices` : 'All notices'}
        emptyTitle={activeType ? `No ${activeType.name.toLowerCase()} notices yet` : 'No notices published yet'}
        emptyDescription="Notices appear here as soon as the college publishes them."
      />

      <Pagination page={data.page} totalPages={data.total_pages} baseHref={type ? `${PATH}?type=${type}` : PATH} />
    </SectionPageLayout>
  );
}
