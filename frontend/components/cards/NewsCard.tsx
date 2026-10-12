import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import { formatDate } from '@/lib/format';
import type { NewsSummary } from '@/lib/wp/types';

export default function NewsCard({ item }: { item: NewsSummary }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-video overflow-hidden">
        {item.image ? (
          <Image
            src={item.image.url}
            alt={item.image.alt}
            fill
            sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <ImagePlaceholder className="h-full" label="" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="flex flex-wrap items-center gap-3 text-sm text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays aria-hidden="true" size={16} strokeWidth={1.75} />
            <time dateTime={item.date}>{formatDate(item.date)}</time>
          </span>
          {item.category && <Badge tone="info">{item.category.name}</Badge>}
        </p>
        <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-snug text-ink-900">
          <Link href={`/news/${item.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {item.title}
          </Link>
        </h3>
        {item.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink-700">{item.excerpt}</p>}
        <span className="mt-auto flex items-center gap-2 pt-5 text-sm font-semibold text-primary-800">
          Read more
          <ArrowRight aria-hidden="true" size={16} strokeWidth={1.75} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}
