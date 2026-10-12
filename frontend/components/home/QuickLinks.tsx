import Link from 'next/link';
import { ArrowRight, Bell, GraduationCap, HandCoins, ListChecks, type LucideIcon } from 'lucide-react';
import Container from '@/components/ui/Container';

type Item = { label: string; sub: string; href: string; icon: LucideIcon };

/** Four quick-access tiles directly under the hero (design system §5.9). */
export default function QuickLinks({ sessionLabel }: { sessionLabel: string }) {
  const items: Item[] = [
    { label: sessionLabel ? `Admissions ${sessionLabel}` : 'Admissions', sub: 'Process & eligibility', href: '/admissions', icon: GraduationCap },
    { label: 'Merit Lists', sub: 'Merit, waiting & admitted', href: '/admissions/merit-lists', icon: ListChecks },
    { label: 'Notices', sub: 'Latest announcements', href: '/students/notices', icon: Bell },
    { label: 'Scholarships', sub: 'Government schemes', href: '/admissions/scholarships', icon: HandCoins },
  ];

  return (
    <nav aria-label="Quick access" className="bg-primary-900">
      <Container className="grid grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-white/10">
        {items.map(({ label, sub, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 px-2 py-6 text-white transition-colors duration-200 hover:bg-primary-800 sm:px-4 lg:px-8"
          >
            <Icon aria-hidden="true" size={24} strokeWidth={1.75} className="shrink-0 text-gold-400" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold sm:text-base">{label}</span>
              <span className="hidden text-xs text-white/60 sm:block">{sub}</span>
            </span>
            <ArrowRight
              aria-hidden="true"
              size={18}
              strokeWidth={1.75}
              className="hidden shrink-0 text-white/60 transition-transform duration-200 group-hover:translate-x-0.5 sm:block"
            />
          </Link>
        ))}
      </Container>
    </nav>
  );
}
