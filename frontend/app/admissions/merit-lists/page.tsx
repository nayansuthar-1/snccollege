import type { Metadata } from 'next';
import DocumentFilters from '@/components/documents/DocumentFilters';
import DocumentList from '@/components/documents/DocumentList';
import type { DocumentItem } from '@/components/documents/DocumentRow';
import Prose from '@/components/page/Prose';
import SectionPageLayout from '@/components/page/SectionPageLayout';
import { getMeritLists, getPage } from '@/lib/wp/api';
import { renderWpHtml } from '@/lib/wp/html';
import { param, type SearchParams } from '@/lib/search-params';
import type { MeritList } from '@/lib/wp/types';

const PATH = '/admissions/merit-lists';
const WP_PATH = 'admissions/merit-lists';
const FALLBACK_TITLE = 'Merit Lists';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(WP_PATH);
  return {
    title: page?.title ?? FALLBACK_TITLE,
    description: page?.excerpt || 'Merit, waiting and admitted lists published by Shiv Narayan Choubisa College, Simalwara.',
    alternates: { canonical: PATH },
  };
}

export default async function MeritListsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const selected = {
    year: param(sp, 'year'),
    programme: param(sp, 'programme'),
    list_type: param(sp, 'list_type'),
    category: param(sp, 'category'),
    q: param(sp, 'q'),
  };

  const [page, data] = await Promise.all([
    getPage(WP_PATH),
    getMeritLists({ year: selected.year, programme: selected.programme, listType: selected.list_type, category: selected.category }),
  ]);

  const needle = selected.q.toLowerCase();
  const matches = needle ? data.items.filter((item) => item.title.toLowerCase().includes(needle)) : data.items;

  const toItem = (list: MeritList): DocumentItem => ({
    id: list.id,
    title: list.title,
    date: list.date,
    meta: [
      { label: 'Programme', value: list.programme?.name ?? '—' },
      { label: 'Category', value: list.category?.name ?? '—' },
      { label: 'Type', value: list.list_type?.name ?? '—' },
    ],
    file: list.file,
  });

  const session = data.years.find((y) => y.slug === data.selected_year)?.name ?? data.selected_year;
  const narrowed = Boolean(selected.programme || selected.list_type || selected.category || selected.q);

  return (
    <SectionPageLayout
      title={page?.title ?? FALLBACK_TITLE}
      subtitle={page?.subtitle || 'Merit, waiting and admitted lists by session, programme and category.'}
      path={PATH}
      heroImage={page?.hero_image}
    >
      {page?.content_html && <Prose className="mb-10">{renderWpHtml(page.content_html)}</Prose>}

      <DocumentFilters
        years={data.years}
        programmes={data.programmes}
        listTypes={data.list_types}
        categories={data.categories}
        selected={{ ...selected, year: data.selected_year }}
      />

      {matches.length > 0 && (
        <p className="mb-4 text-sm text-ink-500" role="status">
          Showing {matches.length} {matches.length === 1 ? 'list' : 'lists'}
          {session ? ` for session ${session}` : ''}.
        </p>
      )}

      <DocumentList
        items={matches.map(toItem)}
        metaColumns={['Programme', 'Category', 'Type']}
        caption={`Merit lists${session ? ` for session ${session}` : ''}`}
        emptyTitle={narrowed ? 'No lists match these filters' : `No merit lists published for ${session || 'this session'} yet`}
        emptyDescription={
          narrowed
            ? 'Try a different programme, list type or category, or clear the filters.'
            : 'Lists are published here as soon as the college releases them.'
        }
      />
    </SectionPageLayout>
  );
}
