import Image from 'next/image';
import type { ReactNode } from 'react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Container from '@/components/ui/Container';
import type { Crumb } from '@/config/navigation';
import type { Img } from '@/lib/wp/types';

type PageHeroProps = {
  title: string;
  subtitle?: string;
  breadcrumbs: Crumb[];
  image?: Img | null;
  /** Only the Admissions landing page may pass an action (one accent button). */
  action?: ReactNode;
};

export default function PageHero({ title, subtitle, breadcrumbs, image, action }: PageHeroProps) {
  return (
    <div className="relative isolate overflow-hidden bg-primary-950 text-white">
      {image && (
        <Image src={image.url} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-20" />
      )}
      <Container className="py-14 md:py-20">
        <div className="mb-5">
          <Breadcrumbs items={breadcrumbs} />
        </div>
        <h1 className="max-w-4xl font-serif text-3xl font-bold leading-tight text-white md:text-[2.75rem] md:leading-[1.2]">
          {title}
        </h1>
        {subtitle && <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">{subtitle}</p>}
        {action && <div className="mt-8">{action}</div>}
      </Container>
    </div>
  );
}
