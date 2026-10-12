import type { Metadata } from 'next';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import InfoCard from '@/components/cards/InfoCard';
import EnquiryForm from '@/components/forms/EnquiryForm';
import PageHero from '@/components/page/PageHero';
import Prose from '@/components/page/Prose';
import Section from '@/components/ui/Section';
import { getBreadcrumbs } from '@/config/navigation';
import { telHref } from '@/lib/contact';
import { getPage, getProgrammes, getSettings } from '@/lib/wp/api';
import { renderWpHtml } from '@/lib/wp/html';

const PATH = '/contact';
const WP_PATH = 'contact';
const FALLBACK_TITLE = 'Contact';

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage(WP_PATH), getSettings()]);
  return {
    title: page?.title ?? FALLBACK_TITLE,
    description:
      page?.excerpt ||
      [settings.college_name, settings.address].filter(Boolean).join(' — ') ||
      'Contact Shiv Narayan Choubisa College, Simalwara.',
    alternates: { canonical: PATH },
  };
}

export default async function ContactPage() {
  const [page, settings, programmes] = await Promise.all([getPage(WP_PATH), getSettings(), getProgrammes()]);
  const title = page?.title ?? FALLBACK_TITLE;
  const phones = [settings.phone_admission, settings.phone_office].filter(Boolean);
  const hasAside = Boolean(settings.map_embed_url || settings.office_hours);

  return (
    <>
      <PageHero
        title={title}
        subtitle={page?.subtitle || 'Address, phone numbers and enquiries.'}
        breadcrumbs={getBreadcrumbs(PATH, title)}
        image={page?.hero_image}
      />

      <Section>
        {page?.content_html && <Prose className="mb-10">{renderWpHtml(page.content_html)}</Prose>}

        {/* The cards' titles are <h3>, so they need an <h2> above them; the design shows none. */}
        <h2 className="sr-only">Contact details</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {settings.address && (
            <InfoCard title="Address" icon={MapPin}>
              <p className="whitespace-pre-line">{settings.address}</p>
              {settings.map_link && (
                <a
                  href={settings.map_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block font-semibold text-primary-800 underline underline-offset-4 hover:text-primary-700"
                >
                  Get directions<span className="sr-only"> (opens in new tab)</span>
                </a>
              )}
            </InfoCard>
          )}

          {phones.length > 0 && (
            <InfoCard title="Phone" icon={Phone}>
              <ul>
                {phones.map((phone) => (
                  <li key={phone}>
                    <a href={telHref(phone)} className="font-medium text-primary-800 hover:underline">
                      {phone}
                    </a>
                  </li>
                ))}
              </ul>
            </InfoCard>
          )}

          {settings.email && (
            <InfoCard title="Email" icon={Mail}>
              <a href={`mailto:${settings.email}`} className="break-all font-medium text-primary-800 hover:underline">
                {settings.email}
              </a>
            </InfoCard>
          )}
        </div>
      </Section>

      <Section tone="muted">
        {/* Without a map or office hours there is nothing beside the form, so it takes the full column. */}
        <div className={hasAside ? 'grid items-start gap-10 lg:grid-cols-12 lg:gap-12' : 'max-w-3xl'}>
          <div className={hasAside ? 'lg:col-span-7' : undefined}>
            <EnquiryForm
              programmes={programmes.map((programme) => programme.short_name || programme.title)}
              phone={settings.phone_admission || settings.phone_office}
              description="Fill in your details and the admission office will call you back."
            />
          </div>

          {hasAside && (
            <div className="lg:col-span-5">
              {settings.map_embed_url && (
                <iframe
                  src={settings.map_embed_url}
                  title={`Map showing ${settings.college_name || 'the college'}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="aspect-[4/3] w-full rounded-xl border border-ink-200"
                />
              )}
              {settings.office_hours && (
                <div className="mt-6 rounded-xl border border-ink-200 bg-white p-6 shadow-sm">
                  <h2 className="flex items-center gap-2 font-serif text-lg font-bold leading-snug text-ink-900">
                    <Clock aria-hidden="true" size={20} strokeWidth={1.75} className="text-primary-800" />
                    Office hours
                  </h2>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-ink-700">{settings.office_hours}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
