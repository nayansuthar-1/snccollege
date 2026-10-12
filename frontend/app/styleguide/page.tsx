import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GraduationCap, FlaskConical, Library, MapPin } from 'lucide-react';
import FeatureCard from '@/components/cards/FeatureCard';
import InfoCard from '@/components/cards/InfoCard';
import MessageCard from '@/components/cards/MessageCard';
import NewsCard from '@/components/cards/NewsCard';
import PersonCard from '@/components/cards/PersonCard';
import ProgrammeCard from '@/components/cards/ProgrammeCard';
import TestimonialCard from '@/components/cards/TestimonialCard';
import DocumentList from '@/components/documents/DocumentList';
import PageHero from '@/components/page/PageHero';
import Prose from '@/components/page/Prose';
import Accordion from '@/components/ui/Accordion';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import Pagination from '@/components/ui/Pagination';
import Section from '@/components/ui/Section';
import SectionHeader from '@/components/ui/SectionHeader';
import TabLinks from '@/components/ui/TabLinks';
import Tabs from '@/components/ui/Tabs';
import { renderWpHtml } from '@/lib/wp/html';

export const metadata: Metadata = { title: 'Styleguide', robots: { index: false, follow: false } };

/*
 * Development-only component gallery (Plan Phase 1).
 * Every value below is an obviously labelled SAMPLE for visual checking — never real content.
 */

const swatches = [
  ['primary-950', 'bg-primary-950'],
  ['primary-900', 'bg-primary-900'],
  ['primary-800', 'bg-primary-800'],
  ['primary-700', 'bg-primary-700'],
  ['primary-100', 'bg-primary-100'],
  ['primary-50', 'bg-primary-50'],
  ['gold-600', 'bg-gold-600'],
  ['gold-500', 'bg-gold-500'],
  ['gold-400', 'bg-gold-400'],
  ['gold-100', 'bg-gold-100'],
  ['ink-900', 'bg-ink-900'],
  ['ink-700', 'bg-ink-700'],
  ['ink-500', 'bg-ink-500'],
  ['ink-300', 'bg-ink-300'],
  ['ink-200', 'bg-ink-200'],
  ['ink-50', 'bg-ink-50'],
] as const;

const sampleDate = new Date().toISOString().slice(0, 10);

/** Hostile WordPress HTML: everything marked UNSAFE must disappear when rendered. */
const sanitiserSample = `
<p style="color:red" onclick="alert('UNSAFE-onclick')">Paragraph whose inline style and onclick must be removed.</p>
<script>alert('UNSAFE-script')</script><style>body{display:none}</style>
<p><a href="javascript:alert('UNSAFE-js-href')">javascript: link (href removed)</a></p>
<p><a href="${process.env.WORDPRESS_URL ?? ''}/about/vision-mission/">WordPress link (rewritten to /about/vision-mission)</a></p>
<p><a href="https://ggtu.ac.in">External link (new tab)</a></p>
<iframe src="https://evil.example.com/UNSAFE-iframe"></iframe>
<table><tr><td>Bare table</td><td>wrapped in .table-scroll</td></tr></table>`;

export default function StyleguidePage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <>
      <PageHero
        title="Component styleguide"
        subtitle="Sample props only. Used to check components against docs/01-DESIGN-SYSTEM.md."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Styleguide' }]}
      />

      <Section>
        <SectionHeader eyebrow="Tokens" title="Colour" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {swatches.map(([name, cls]) => (
            <div key={name} className="overflow-hidden rounded-xl border border-ink-200">
              <div className={`h-16 ${cls}`} />
              <p className="px-3 py-2 text-xs font-semibold text-ink-700">{name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeader eyebrow="Tokens" title="Typography" />
        <div className="space-y-6">
          <p className="font-serif text-3xl font-bold leading-tight text-ink-900 md:text-5xl md:leading-[1.15]">Hero title — Merriweather</p>
          <p className="font-serif text-[1.75rem] font-bold leading-snug text-ink-900 md:text-4xl">H2 section title</p>
          <p className="text-lg font-bold text-ink-900 md:text-xl">H3 card title — Plus Jakarta Sans</p>
          <p className="text-base leading-relaxed text-ink-700 md:text-lg">Lead paragraph. Formal, clear, institutional English with comfortable line length.</p>
          <p className="max-w-prose text-base leading-7 text-ink-700">
            Body text. Sample paragraph used to check measure and line height across breakpoints. It should never exceed roughly
            seventy-five characters per line on wide screens.
          </p>
          <p className="text-sm text-ink-500">Small / meta text · 9 Oct 2026</p>
          <p lang="hi" className="text-base text-ink-700">
            देवनागरी नमूना पाठ (Devanagari sample)
          </p>
        </div>
      </Section>

      <Section>
        <SectionHeader eyebrow="Actions" title="Buttons & badges" />
        <div className="flex flex-wrap items-center gap-3">
          <Button href="/styleguide">Primary</Button>
          <Button href="/styleguide" variant="accent">
            Apply Now
          </Button>
          <Button href="/styleguide" variant="outline">
            Outline
          </Button>
          <Button href="/styleguide" variant="link">
            Link button
          </Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="mt-6 inline-flex flex-wrap gap-3 rounded-xl bg-primary-950 p-6">
          <Button href="/styleguide" variant="accent">
            Accent on dark
          </Button>
          <Button href="/styleguide" variant="outline-light">
            Outline light
          </Button>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Badge tone="new">New</Badge>
          <Badge tone="important">Important</Badge>
          <Badge tone="info">Undergraduate</Badge>
          <Badge>Neutral</Badge>
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeader eyebrow="Headers" title="Section header, centred" align="center" description="Centred variant with the gold rule below the title." />
        <SectionHeader
          eyebrow="Headers"
          title="Section header with action"
          description="Left aligned with a link action on the right."
          action={{ label: 'View all', href: '/styleguide' }}
        />
      </Section>

      <Section>
        <SectionHeader eyebrow="Cards" title="Feature, info & programme cards" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          <FeatureCard icon={GraduationCap} title="Sample feature card" text="Short supporting sentence of about twenty words that explains the feature clearly and briefly." />
          <FeatureCard icon={FlaskConical} title="Sample feature two" text="Cards in a row stay equal height even when their text lengths differ." />
          <InfoCard title="Sample info card (link)" icon={Library} href="/styleguide">
            One line description of a child page.
          </InfoCard>
          <ProgrammeCard
            programme={{
              id: 1,
              slug: 'sample',
              title: 'Sample Programme Card',
              short_name: 'SAMPLE',
              level: { slug: 'ug', name: 'Undergraduate' },
              excerpt: '',
              duration: '3 years',
              pattern: 'Semester pattern',
              subjects: ['Subject A', 'Subject B', 'Subject C'],
              image: null,
            }}
          />
          <NewsCard
            item={{
              id: 1,
              slug: 'sample',
              title: 'Sample news card title that may run onto two lines',
              date: sampleDate,
              excerpt: 'Sample excerpt text for checking the three-line clamp on news cards across breakpoints.',
              category: { slug: 'events', name: 'Events' },
              image: null,
            }}
          />
          <InfoCard title="Sample info card (static)" icon={MapPin}>
            Address line one, line two, PIN 000000
          </InfoCard>
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeader eyebrow="Cards" title="People & quotes" />
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <MessageCard
            leader={{
              id: 1,
              name: 'Sample Name',
              designation: 'Sample Designation',
              excerpt: 'Sample short message excerpt of around forty to sixty words, set in the serif face so it reads as a considered quotation from the leadership.',
              content_html: '',
              photo: null,
            }}
          />
          <TestimonialCard
            testimonial={{
              id: 1,
              name: 'Sample Student',
              quote: 'Sample testimonial text used only for layout checks.',
              programme_batch: 'Sample Programme, 2025',
              photo: null,
              source: 'google',
              rating: 4,
              review_url: '',
              date: '2026-01-15',
            }}
          />
        </div>
        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          <PersonCard
            person={{
              id: 1,
              name: 'Dr. Sample Person',
              designation: 'Assistant Professor',
              qualification: 'M.Sc., Ph.D.',
              experience: '',
              department: { slug: 'science', name: 'Science' },
              staff_type: null,
              email: '',
              photo: null,
            }}
          />
        </div>
      </Section>

      <Section>
        <SectionHeader eyebrow="Documents" title="Document list" />
        <DocumentList
          caption="Sample documents"
          metaColumns={['Programme', 'Category', 'Type']}
          items={[
            {
              id: 1,
              title: '[SAMPLE] B.A. Part I Merit List 1',
              date: sampleDate,
              important: true,
              meta: [
                { label: 'Programme', value: 'B.A.' },
                { label: 'Category', value: 'General' },
                { label: 'Type', value: 'Merit List' },
              ],
              file: { url: '#', mime: 'application/pdf', size_bytes: 430080, filename: 'sample.pdf' },
            },
            {
              id: 2,
              title: '[SAMPLE] B.Sc. Part I Waiting List 1',
              date: '2026-07-20',
              meta: [
                { label: 'Programme', value: 'B.Sc.' },
                { label: 'Category', value: 'OBC' },
                { label: 'Type', value: 'Waiting List' },
              ],
              file: { url: '#', mime: 'application/pdf', size_bytes: 1288490, filename: 'sample.pdf' },
            },
          ]}
        />
        <div className="mt-10">
          <DocumentList caption="Empty sample" items={[]} emptyTitle="No merit lists published for this session yet" />
        </div>
        <Pagination page={3} totalPages={8} baseHref="/styleguide" />
      </Section>

      <Section tone="muted">
        <SectionHeader eyebrow="Interaction" title="Tabs & accordion" />
        <Tabs
          label="Sample tabs"
          items={[
            { id: 'a', label: 'All', content: <p>Panel one sample content.</p> },
            { id: 'b', label: 'Arts', content: <p>Panel two sample content.</p> },
            { id: 'c', label: 'Science', content: <p>Panel three sample content.</p> },
          ]}
        />
        <TabLinks
          className="mt-10"
          label="Sample URL tabs"
          items={[
            { label: 'All', href: '/styleguide', active: true },
            { label: 'Admission', href: '/styleguide?type=admission', active: false },
            { label: 'Examination', href: '/styleguide?type=examination', active: false },
          ]}
        />
        <div className="mt-10 space-y-3">
          <Accordion title="Sample committee" meta="2026-27" defaultOpen>
            Sample accordion content.
          </Accordion>
          <Accordion title="Another sample committee" meta="2026-27">
            Hidden until opened.
          </Accordion>
        </div>
      </Section>

      <Section>
        <SectionHeader eyebrow="Content" title="Prose & empty states" />
        <div className="grid gap-12 lg:grid-cols-12">
          <Prose className="lg:col-span-8">
            <h2>Sample H2 inside prose</h2>
            <p>
              Sample paragraph with a <a href="#">sample link</a> and <strong>bold text</strong>.
            </p>
            <ul>
              <li>Sample list item one</li>
              <li>Sample list item two</li>
            </ul>
            <h3>Sample H3</h3>
            <blockquote>Sample blockquote in the serif face.</blockquote>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Sample Name</td>
                    <td>Sample Designation</td>
                    <td>Convener</td>
                  </tr>
                  <tr>
                    <td>Sample Name</td>
                    <td>Sample Designation</td>
                    <td>Member</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Prose>
          <div className="space-y-6 lg:col-span-4">
            <EmptyState title="Nothing published yet" description="Sample empty state helper text." />
            <ImagePlaceholder aspect="aspect-[16/10]" className="rounded-xl" />
          </div>
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeader eyebrow="Security" title="WordPress HTML sanitiser check" description="Rendered from hostile sample markup. Nothing labelled UNSAFE may appear in the page source." />
        <Prose>
          <div id="sanitiser-check">{renderWpHtml(sanitiserSample)}</div>
        </Prose>
      </Section>
    </>
  );
}
