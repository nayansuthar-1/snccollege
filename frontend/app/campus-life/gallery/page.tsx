import type { Metadata } from 'next';
import { Images } from 'lucide-react';
import AlbumGrid from '@/components/gallery/AlbumGrid';
import PageHero from '@/components/page/PageHero';
import Prose from '@/components/page/Prose';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import Section from '@/components/ui/Section';
import { getBreadcrumbs } from '@/config/navigation';
import { pageParam, type SearchParams } from '@/lib/search-params';
import { getAlbums, getPage } from '@/lib/wp/api';
import { renderWpHtml } from '@/lib/wp/html';

const PATH = '/campus-life/gallery';
const WP_PATH = 'campus-life/gallery';
const FALLBACK_TITLE = 'Photo Gallery';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(WP_PATH);
  return {
    title: page?.title ?? FALLBACK_TITLE,
    description: page?.excerpt || 'Photographs of events and activities at Shiv Narayan Choubisa College, Simalwara.',
    alternates: { canonical: PATH },
  };
}

export default async function GalleryPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = pageParam(sp);

  const [wpPage, data] = await Promise.all([getPage(WP_PATH), getAlbums(page)]);
  const title = wpPage?.title ?? FALLBACK_TITLE;

  return (
    <>
      <PageHero
        title={title}
        subtitle={wpPage?.subtitle || 'Photographs of college events, activities and campus life.'}
        breadcrumbs={getBreadcrumbs(PATH, title)}
        image={wpPage?.hero_image}
      />
      <Section>
        {wpPage?.content_html && <Prose className="mb-10">{renderWpHtml(wpPage.content_html)}</Prose>}

        {data.items.length === 0 ? (
          <EmptyState
            icon={Images}
            title="No photo albums published yet"
            description="Albums appear here as soon as the college publishes photographs."
          />
        ) : (
          // Album titles are <h3>, so the grid needs an <h2> above them. The design shows no
          // visible heading here, so it is for screen readers only.
          <>
            <h2 className="sr-only">Photo albums</h2>
            <AlbumGrid albums={data.items} />
          </>
        )}

        <Pagination page={data.page} totalPages={data.total_pages} baseHref={PATH} />
      </Section>
    </>
  );
}
