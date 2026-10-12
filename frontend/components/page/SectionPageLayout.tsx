import type { ReactNode } from 'react';
import Container from '@/components/ui/Container';
import { getBreadcrumbs, getSectionForPath, navItemLinks } from '@/config/navigation';
import type { Img } from '@/lib/wp/types';
import PageHero from './PageHero';
import SectionNav from './SectionNav';

type SectionPageLayoutProps = {
  title: string;
  subtitle?: string;
  path: string;
  heroImage?: Img | null;
  children: ReactNode;
};

/** Default inner-page template: hero + sticky section sidebar + content (design system §6.2). */
export default function SectionPageLayout({ title, subtitle, path, heroImage, children }: SectionPageLayoutProps) {
  const section = getSectionForPath(path);
  const links = section ? navItemLinks(section) : [];

  return (
    <>
      <PageHero title={title} subtitle={subtitle} breadcrumbs={getBreadcrumbs(path, title)} image={heroImage} />
      <div className="bg-white py-16 md:py-20">
        <Container>
          {section && links.length > 1 ? (
            <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
              <aside className="lg:sticky lg:top-28 lg:col-span-3">
                <SectionNav title={section.label} links={links} currentPath={path} />
              </aside>
              <div className="min-w-0 lg:col-span-9">{children}</div>
            </div>
          ) : (
            <div className="min-w-0">{children}</div>
          )}
        </Container>
      </div>
    </>
  );
}
