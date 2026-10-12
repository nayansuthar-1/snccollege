import Image from 'next/image';
import { Quote } from 'lucide-react';
import Button from '@/components/ui/Button';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import type { Leader } from '@/lib/wp/types';

type MessageCardProps = { leader: Leader; href?: string };

export default function MessageCard({ leader, href = '/about/messages' }: MessageCardProps) {
  return (
    <article className="grid h-full gap-6 rounded-xl border border-ink-200 bg-white p-6 shadow-sm sm:grid-cols-[160px_1fr] md:p-8 lg:grid-cols-[180px_1fr]">
      <div className="relative aspect-[4/5] w-40 overflow-hidden rounded-lg sm:w-full">
        {leader.photo ? (
          <Image src={leader.photo.url} alt={leader.photo.alt || leader.name} fill sizes="180px" className="object-cover" />
        ) : (
          <ImagePlaceholder className="h-full" label={`Photo of ${leader.name} coming soon`} />
        )}
      </div>
      <div className="flex flex-col">
        <Quote aria-hidden="true" size={28} strokeWidth={1.75} className="text-gold-500" />
        <blockquote className="mt-3 font-serif text-lg leading-8 text-ink-900">{leader.excerpt}</blockquote>
        <p className="mt-5 font-semibold text-ink-900">{leader.name}</p>
        {leader.designation && <p className="text-sm text-ink-500">{leader.designation}</p>}
        <div className="mt-auto pt-5">
          <Button href={href} variant="link">
            Read full message
          </Button>
        </div>
      </div>
    </article>
  );
}
