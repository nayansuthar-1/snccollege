import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CalendarDays } from 'lucide-react';
import NewsCard from '@/components/cards/NewsCard';
import PageHero from '@/components/page/PageHero';
import Prose from '@/components/page/Prose';
import Badge from '@/components/ui/Badge';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import SectionHeader from '@/components/ui/SectionHeader';
import { getBreadcrumbs } from '@/config/navigation';
import { siteConfig } from '@/config/site';
import { formatDate } from '@/lib/format';
import { getNews, getNewsItem, getPaths, getSettings } from '@/lib/wp/api';
import { renderWpHtml } from '@/lib/wp/html';
import type { NewsItem, Settings } from '@/lib/wp/types';

/** News article (design system §6.8). New posts work without a redeploy. */
export const dynamicParams = true;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { news } = await getPaths();
  return news.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [item, settings] = await Promise.all([getNewsItem(slug), getSettings()]);
  if (!item) return {};

  const image = item.image ?? settings.default_og_image;
  return {
    title: item.title,
    description: item.excerpt || undefined,
    alternates: { canonical: `/news/${slug}` },
    openGraph: {
      title: item.title,
      description: item.excerpt || undefined,
      url: `/news/${slug}`,
      type: 'article',
      publishedTime: item.date,
      images: image ? [{ url: image.url, width: image.width, height: image.height }] : undefined,
    },
  };
}

function articleJsonLd(item: NewsItem, settings: Settings, path: string) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: item.title,
    datePublished: item.date,
    mainEntityOfPage: new URL(path, siteConfig.url).toString(),
    ...(item.excerpt ? { description: item.excerpt } : {}),
    ...(item.image ? { image: [item.image.url] } : {}),
    publisher: {
      '@type': 'CollegeOrUniversity',
      name: settings.college_name || 'Shiv Narayan Choubisa College, Simalwara',
      url: siteConfig.url,
    },
  };
  return JSON.stringify(data).replace(/</g, '\u003c');
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const [item, settings] = await Promise.all([getNewsItem(slug), getSettings()]);
  if (!item) notFound();

  const path = `/news/${slug}`;
  const more = (await getNews({ category: item.category?.slug })).items.filter((n) => n.slug !== slug).slice(0, 3);

  return (
    <>
      <PageHero title={item.title} breadcrumbs={getBreadcrumbs(path, item.title)} />

      <div className="bg-white py-16 md:py-24">
        <Container>
          <article className="max-w-3xl">
            <p className="flex flex-wrap items-center gap-3 text-sm text-ink-500">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays aria-hidden="true" size={16} strokeWidth={1.75} />
                <time dateTime={item.date}>{formatDate(item.date, 'long')}</time>
              </span>
              {item.category && <Badge tone="info">{item.category.name}</Badge>}
            </p>

            {item.image && (
              <Image
                src={item.image.url}
                alt={item.image.alt}
                width={item.image.width}
                height={item.image.height}
                priority
                sizes="(min-width: 768px) 768px, 100vw"
                className="mt-8 h-auto w-full rounded-xl"
              />
            )}

            <Prose className="mt-8">{renderWpHtml(item.content_html)}</Prose>

            {item.gallery.length > 0 && (
              <section className="mt-12">
                <h2 className="mb-6 font-serif text-2xl font-bold leading-snug text-ink-900">Photographs</h2>
                <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {item.gallery.map((photo) => (
                    <li key={photo.url}>
                      <Image
                        src={photo.url}
                        alt={photo.alt}
                        width={photo.width}
                        height={photo.height}
                        sizes="(min-width: 768px) 240px, 50vw"
                        className="aspect-square w-full rounded-lg object-cover"
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>
        </Container>
      </div>

      {more.length > 0 && (
        <Section tone="muted" labelledBy="more-news-heading">
          <SectionHeader id="more-news-heading" title="More news" action={{ label: 'All news', href: '/news' }} />
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {more.map((n) => (
              <li key={n.id}>
                <NewsCard item={n} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: articleJsonLd(item, settings, path) }} />
    </>
  );
}
