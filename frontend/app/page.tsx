import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import AboutIntro from '@/components/home/AboutIntro';
import CtaBand from '@/components/home/CtaBand';
import HeroSlider from '@/components/home/HeroSlider';
import LeadershipSection from '@/components/home/LeadershipSection';
import LifeAtSnc from '@/components/home/LifeAtSnc';
import NewsSection from '@/components/home/NewsSection';
import ProgrammesSection from '@/components/home/ProgrammesSection';
import QuickLinks from '@/components/home/QuickLinks';
import StaticHero from '@/components/home/StaticHero';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import WhyChoose from '@/components/home/WhyChoose';
import type { SectionTone } from '@/components/ui/Section';
import { siteConfig } from '@/config/site';
import { getHome, getSettings } from '@/lib/wp/api';
import type { Settings } from '@/lib/wp/types';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: { absolute: 'Shiv Narayan Choubisa College, Simalwara | SNC College' },
    description: settings.short_about || undefined,
    alternates: { canonical: '/' },
    openGraph: {
      title: 'Shiv Narayan Choubisa College, Simalwara',
      description: settings.short_about || undefined,
      url: '/',
      type: 'website',
      images: settings.default_og_image ? [{ url: settings.default_og_image.url }] : undefined,
    },
  };
}

function collegeJsonLd(settings: Settings) {
  const sameAs = [settings.facebook, settings.instagram, settings.youtube].filter(Boolean);
  const data = {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    name: settings.college_name || 'Shiv Narayan Choubisa College, Simalwara',
    url: siteConfig.url,
    logo: settings.logo?.url ?? new URL(siteConfig.logo.src, siteConfig.url).toString(),
    ...(settings.address ? { address: settings.address } : {}),
    ...(settings.phone_admission || settings.phone_office ? { telephone: settings.phone_admission || settings.phone_office } : {}),
    ...(settings.email ? { email: settings.email } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

type Block = { key: string; band?: boolean; render: (tone: SectionTone) => ReactNode };

/** Homepage — order fixed by design system §6.1. Sections without data are omitted. */
export default async function HomePage() {
  const [settings, home] = await Promise.all([getSettings(), getHome()]);
  const applyHref = settings.apply_url || '/admissions/apply';

  const blocks: Block[] = [
    { key: 'about', render: (tone) => <AboutIntro settings={settings} notices={home.notices} tone={tone} /> },
  ];
  if (home.programmes.length > 0) blocks.push({ key: 'programmes', render: (tone) => <ProgrammesSection programmes={home.programmes} tone={tone} /> });
  if (settings.why_items.length > 0) blocks.push({ key: 'why', render: (tone) => <WhyChoose items={settings.why_items} tone={tone} /> });
  blocks.push({ key: 'cta', band: true, render: () => <CtaBand settings={settings} applyHref={applyHref} /> });
  if (home.leaders.length > 0) blocks.push({ key: 'leaders', render: (tone) => <LeadershipSection leaders={home.leaders} tone={tone} /> });
  if (home.news.length > 0) blocks.push({ key: 'news', render: (tone) => <NewsSection news={home.news} tone={tone} /> });
  if (home.gallery.length >= 5) blocks.push({ key: 'life', render: (tone) => <LifeAtSnc photos={home.gallery} tone={tone} /> });
  // "What People Say About Us": needs a Google score or at least one published review.
  if (settings.google_rating || home.testimonials.length > 0) {
    blocks.push({ key: 'testimonials', render: (tone) => <TestimonialsSection testimonials={home.testimonials} settings={settings} tone={tone} /> });
  }
  // AffiliationStrip is added once official university logos are supplied (Plan Phase 5 task 10).

  // Alternate white / muted by position; a dark band resets the alternation, so equal tones never touch.
  let next: SectionTone = 'white';
  const rendered = blocks.map((block) => {
    if (block.band) {
      next = 'white';
      return <div key={block.key}>{block.render('dark')}</div>;
    }
    const tone = next;
    next = tone === 'white' ? 'muted' : 'white';
    return <div key={block.key}>{block.render(tone)}</div>;
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: collegeJsonLd(settings) }} />
      {home.slides.length > 0 ? <HeroSlider slides={home.slides} /> : <StaticHero settings={settings} applyHref={applyHref} />}
      <QuickLinks sessionLabel={settings.session_label} />
      {rendered}
    </>
  );
}
