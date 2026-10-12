import Image from 'next/image';
import { Phone } from 'lucide-react';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import { telHref } from '@/lib/contact';
import type { Settings } from '@/lib/wp/types';

/** Admission call-to-action band (design system §5.12). */
export default function CtaBand({ settings, applyHref }: { settings: Settings; applyHref: string }) {
  const phone = settings.phone_admission || settings.phone_office;
  return (
    <section aria-labelledby="cta-heading" className="relative isolate overflow-hidden bg-primary-950">
      {settings.cta_image && <Image src={settings.cta_image.url} alt="" fill sizes="100vw" className="-z-10 object-cover" />}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-primary-950/80" />
      <Container className="py-16 text-center md:py-24">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-gold-400">
          {settings.session_label ? `Admissions ${settings.session_label}` : 'Admissions'}
        </p>
        <h2 id="cta-heading" className="mx-auto max-w-3xl font-serif text-[1.75rem] font-bold leading-snug text-white md:text-4xl md:leading-tight">
          {settings.cta_heading || 'Begin your journey at SNC College'}
        </h2>
        {settings.cta_text && <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">{settings.cta_text}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href={applyHref} variant="accent" size="lg">
            Apply Now
          </Button>
          {phone && (
            <Button href={telHref(phone)} variant="outline-light" size="lg">
              <Phone aria-hidden="true" size={18} strokeWidth={1.75} />
              Call admission cell
            </Button>
          )}
        </div>
      </Container>
    </section>
  );
}
