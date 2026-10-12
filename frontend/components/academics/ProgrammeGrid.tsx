import ProgrammeCard from '@/components/cards/ProgrammeCard';
import { cn } from '@/lib/cn';
import type { ProgrammeSummary } from '@/lib/wp/types';

/** Programme card grid. Two or fewer cards use a narrower two-column grid so they do not stretch. */
export default function ProgrammeGrid({ programmes }: { programmes: ProgrammeSummary[] }) {
  const few = programmes.length <= 2;
  return (
    <div className={cn('grid grid-cols-1 gap-6 lg:gap-8', few ? 'max-w-5xl md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3')}>
      {programmes.map((programme) => (
        <ProgrammeCard key={programme.id} programme={programme} />
      ))}
    </div>
  );
}
