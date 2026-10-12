import type { Metadata } from 'next';
import { Merriweather, Plus_Jakarta_Sans } from 'next/font/google';
import MobileActionBar from '@/components/layout/MobileActionBar';
import SiteFooter from '@/components/layout/SiteFooter';
import SiteHeader from '@/components/layout/SiteHeader';
import SkipLink from '@/components/layout/SkipLink';
import TopBar from '@/components/layout/TopBar';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import { siteConfig } from '@/config/site';
import { telHref, whatsappHref } from '@/lib/contact';
import { getSettings } from '@/lib/wp/api';
import './globals.css';

const merriweather = Merriweather({
  subsets: ['latin'],
  // 700 only: nothing uses font-black, and design system §3.2 bans 900 outside an optional
  // hero title. Loading it cost ~48 KB on every page and delayed the text LCP.
  weight: ['700'],
  display: 'swap',
  variable: '--font-merriweather',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-jakarta',
});

const DEFAULT_DESCRIPTION =
  'Official website of Shiv Narayan Choubisa College (SNC College), Simalwara, Dungarpur, Rajasthan. Affiliated to Govind Guru Tribal University, Banswara.';

/**
 * Site-wide defaults. The Open Graph block here is what gives every route a share image:
 * a page that sets its own `openGraph` replaces this one, and those pages already fall back
 * to `default_og_image` themselves.
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const image = settings.default_og_image;

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: 'Shiv Narayan Choubisa College, Simalwara | SNC College',
      template: `%s | ${siteConfig.titleSuffix}`,
    },
    description: DEFAULT_DESCRIPTION,
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      siteName: settings.college_name || 'Shiv Narayan Choubisa College, Simalwara',
      images: image ? [{ url: image.url, width: image.width, height: image.height }] : undefined,
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // From WordPress; if unreachable, empty values simply hide their UI (no fallback facts).
  const settings = await getSettings();
  const applyHref = settings.apply_url || '/admissions/apply';
  const phoneHref = telHref(settings.phone_admission || settings.phone_office);
  const waHref = whatsappHref(settings.whatsapp);

  return (
    <html lang="en" className={`${merriweather.variable} ${jakarta.variable}`}>
      <body className="min-h-dvh bg-white pb-16 font-sans text-ink-700 lg:pb-0">
        <SkipLink />
        <TopBar settings={settings} />
        <SiteHeader settings={settings} />
        <main id="main">{children}</main>
        <SiteFooter settings={settings} />
        <MobileActionBar phoneHref={phoneHref} whatsappHref={waHref} applyHref={applyHref} />
        <WhatsAppButton href={waHref} />
      </body>
    </html>
  );
}
