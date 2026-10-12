import Link from 'next/link';
import { GraduationCap, Phone } from 'lucide-react';
import { WhatsappIcon } from '@/components/icons/social';
import { cn } from '@/lib/cn';

type MobileActionBarProps = { phoneHref: string; whatsappHref: string; applyHref: string };

const item = 'flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-ink-900 transition-colors duration-200 hover:bg-primary-50';

/** Bottom action bar below lg (design system §5.22). */
export default function MobileActionBar({ phoneHref, whatsappHref, applyHref }: MobileActionBarProps) {
  const count = 1 + (phoneHref ? 1 : 0) + (whatsappHref ? 1 : 0);
  return (
    <nav
      aria-label="Quick actions"
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 grid divide-x divide-ink-200 border-t border-ink-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden',
        count === 3 ? 'grid-cols-3' : count === 2 ? 'grid-cols-2' : 'grid-cols-1',
      )}
    >
      {phoneHref && (
        <a href={phoneHref} className={item}>
          <Phone aria-hidden="true" size={20} strokeWidth={1.75} className="text-primary-800" />
          Call
        </a>
      )}
      {whatsappHref && (
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={item}>
          <WhatsappIcon size={20} className="text-whatsapp" />
          WhatsApp
          <span className="sr-only">(opens in new tab)</span>
        </a>
      )}
      <Link href={applyHref} className={cn(item, 'text-primary-800')}>
        <GraduationCap aria-hidden="true" size={20} strokeWidth={1.75} />
        Apply
      </Link>
    </nav>
  );
}
