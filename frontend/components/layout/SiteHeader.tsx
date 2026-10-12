import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import { telHref, whatsappHref } from '@/lib/contact';
import type { Settings } from '@/lib/wp/types';
import BrandMark from './BrandMark';
import DesktopNav from './DesktopNav';
import MobileNav from './MobileNav';

/** Sticky main header (design system §5.5). */
export default function SiteHeader({ settings }: { settings: Settings }) {
  const applyHref = settings.apply_url || '/admissions/apply';
  return (
    <header className="sticky top-0 z-50 border-b border-ink-200 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <Container className="flex h-16 items-center justify-between gap-4 lg:h-20">
        <BrandMark logo={settings.logo} />
        <div className="flex h-full shrink-0 items-center gap-3 2xl:gap-4">
          <DesktopNav />
          <Button href={applyHref} variant="accent" className="hidden sm:inline-flex">
            Apply Now
          </Button>
          <MobileNav
            logo={settings.logo}
            applyHref={applyHref}
            phoneHref={telHref(settings.phone_admission || settings.phone_office)}
            whatsappHref={whatsappHref(settings.whatsapp)}
          />
        </div>
      </Container>
    </header>
  );
}
