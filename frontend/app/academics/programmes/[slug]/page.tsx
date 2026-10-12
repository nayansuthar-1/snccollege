import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Check } from 'lucide-react';
import ProgrammeGlance from '@/components/academics/ProgrammeGlance';
import PageHero from '@/components/page/PageHero';
import Prose from '@/components/page/Prose';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import SectionHeader from '@/components/ui/SectionHeader';
import { siteConfig } from '@/config/site';
import { getBreadcrumbs } from '@/config/navigation';
import { getPaths, getProgramme, getSettings } from '@/lib/wp/api';
import { renderWpHtml } from '@/lib/wp/html';
import type { Programme, Settings } from '@/lib/wp/types';

/** Programme detail (design system §6.4). New programmes added in WordPress work without a redeploy. */
export const dynamicParams = true;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { programmes } = await getPaths();
  return programmes.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [programme, settings] = await Promise.all([getProgramme(slug), getSettings()]);
  if (!programme) return {};

  const image = programme.image ?? settings.default_og_image;
  return {
    title: programme.title,
    description: programme.excerpt || undefined,
    alternates: { canonical: `/academics/programmes/${slug}` },
    openGraph: {
      title: programme.title,
      description: programme.excerpt || undefined,
      url: `/academics/programmes/${slug}`,
      type: 'article',
      images: image ? [{ url: image.url, width: image.width, height: image.height }] : undefined,
    },
  };
}

function courseJsonLd(programme: Programme, settings: Settings, path: string) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: programme.title,
    url: new URL(path, siteConfig.url).toString(),
    ...(programme.excerpt ? { description: programme.excerpt } : {}),
    ...(programme.level ? { educationalLevel: programme.level.name } : {}),
    ...(programme.subjects.length ? { teaches: programme.subjects } : {}),
    provider: {
      '@type': 'CollegeOrUniversity',
      name: settings.college_name || 'Shiv Narayan Choubisa College, Simalwara',
      url: siteConfig.url,
    },
  };
  return JSON.stringify(data).replace(/</g, '\u003c');
}

export default async function ProgrammePage({ params }: PageProps) {
  const { slug } = await params;
  const [programme, settings] = await Promise.all([getProgramme(slug), getSettings()]);
  if (!programme) notFound();

  const path = `/academics/programmes/${slug}`;
  const subtitle = [programme.level?.name, programme.duration, programme.pattern].filter(Boolean).join(' · ');

  return (
    <>
      <PageHero
        title={programme.title}
        subtitle={subtitle || undefined}
        breadcrumbs={getBreadcrumbs(path, programme.short_name || programme.title)}
        image={programme.image}
      />

      <div className="bg-white py-16 md:py-24">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="min-w-0 lg:col-span-8">
              {programme.content_html ? (
                <Prose>{renderWpHtml(programme.content_html)}</Prose>
              ) : (
                programme.excerpt && <p className="max-w-prose text-base leading-relaxed text-ink-700 md:text-lg">{programme.excerpt}</p>
              )}
            </div>
            <aside className="lg:sticky lg:top-28 lg:col-span-4">
              <ProgrammeGlance programme={programme} settings={settings} />
            </aside>
          </div>
        </Container>
      </div>

      {programme.subjects.length > 0 && (
        <Section tone="muted" labelledBy="subjects-heading">
          <SectionHeader id="subjects-heading" eyebrow="Curriculum" title="Subjects" />
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {programme.subjects.map((subject) => (
              <li key={subject} className="rounded-xl border border-ink-200 bg-white p-5 text-sm font-semibold leading-6 text-ink-900">
                {subject}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {programme.career_paths.length > 0 && (
        <Section tone={programme.subjects.length > 0 ? 'white' : 'muted'} labelledBy="careers-heading">
          <SectionHeader
            id="careers-heading"
            eyebrow="After the programme"
            title="Career paths"
            description="Directions graduates of this programme commonly take."
          />
          <ul className="grid gap-4 md:grid-cols-2 md:gap-6">
            {programme.career_paths.map((careerPath) => (
              <li key={careerPath} className="flex items-start gap-3 text-base leading-7 text-ink-700">
                <Check aria-hidden="true" size={20} strokeWidth={1.75} className="mt-1 shrink-0 text-primary-800" />
                {careerPath}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: courseJsonLd(programme, settings, path) }} />
    </>
  );
}
