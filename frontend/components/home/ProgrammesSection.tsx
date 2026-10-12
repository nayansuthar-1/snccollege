import ProgrammeCard from '@/components/cards/ProgrammeCard';
import Section, { type SectionTone } from '@/components/ui/Section';
import SectionHeader from '@/components/ui/SectionHeader';
import { cn } from '@/lib/cn';
import type { ProgrammeSummary } from '@/lib/wp/types';

export default function ProgrammesSection({ programmes, tone }: { programmes: ProgrammeSummary[]; tone: SectionTone }) {
  const few = programmes.length <= 2;
  return (
    <Section tone={tone} labelledBy="programmes-heading">
      <SectionHeader
        id="programmes-heading"
        align="center"
        eyebrow="Academics"
        title="Programmes offered"
        description="Choose the programme that matches your interests and goals."
      />
      <div className={cn('grid grid-cols-1 gap-6 lg:gap-8', few ? 'mx-auto max-w-5xl md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3')}>
        {programmes.map((p) => (
          <ProgrammeCard key={p.id} programme={p} />
        ))}
      </div>
    </Section>
  );
}
