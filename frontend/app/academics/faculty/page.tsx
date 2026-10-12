import type { Metadata } from 'next';
import { Users } from 'lucide-react';
import FacultyGroups from '@/components/academics/FacultyGroups';
import PageHero from '@/components/page/PageHero';
import Prose from '@/components/page/Prose';
import EmptyState from '@/components/ui/EmptyState';
import Section from '@/components/ui/Section';
import TabLinks from '@/components/ui/TabLinks';
import { getBreadcrumbs } from '@/config/navigation';
import { param, type SearchParams } from '@/lib/search-params';
import { getFaculty, getPage } from '@/lib/wp/api';
import { renderWpHtml } from '@/lib/wp/html';
import type { Person, Term } from '@/lib/wp/types';

const PATH = '/academics/faculty';
const WP_PATH = 'academics/faculty';
const FALLBACK_TITLE = 'Faculty & Staff';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(WP_PATH);
  return {
    title: page?.title ?? FALLBACK_TITLE,
    description: page?.excerpt || 'Teaching and administrative staff of Shiv Narayan Choubisa College, Simalwara.',
    alternates: { canonical: PATH },
  };
}

/** Departments that actually have people, in the order they appear in WordPress. */
function departmentsOf(people: Person[]): Term[] {
  const seen = new Map<string, Term>();
  for (const person of people) {
    if (person.department && !seen.has(person.department.slug)) seen.set(person.department.slug, person.department);
  }
  return [...seen.values()];
}

export default async function FacultyPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const department = param(sp, 'department');

  const [page, everyone] = await Promise.all([getPage(WP_PATH), getFaculty()]);
  const title = page?.title ?? FALLBACK_TITLE;
  const departments = departmentsOf(everyone);
  const active = departments.find((d) => d.slug === department);
  const people = active ? everyone.filter((person) => person.department?.slug === active.slug) : everyone;

  const tabs = [
    { label: 'All', href: PATH, active: !active },
    ...departments.map((d) => ({ label: d.name, href: `${PATH}?department=${d.slug}`, active: active?.slug === d.slug })),
  ];

  return (
    <>
      <PageHero
        title={title}
        subtitle={page?.subtitle || 'Teaching and administrative staff of the college.'}
        breadcrumbs={getBreadcrumbs(PATH, title)}
        image={page?.hero_image}
      />
      <Section>
        {page?.content_html && <Prose className="mb-10">{renderWpHtml(page.content_html)}</Prose>}

        {departments.length > 1 && <TabLinks items={tabs} label="Filter staff by department" className="mb-10" />}

        {people.length === 0 ? (
          <EmptyState
            icon={Users}
            title={active ? `No staff listed for ${active.name} yet` : 'No staff listed yet'}
            description="Faculty and staff details appear here as soon as the college publishes them."
          />
        ) : (
          <FacultyGroups people={people} />
        )}
      </Section>
    </>
  );
}
