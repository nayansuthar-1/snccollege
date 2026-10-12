import Image from 'next/image';
import Link from 'next/link';
import { logoSrc } from '@/config/site';
import type { Img } from '@/lib/wp/types';

/**
 * Emblem + college name (design system §5.5). The whole block links to the homepage.
 * The name is a brand label, not a CMS fact; the logo comes from WordPress when one is set.
 */
export default function BrandMark({ logo }: { logo?: Img | null }) {
  const emblem = logoSrc(logo);
  return (
    <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Shiv Narayan Choubisa College, home">
      <Image
        src={emblem.src}
        alt=""
        width={emblem.width}
        height={emblem.height}
        priority
        sizes="56px"
        className="size-12 shrink-0 object-contain lg:size-14"
      />
      <span className="min-w-0">
        <span className="block font-serif text-[15px] font-bold leading-tight text-primary-950 sm:whitespace-nowrap sm:text-lg xl:text-[15px] 2xl:text-lg">
          Shiv Narayan Choubisa College
        </span>
        <span className="mt-0.5 hidden whitespace-nowrap text-xs text-ink-500 sm:block">
          Simalwara, Dungarpur<span className="xl:hidden 2xl:inline"> · Affiliated to GGTU, Banswara</span>
        </span>
      </span>
    </Link>
  );
}

