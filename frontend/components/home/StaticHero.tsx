import Image from 'next/image';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import { logoSrc } from '@/config/site';
import type { Settings } from '@/lib/wp/types';

/** Shown when no homepage slides are published (Plan Phase 5 task 3). */
export default function StaticHero({ settings, applyHref }: { settings: Settings; applyHref: string }) {
  const name = settings.college_name || 'Shiv Narayan Choubisa College';
  const eyebrow = settings.session_label ? `Admissions ${settings.session_label}` : 'Simalwara, Dungarpur';
  const emblem = logoSrc(settings.logo);

  return (
    <section aria-label="Welcome" className="relative isolate overflow-hidden bg-primary-950">
      {settings.cta_image && (
        <>
          <Image src={settings.cta_image.url} alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-primary-950/90 via-primary-950/70 to-primary-950/40" />
        </>
      )}
      <Container className="grid items-center gap-12 py-20 md:py-28 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-gold-400">
            <span aria-hidden="true" className="h-0.5 w-8 bg-gold-500" />
            {eyebrow}
          </p>
          <h1 className="font-serif text-3xl font-bold leading-tight text-white md:text-5xl md:leading-[1.15]">{name}</h1>
          {settings.short_about && <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">{settings.short_about}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={applyHref} variant="accent" size="lg">
              Apply Now
            </Button>
            <Button href="/academics/programmes" variant="outline-light" size="lg">
              Explore programmes
            </Button>
          </div>
        </div>
        <div className="hidden justify-center lg:col-span-4 lg:flex">
          <Image
            src={emblem.src}
            alt=""
            width={emblem.width}
            height={emblem.height}
            priority
            sizes="288px"
            className="size-64 object-contain xl:size-72"
          />
        </div>
      </Container>
    </section>
  );
}
