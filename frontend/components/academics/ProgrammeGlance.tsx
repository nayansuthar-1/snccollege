import { Download } from 'lucide-react';
import Button from '@/components/ui/Button';
import { fileTypeLabel, formatFileSize } from '@/lib/format';
import type { Programme, Settings } from '@/lib/wp/types';

type ProgrammeGlanceProps = { programme: Programme; settings: Settings };

/** "At a glance" card beside the programme overview (design system §6.4). Rows with no data are hidden. */
export default function ProgrammeGlance({ programme, settings }: ProgrammeGlanceProps) {
  const rows = [
    { label: 'Level', value: programme.level?.name ?? '' },
    { label: 'Duration', value: programme.duration },
    { label: 'Pattern', value: programme.pattern },
    { label: 'Affiliating university', value: settings.affiliation },
    { label: 'Eligibility', value: programme.eligibility },
    { label: 'Intake', value: programme.intake },
    { label: 'Fees', value: programme.fee_note },
  ].filter((row) => row.value !== '');

  const syllabus = programme.syllabus;
  const fileMeta = syllabus ? [fileTypeLabel(syllabus.mime), formatFileSize(syllabus.size_bytes)].filter(Boolean) : [];

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="font-serif text-xl font-bold leading-snug text-ink-900">At a glance</h2>

      {rows.length > 0 && (
        <dl className="mt-5">
          {rows.map((row) => (
            <div key={row.label} className="border-t border-ink-200 py-3">
              <dt className="text-xs font-bold uppercase tracking-wide text-ink-500">{row.label}</dt>
              <dd className="mt-1 text-sm leading-6 text-ink-900">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-6 flex flex-col gap-3">
        <Button href={settings.apply_url || '/admissions/apply'}>Apply Now</Button>
        {syllabus && (
          <>
            <Button
              href={syllabus.url}
              variant="outline"
              ariaLabel={`Download the ${programme.title} syllabus (${fileMeta.join(', ')}), opens in new tab`}
            >
              <Download aria-hidden="true" size={16} strokeWidth={1.75} />
              Download syllabus
            </Button>
            {fileMeta.length > 0 && <p className="text-center text-xs text-ink-500">{fileMeta.join(' · ')}</p>}
          </>
        )}
      </div>
    </div>
  );
}
