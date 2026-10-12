import type { LucideIcon } from 'lucide-react';
import IconTile from '@/components/ui/IconTile';

type FeatureCardProps = { icon: LucideIcon; title: string; text: string };

export default function FeatureCard({ icon, title, text }: FeatureCardProps) {
  return (
    <div className="h-full rounded-xl border border-ink-200 bg-white p-6 shadow-sm md:p-8">
      <IconTile icon={icon} />
      <h3 className="mt-5 text-lg font-bold leading-snug text-ink-900 md:text-xl">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink-700">{text}</p>
    </div>
  );
}
