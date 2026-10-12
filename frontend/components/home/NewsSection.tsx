import NewsCard from '@/components/cards/NewsCard';
import Section, { type SectionTone } from '@/components/ui/Section';
import SectionHeader from '@/components/ui/SectionHeader';
import type { NewsSummary } from '@/lib/wp/types';

export default function NewsSection({ news, tone }: { news: NewsSummary[]; tone: SectionTone }) {
  return (
    <Section tone={tone} labelledBy="news-heading">
      <SectionHeader id="news-heading" eyebrow="Campus updates" title="News & events" action={{ label: 'View all news', href: '/news' }} />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {news.slice(0, 3).map((n) => (
          <NewsCard key={n.id} item={n} />
        ))}
      </div>
    </Section>
  );
}
