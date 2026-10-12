import type { Metadata } from 'next';
import { Newspaper } from 'lucide-react';
import NewsCard from '@/components/cards/NewsCard';
import NewsSearch from '@/components/news/NewsSearch';
import PageHero from '@/components/page/PageHero';
import Prose from '@/components/page/Prose';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import Section from '@/components/ui/Section';
import TabLinks from '@/components/ui/TabLinks';
import { getBreadcrumbs } from '@/config/navigation';
import { pageParam, param, type SearchParams } from '@/lib/search-params';
import { getNews, getPage } from '@/lib/wp/api';
import { renderWpHtml } from '@/lib/wp/html';

const PATH = '/news';
const WP_PATH = 'news';
const FALLBACK_TITLE = 'News & Events';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(WP_PATH);
  return {
    title: page?.title ?? FALLBACK_TITLE,
    description: page?.excerpt || 'News, events and press notes from Shiv Narayan Choubisa College, Simalwara.',
    alternates: { canonical: PATH },
  };
}

export default async function NewsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const category = param(sp, 'category');
  const page = pageParam(sp);
  const q = param(sp, 'q');

  const [wpPage, data] = await Promise.all([getPage(WP_PATH), getNews({ category, page, q })]);
  const title = wpPage?.title ?? FALLBACK_TITLE;
  const active = data.categories.find((c) => c.slug === category);

  const buildTabHref = (catSlug?: string) => {
    const params = new URLSearchParams();
    if (catSlug) params.set('category', catSlug);
    if (q) params.set('q', q);
    const qs = params.toString();
    return qs ? `${PATH}?${qs}` : PATH;
  };

  const tabs = [
    { label: 'All', href: buildTabHref(), active: !active },
    ...data.categories.map((c) => ({
      label: c.name,
      href: buildTabHref(c.slug),
      active: active?.slug === c.slug,
    })),
  ];

  const buildPageBaseHref = () => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (q) params.set('q', q);
    const qs = params.toString();
    return qs ? `${PATH}?${qs}` : PATH;
  };

  const emptyTitle = q
    ? `No news or events found matching "${q}"`
    : active
      ? `No ${active.name.toLowerCase()} published yet`
      : 'No news published yet';

  const emptyDescription = q
    ? 'Try checking for typos or searching for a different keyword.'
    : 'News, events and press notes appear here as soon as the college publishes them.';

  const headingText = q
    ? `Search results for "${q}"${active ? ` in ${active.name}` : ''}`
    : active
      ? active.name
      : 'All news';

  return (
    <>
      <PageHero
        title={title}
        subtitle={wpPage?.subtitle || 'News, events and press notes from the college.'}
        breadcrumbs={getBreadcrumbs(PATH, title)}
        image={wpPage?.hero_image}
      />
      <Section>
        {wpPage?.content_html && <Prose className="mb-10">{renderWpHtml(wpPage.content_html)}</Prose>}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {data.categories.length > 1 ? (
            <div className="min-w-0 flex-1">
              <TabLinks items={tabs} label="Filter news by category" />
            </div>
          ) : (
            <div />
          )}
          <div className="shrink-0">
            <NewsSearch selectedQuery={q} className="w-full sm:w-72" />
          </div>
        </div>

        {data.items.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title={emptyTitle}
            description={emptyDescription}
          />
        ) : (
          <>
            <h2 className="sr-only">{headingText}</h2>
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {data.items.map((item) => (
                <li key={item.id}>
                  <NewsCard item={item} />
                </li>
              ))}
            </ul>
          </>
        )}

        <Pagination page={data.page} totalPages={data.total_pages} baseHref={buildPageBaseHref()} />
      </Section>
    </>
  );
}

