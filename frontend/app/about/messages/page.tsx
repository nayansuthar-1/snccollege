import type { Metadata } from 'next';
import Image from 'next/image';
import { MessageSquareQuote } from 'lucide-react';
import Prose from '@/components/page/Prose';
import SectionPageLayout from '@/components/page/SectionPageLayout';
import EmptyState from '@/components/ui/EmptyState';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import { getLeaders } from '@/lib/wp/api';
import { renderWpHtml } from '@/lib/wp/html';
import { cn } from '@/lib/cn';

const PATH = '/about/messages';

export const metadata: Metadata = {
  title: 'Leadership Messages',
  description: 'Messages from the leadership of Shiv Narayan Choubisa College, Simalwara.',
  alternates: { canonical: PATH },
};

export default async function MessagesPage() {
  const leaders = await getLeaders();

  return (
    <SectionPageLayout
      title="Leadership Messages"
      subtitle="Messages from the leadership of Shiv Narayan Choubisa College."
      path={PATH}
    >
      {leaders.length === 0 ? (
        <EmptyState
          icon={MessageSquareQuote}
          title="No messages published yet"
          description="Messages from the college leadership will appear here once they are published."
        />
      ) : (
        <div>
          {leaders.map((leader, index) => (
            <article key={leader.id} className={cn(index > 0 && 'mt-12 border-t border-ink-200 pt-12')}>
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="relative aspect-[4/5] w-36 shrink-0 overflow-hidden rounded-lg sm:w-40">
                  {leader.photo ? (
                    <Image
                      src={leader.photo.url}
                      alt={leader.photo.alt || leader.name}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  ) : (
                    <ImagePlaceholder className="h-full" label={`Photo of ${leader.name} coming soon`} />
                  )}
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold leading-snug text-ink-900">{leader.name}</h2>
                  {leader.designation && <p className="mt-1 text-sm font-medium text-primary-800">{leader.designation}</p>}
                  {leader.excerpt && <p className="mt-4 max-w-prose font-serif text-lg leading-8 text-ink-900">{leader.excerpt}</p>}
                </div>
              </div>
              <Prose className="mt-8">{renderWpHtml(leader.content_html)}</Prose>
            </article>
          ))}
        </div>
      )}
    </SectionPageLayout>
  );
}
