import Image from 'next/image';
import Section, { type SectionTone } from '@/components/ui/Section';
import SectionHeader from '@/components/ui/SectionHeader';
import { cn } from '@/lib/cn';
import type { Img } from '@/lib/wp/types';

/** Bento photo grid, exactly 5 photos (design system §5.23). Render only when 5 are available. */
export default function LifeAtSnc({ photos, tone }: { photos: Img[]; tone: SectionTone }) {
  return (
    <Section tone={tone} labelledBy="life-heading">
      <SectionHeader id="life-heading" eyebrow="Campus life" title="Life @ SNC" action={{ label: 'View photo gallery', href: '/campus-life/gallery' }} />
      <ul className="grid grid-cols-2 gap-3 md:h-[520px] md:grid-cols-4 md:grid-rows-2 lg:gap-4">
        {photos.slice(0, 5).map((photo, i) => (
          <li
            key={photo.url}
            className={cn('group relative overflow-hidden rounded-xl', i === 0 ? 'col-span-2 aspect-[4/3] md:row-span-2 md:aspect-auto' : 'aspect-square md:aspect-auto')}
          >
            <Image
              src={photo.url}
              alt={photo.alt}
              fill
              sizes={i === 0 ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 768px) 25vw, 50vw'}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            {photo.alt && (
              <span className="absolute bottom-3 left-3 max-w-[85%] rounded-md bg-primary-950/70 px-2.5 py-1 text-xs font-medium text-white [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:transition-opacity [@media(hover:hover)]:group-hover:opacity-100">
                {photo.alt}
              </span>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}
