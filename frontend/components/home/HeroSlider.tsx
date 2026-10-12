'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import { cn } from '@/lib/cn';
import type { Slide } from '@/lib/wp/types';

const frame = 'relative w-full overflow-hidden bg-primary-950 aspect-[4/5] md:aspect-[16/7] lg:aspect-[16/6] lg:max-h-[640px]';

function SlideContent({ slide, index }: { slide: Slide; index: number }) {
  const mobile = slide.image_mobile ?? slide.image_desktop;
  const images = (
    <>
      <Image
        src={slide.image_desktop.url}
        alt={slide.heading ? '' : slide.image_desktop.alt}
        fill
        priority={index === 0}
        sizes="100vw"
        className="hidden object-cover md:block"
      />
      <Image
        src={mobile.url}
        alt={slide.heading ? '' : mobile.alt}
        fill
        priority={index === 0}
        sizes="100vw"
        className="object-cover md:hidden"
      />
    </>
  );

  // Designed banner (text is inside the image): optionally the whole slide is a link.
  if (!slide.heading) {
    return slide.link_url ? (
      <Link href={slide.link_url} className="absolute inset-0 block">
        {images}
      </Link>
    ) : (
      images
    );
  }

  return (
    <>
      {images}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-primary-950/85 via-primary-950/55 to-transparent" />
      <Container className="absolute inset-0 flex items-end pb-16 md:items-center md:pb-0">
        <div className="max-w-xl">
          {slide.eyebrow && <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-gold-400">{slide.eyebrow}</p>}
          <h2 className="font-serif text-3xl font-bold leading-tight text-white md:text-5xl md:leading-[1.15]">{slide.heading}</h2>
          {slide.subtext && <p className="mt-4 text-base leading-relaxed text-white/85 md:text-lg">{slide.subtext}</p>}
          {(slide.cta1 || slide.cta2) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {slide.cta1 && (
                <Button href={slide.cta1.url} variant="accent" size="lg">
                  {slide.cta1.label}
                </Button>
              )}
              {slide.cta2 && (
                <Button href={slide.cta2.url} variant="outline-light" size="lg">
                  {slide.cta2.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </Container>
    </>
  );
}

/** Homepage banner slider (design system §5.8). The server passes at least one slide. */
export default function HeroSlider({ slides }: { slides: Slide[] }) {
  const multiple = slides.length > 1;
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: multiple, active: multiple }, [
    Autoplay({ delay: 6000, playOnInit: false, stopOnInteraction: true, stopOnMouseEnter: true, stopOnFocusIn: true }),
  ]);
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (multiple && !reduced) emblaApi.plugins().autoplay?.play();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect, multiple]);

  return (
    <section aria-roledescription="carousel" aria-label="Highlights" className={frame}>
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slides.length}`}
              className="relative h-full min-w-0 flex-[0_0_100%]"
            >
              <SlideContent slide={slide} index={i} />
            </div>
          ))}
        </div>
      </div>

      {multiple && (
        <>
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white transition-colors duration-200 hover:bg-white/25 md:grid"
          >
            <ChevronLeft aria-hidden="true" size={22} />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white transition-colors duration-200 hover:bg-white/25 md:grid"
          >
            <ChevronRight aria-hidden="true" size={22} />
          </button>
          <div className="absolute inset-x-0 bottom-5 flex justify-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => emblaApi?.scrollTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === selected ? 'true' : undefined}
                className={cn('h-2 rounded-full transition-all duration-200', i === selected ? 'w-6 bg-gold-500' : 'w-2 bg-white/50 hover:bg-white/80')}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
