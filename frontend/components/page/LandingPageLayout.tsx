import type { ReactNode } from 'react';
import InfoCard from '@/components/cards/InfoCard';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import { getBreadcrumbs, type NavLink } from '@/config/navigation';
import type { Img } from '@/lib/wp/types';
import PageHero from './PageHero';

type LandingPageLayoutProps = {
  title: string;
  subtitle?: string;
  path: string;
  heroImage?: Img | null;
  /** Intro content (usually WordPress prose). */
  children?: ReactNode;
  /** Child pages shown as cards. */
  childLinks: NavLink[];
  heroAction?: ReactNode;
};

/** Section root template (design system §6.3): hero → intro → child-page cards. */
export default function LandingPageLayout({ title, subtitle, path, heroImage, children, childLinks, heroAction }: LandingPageLayoutProps) {
  const cards = childLinks.filter((l) => l.href !== path);
  return (
    <>
      <PageHero title={title} subtitle={subtitle} breadcrumbs={getBreadcrumbs(path, title)} image={heroImage} action={heroAction} />
      {children && (
        <div className="bg-white py-16 md:py-24">
          <Container>{children}</Container>
        </div>
      )}
      {cards.length > 0 && (
        <div className={children ? 'bg-ink-50 py-16 md:py-24' : 'bg-white py-16 md:py-24'}>
          <Container>
            <SectionHeader eyebrow={title} title={`Explore ${title}`} />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {cards.map((link) => (
                <InfoCard key={link.href} title={link.label} href={link.href}>
                  {link.description}
                </InfoCard>
              ))}
            </div>
          </Container>
        </div>
      )}
    </>
  );
}
