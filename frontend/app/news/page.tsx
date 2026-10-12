import type { Metadata } from 'next';
import { Newspaper } from 'lucide-react';
import NewsCard from '@/components/cards/NewsCard';
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

  const [wpPage, data] = await Promise.all([getPage(WP_PATH), getNews({ category, page })]);
  const title = wpPage?.title ?? FALLBACK_TITLE;
  const active = data.categories.find((c) => c.slug === category);

  const tabs = [
    { label: 'All', href: PATH, active: !active },
    ...data.categories.map((c) => ({ label: c.name, href: `${PATH}?category=${c.slug}`, active: active?.slug === c.slug })),
  ];

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

        {data.categories.length > 1 && <TabLinks items={tabs} label="Filter news by category" className="mb-10" />}

        {data.items.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title={active ? `No ${active.name.toLowerCase()} published yet` : 'No news published yet'}
            description="News, events and press notes appear here as soon as the college publishes them."
          />
        ) : (
          // The design shows no visible heading here, but the card titles are <h3>, so the
          // list needs an <h2> for the heading order to stay intact.
          <>
            <h2 className="sr-only">{active ? active.name : 'All news'}</h2>
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {data.items.map((item) => (
                <li key={item.id}>
                  <NewsCard item={item} />
                </li>
              ))}
            </ul>
          </>
        )}

        <Pagination page={data.page} totalPages={data.total_pages} baseHref={category ? `${PATH}?category=${category}` : PATH} />
      </Section>
    </>
  );
}
