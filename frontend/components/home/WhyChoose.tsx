import { Briefcase, FlaskConical, GraduationCap, HandCoins, Library, ShieldCheck, Users, Wifi, type LucideIcon } from 'lucide-react';
import FeatureCard from '@/components/cards/FeatureCard';
import Section, { type SectionTone } from '@/components/ui/Section';
import SectionHeader from '@/components/ui/SectionHeader';
import type { Settings, WhyIconKey } from '@/lib/wp/types';

/** Whitelist of icons selectable in WordPress (SNC Settings → Homepage). */
const icons: Record<WhyIconKey, LucideIcon> = {
  'graduation-cap': GraduationCap,
  'flask-conical': FlaskConical,
  library: Library,
  wifi: Wifi,
  'hand-coins': HandCoins,
  briefcase: Briefcase,
  users: Users,
  'shield-check': ShieldCheck,
};

export default function WhyChoose({ items, tone }: { items: Settings['why_items']; tone: SectionTone }) {
  return (
    <Section tone={tone} labelledBy="why-heading">
      <SectionHeader id="why-heading" align="center" eyebrow="Why SNC" title="Why choose SNC College" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {items.map((item) => (
          <FeatureCard key={item.title} icon={icons[item.icon] ?? GraduationCap} title={item.title} text={item.text} />
        ))}
      </div>
    </Section>
  );
}
