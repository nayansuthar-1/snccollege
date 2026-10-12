import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DocumentLibrary from '@/components/documents/DocumentLibrary';
import EnquiryForm from '@/components/forms/EnquiryForm';
import LandingPageLayout from '@/components/page/LandingPageLayout';
import Prose from '@/components/page/Prose';
import SectionPageLayout from '@/components/page/SectionPageLayout';
import Button from '@/components/ui/Button';
import { getDocumentSection } from '@/config/documents';
import { getSectionRoot, navItemLinks } from '@/config/navigation';
import { getPage, getPaths, getProgrammes, getSettings } from '@/lib/wp/api';
import { renderWpHtml } from '@/lib/wp/html';

/**
 * Every prose page from WordPress (design system §6.2 and §6.3).
 * More specific routes (e.g. app/students/notices/page.tsx) take precedence over this one.
 */

// New pages created in WordPress work without a redeploy.
export const dynamicParams = true;

type PageProps = { params: Promise<{ path: string[] }> };

export async function generateStaticParams() {
  const { pages } = await getPaths();
  return pages.map((path) => ({ path: path.split('/') }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { path } = await params;
  const slug = path.join('/');
  const [page, settings] = await Promise.all([getPage(slug), getSettings()]);
  if (!page) return {};

  const description = page.excerpt || page.subtitle || undefined;
  const image = page.hero_image ?? settings.default_og_image;
  return {
    title: page.title,
    description,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title: page.title,
      description,
      url: `/${slug}`,
      type: 'article',
      images: image ? [{ url: image.url, width: image.width, height: image.height }] : undefined,
    },
  };
}

export default async function WordPressPage({ params }: PageProps) {
  const { path } = await params;
  const slug = path.join('/');
  const page = await getPage(slug);
  if (!page) notFound();

  const href = `/${slug}`;
  const documents = getDocumentSection(href);
  // The admission enquiry form also sits below the "How to Apply" prose (Plan Phase 9 task 5).
  const enquiry = href === '/admissions/apply' ? await Promise.all([getSettings(), getProgrammes()]) : null;
  const content = (
    <>
      <Prose>{renderWpHtml(page.content_html)}</Prose>
      {documents && <DocumentLibrary config={documents} />}
      {enquiry && (
        <div className="mt-12">
          <EnquiryForm
            programmes={enquiry[1].map((programme) => programme.short_name || programme.title)}
            phone={enquiry[0].phone_admission || enquiry[0].phone_office}
            description="Fill in your details and the admission office will call you back."
          />
        </div>
      )}
    </>
  );
  const sectionRoot = getSectionRoot(href);

  // Section root (/about, /academics, …): intro text + cards for the pages inside it.
  if (sectionRoot) {
    const settings = await getSettings();
    const heroAction =
      href === '/admissions' ? (
        <Button href={settings.apply_url || '/admissions/apply'} variant="accent" size="lg">
          Apply Now
        </Button>
      ) : undefined;

    return (
      <LandingPageLayout
        title={page.title}
        subtitle={page.subtitle}
        path={href}
        heroImage={page.hero_image}
        childLinks={navItemLinks(sectionRoot)}
        heroAction={heroAction}
      >
        {content}
      </LandingPageLayout>
    );
  }

  return (
    <SectionPageLayout title={page.title} subtitle={page.subtitle} path={href} heroImage={page.hero_image}>
      {content}
    </SectionPageLayout>
  );
}
