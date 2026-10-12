import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import type { ProgrammeSummary } from '@/lib/wp/types';

export default function ProgrammeCard({ programme }: { programme: ProgrammeSummary }) {
  const href = `/academics/programmes/${programme.slug}`;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[16/10] overflow-hidden">
        {programme.image ? (
          <Image
            src={programme.image.url}
            alt={programme.image.alt}
            fill
            sizes="(min-width: 1024px) 480px, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <ImagePlaceholder className="h-full" label={`${programme.title} photo coming soon`} />
        )}
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-8">
        {programme.level && (
          <div>
            <Badge tone="info">{programme.level.name}</Badge>
          </div>
        )}
        <h3 className="mt-3 text-lg font-bold leading-snug text-ink-900 md:text-xl">
          <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
            {programme.title}
          </Link>
        </h3>
        {(programme.duration || programme.pattern) && (
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-500">
            {programme.duration && (
              <span className="inline-flex items-center gap-1.5">
                <Clock aria-hidden="true" size={16} strokeWidth={1.75} />
                {programme.duration}
              </span>
            )}
            {programme.pattern && (
              <span className="inline-flex items-center gap-1.5">
                <BookOpen aria-hidden="true" size={16} strokeWidth={1.75} />
                {programme.pattern}
              </span>
            )}
          </p>
        )}
        {programme.subjects.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Subjects">
            {programme.subjects.map((s) => (
              <li key={s}>
                <Badge>{s}</Badge>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto pt-6">
          <span className="flex items-center gap-2 border-t border-ink-200 pt-6 text-sm font-semibold text-primary-800">
            View programme
            <ArrowRight aria-hidden="true" size={16} strokeWidth={1.75} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
