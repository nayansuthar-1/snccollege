import Image from 'next/image';
import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import Container from '@/components/ui/Container';
import { footerImportantLinks, footerQuickLinks, type NavLink } from '@/config/navigation';
import { logoSrc } from '@/config/site';
import { telHref } from '@/lib/contact';
import type { Settings } from '@/lib/wp/types';
import SocialLinks from './SocialLinks';

function FooterHeading({ children }: { children: string }) {
  return <h2 className="mb-5 text-sm font-bold uppercase tracking-[0.14em] text-white">{children}</h2>;
}

function LinkList({ links }: { links: NavLink[] }) {
  return (
    <ul>
      {links.map((link) => (
        <li key={link.href}>
          {link.external ? (
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm leading-8 transition-colors duration-200 hover:text-gold-400"
            >
              {link.label}
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          ) : (
            <Link href={link.href} className="text-sm leading-8 transition-colors duration-200 hover:text-gold-400">
              {link.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Site footer (design system §5.21). */
export default function SiteFooter({ settings }: { settings: Settings }) {
  const phones = [settings.phone_admission, settings.phone_office].filter(Boolean);
  const emblem = logoSrc(settings.logo);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-4 border-gold-500 bg-primary-950 text-white/70">
      <Container className="grid gap-10 pb-12 pt-16 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="flex items-center gap-3">
            <Image
              src={emblem.src}
              alt=""
              width={emblem.width}
              height={emblem.height}
              sizes="56px"
              className="size-14 shrink-0 object-contain"
            />
            <div>
              <p className="font-serif text-lg font-bold leading-snug text-white">Shiv Narayan Choubisa College</p>
              {settings.hindi_name && (
                <p lang="hi" className="mt-0.5 text-sm text-white/60">
                  {settings.hindi_name}
                </p>
              )}
            </div>
          </div>
          {settings.short_about && <p className="mt-5 max-w-sm text-sm leading-6">{settings.short_about}</p>}
          <div className="mt-6">
            <SocialLinks settings={settings} variant="footer" />
          </div>
        </div>

        <div className="lg:col-span-2">
          <FooterHeading>Quick Links</FooterHeading>
          <LinkList links={footerQuickLinks} />
        </div>

        <div className="lg:col-span-3">
          <FooterHeading>Important Links</FooterHeading>
          <LinkList links={footerImportantLinks} />
        </div>

        <div className="lg:col-span-3">
          <FooterHeading>Contact</FooterHeading>
          <ul className="space-y-4 text-sm leading-6">
            {settings.address && (
              <li className="flex gap-3">
                <MapPin aria-hidden="true" size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-gold-400" />
                <span>
                  {settings.address}
                  {settings.map_link && (
                    <a
                      href={settings.map_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block font-semibold text-gold-400 hover:text-gold-500"
                    >
                      Get directions<span className="sr-only"> (opens in new tab)</span>
                    </a>
                  )}
                </span>
              </li>
            )}
            {phones.length > 0 && (
              <li className="flex gap-3">
                <Phone aria-hidden="true" size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-gold-400" />
                <span className="flex flex-col">
                  {phones.map((p) => (
                    <a key={p} href={telHref(p)} className="hover:text-gold-400">
                      {p}
                    </a>
                  ))}
                </span>
              </li>
            )}
            {settings.email && (
              <li className="flex gap-3">
                <Mail aria-hidden="true" size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-gold-400" />
                <a href={`mailto:${settings.email}`} className="break-all hover:text-gold-400">
                  {settings.email}
                </a>
              </li>
            )}
            {!settings.address && phones.length === 0 && !settings.email && (
              <li>
                <Link href="/contact" className="hover:text-gold-400">
                  Contact the college
                </Link>
              </li>
            )}
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-3 py-6 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <p>© {year} Shiv Narayan Choubisa College, Simalwara. All rights reserved.</p>
          <ul className="flex gap-5">
            <li>
              <Link href="/privacy-policy" className="hover:text-gold-400">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/sitemap.xml" className="hover:text-gold-400">
                Sitemap
              </Link>
            </li>
          </ul>
        </Container>
      </div>
    </footer>
  );
}
