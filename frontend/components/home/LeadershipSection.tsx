import MessageCard from '@/components/cards/MessageCard';
import Section, { type SectionTone } from '@/components/ui/Section';
import SectionHeader from '@/components/ui/SectionHeader';
import type { Leader } from '@/lib/wp/types';

export default function LeadershipSection({ leaders, tone }: { leaders: Leader[]; tone: SectionTone }) {
  return (
    <Section tone={tone} labelledBy="leadership-heading">
      <SectionHeader id="leadership-heading" eyebrow="Leadership" title="Messages from our leadership" action={{ label: 'Read all messages', href: '/about/messages' }} />
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        {leaders.slice(0, 2).map((l) => (
          <MessageCard key={l.id} leader={l} />
        ))}
      </div>
    </Section>
  );
}
