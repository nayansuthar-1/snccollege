import Image from 'next/image';
import Link from 'next/link';
import { Images } from 'lucide-react';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import { formatDate } from '@/lib/format';
import type { AlbumSummary } from '@/lib/wp/types';

/** Album cards: cover 4:3, title, photo count, date (design system §5.23). */
export default function AlbumGrid({ albums }: { albums: AlbumSummary[] }) {
  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {albums.map((album) => (
        <li key={album.id}>
          <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="relative aspect-[4/3] overflow-hidden">
              {album.cover ? (
                <Image
                  src={album.cover.url}
                  alt={album.cover.alt}
                  fill
                  sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <ImagePlaceholder className="h-full" label="" />
              )}
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h3 className="text-lg font-bold leading-snug text-ink-900">
                <Link href={`/campus-life/gallery/${album.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
                  {album.title}
                </Link>
              </h3>
              <p className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-4 text-sm text-ink-500">
                <span className="inline-flex items-center gap-1.5">
                  <Images aria-hidden="true" size={16} strokeWidth={1.75} />
                  {album.photo_count} {album.photo_count === 1 ? 'photo' : 'photos'}
                </span>
                {album.date && <time dateTime={album.date}>{formatDate(album.date)}</time>}
              </p>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
