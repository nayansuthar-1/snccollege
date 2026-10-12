import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Images } from 'lucide-react';
import PhotoGrid from '@/components/gallery/PhotoGrid';
import PageHero from '@/components/page/PageHero';
import Prose from '@/components/page/Prose';
import EmptyState from '@/components/ui/EmptyState';
import Section from '@/components/ui/Section';
import { getBreadcrumbs } from '@/config/navigation';
import { formatDate } from '@/lib/format';
import { getAlbum, getPaths, getSettings } from '@/lib/wp/api';
import { renderWpHtml } from '@/lib/wp/html';

/** Album page (design system §6.9). New albums work without a redeploy. */
export const dynamicParams = true;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { gallery } = await getPaths();
  return gallery.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [album, settings] = await Promise.all([getAlbum(slug), getSettings()]);
  if (!album) return {};

  const image = album.cover ?? settings.default_og_image;
  return {
    title: album.title,
    description: `${album.photo_count} photographs from ${album.title}.`,
    alternates: { canonical: `/campus-life/gallery/${slug}` },
    openGraph: {
      title: album.title,
      url: `/campus-life/gallery/${slug}`,
      type: 'article',
      images: image ? [{ url: image.url, width: image.width, height: image.height }] : undefined,
    },
  };
}

export default async function AlbumPage({ params }: PageProps) {
  const { slug } = await params;
  const album = await getAlbum(slug);
  if (!album) notFound();

  const path = `/campus-life/gallery/${slug}`;
  const meta = [`${album.photo_count} ${album.photo_count === 1 ? 'photo' : 'photos'}`, album.date ? formatDate(album.date) : '']
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <PageHero title={album.title} subtitle={meta} breadcrumbs={getBreadcrumbs(path, album.title)} />
      <Section>
        {album.content_html && <Prose className="mb-10">{renderWpHtml(album.content_html)}</Prose>}

        {album.photos.length === 0 ? (
          <EmptyState icon={Images} title="This album has no photographs yet" description="Photographs appear here once the college adds them to the album." />
        ) : (
          <PhotoGrid photos={album.photos} />
        )}
      </Section>
    </>
  );
}
