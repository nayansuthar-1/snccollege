import type { Metadata } from 'next';
import { GraduationCap } from 'lucide-react';
import ProgrammeGrid from '@/components/academics/ProgrammeGrid';
import PageHero from '@/components/page/PageHero';
import Prose from '@/components/page/Prose';
import EmptyState from '@/components/ui/EmptyState';
import Section from '@/components/ui/Section';
import { getBreadcrumbs } from '@/config/navigation';
import { getPage, getProgrammes } from '@/lib/wp/api';
import { renderWpHtml } from '@/lib/wp/html';
import type { ProgrammeSummary } from '@/lib/wp/types';

const PATH = '/academics/programmes';
const WP_PATH = 'academics/programmes';
const FALLBACK_TITLE = 'Programmes';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(WP_PATH);
  return {
    title: page?.title ?? FALLBACK_TITLE,
    description: page?.excerpt || 'Undergraduate programmes offered by Shiv Narayan Choubisa College, Simalwara.',
    alternates: { canonical: PATH },
  };
}

/** Programmes grouped by level, in the order the levels first appear in WordPress. */
function groupByLevel(programmes: ProgrammeSummary[]) {
  const groups = new Map<string, { name: string; items: ProgrammeSummary[] }>();
  for (const programme of programmes) {
    const key = programme.level?.slug ?? '';
    if (!groups.has(key)) groups.set(key, { name: programme.level?.name ?? 'Other programmes', items: [] });
    groups.get(key)!.items.push(programme);
  }
  return [...groups.values()];
}

export default async function ProgrammesPage() {
  const [page, programmes] = await Promise.all([getPage(WP_PATH), getProgrammes()]);
  const title = page?.title ?? FALLBACK_TITLE;
  const groups = groupByLevel(programmes);

  return (
    <>
      <PageHero
        title={title}
        subtitle={page?.subtitle || 'Degree programmes offered by the college, with subjects, eligibility and syllabus.'}
        breadcrumbs={getBreadcrumbs(PATH, title)}
        image={page?.hero_image}
      />
      <Section>
        {page?.content_html && <Prose className="mb-12">{renderWpHtml(page.content_html)}</Prose>}

        {programmes.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No programmes published yet"
            description="Programmes appear here as soon as the college publishes them."
          />
        ) : (
          // One section per level, always with its heading, so the card <h3>s follow an <h2>.
          <div className="space-y-16">
            {groups.map((group) => (
              <section key={group.name}>
                <h2 className="mb-8 font-serif text-[1.75rem] font-bold leading-snug text-ink-900 md:text-3xl">{group.name}</h2>
                <ProgrammeGrid programmes={group.items} />
              </section>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
