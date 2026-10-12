import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
import Container from '@/components/ui/Container';
import { utilityLinks } from '@/config/navigation';
import { telHref } from '@/lib/contact';
import type { Settings } from '@/lib/wp/types';
import SocialLinks from './SocialLinks';

/** Utility bar, lg+ only (design system §5.4). */
export default function TopBar({ settings }: { settings: Settings }) {
  const phone = settings.phone_admission || settings.phone_office;
  return (
    <div className="hidden bg-primary-950 text-xs text-white/75 lg:block">
      <Container className="flex h-10 items-center justify-between gap-6">
        <nav aria-label="Quick links">
          <ul className="flex items-center gap-5">
            {utilityLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors duration-200 hover:text-gold-400">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-5">
          {phone && (
            <a href={telHref(phone)} className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-gold-400">
              <Phone aria-hidden="true" size={14} strokeWidth={1.75} />
              {phone}
            </a>
          )}
          {settings.email && (
            <a href={`mailto:${settings.email}`} className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-gold-400">
              <Mail aria-hidden="true" size={14} strokeWidth={1.75} />
              {settings.email}
            </a>
          )}
          {(settings.facebook || settings.instagram || settings.youtube) && (
            <>
              <span aria-hidden="true" className="h-4 w-px bg-white/20" />
              <SocialLinks settings={settings} variant="topbar" />
            </>
          )}
        </div>
      </Container>
    </div>
  );
}
