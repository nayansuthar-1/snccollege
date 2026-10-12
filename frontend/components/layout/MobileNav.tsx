'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronDown, Menu, Phone, X } from 'lucide-react';
import { WhatsappIcon } from '@/components/icons/social';
import { buttonClasses } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { mainNav, navItemLinks } from '@/config/navigation';
import { logoSrc } from '@/config/site';
import type { Img } from '@/lib/wp/types';

type MobileNavProps = {
  logo?: Img | null;
  applyHref: string;
  phoneHref: string;
  whatsappHref: string;
};

/** Right-side drawer for < xl (design system §5.7). */
export default function MobileNav({ logo, applyHref, phoneHref, whatsappHref }: MobileNavProps) {
  const emblem = logoSrc(logo);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== 'Tab' || !drawerRef.current) return;
    const focusable = drawerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  const rowClasses = 'flex h-14 w-full items-center justify-between border-b border-ink-200 px-5 text-[15px] font-semibold text-ink-900';

  // The header uses backdrop-blur, which makes it the containing block for `position: fixed`
  // descendants — the drawer would be clipped to the header's height. Portal it to <body>.
  const drawer = (
    <div className="fixed inset-0 z-[60] xl:hidden" onKeyDown={onKeyDown}>
      <div aria-hidden="true" className="absolute inset-0 bg-primary-950/50" onClick={close} />
      <div
        ref={drawerRef}
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-xl"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-ink-200 px-5">
          <span className="flex items-center gap-3">
            <Image src={emblem.src} alt="" width={emblem.width} height={emblem.height} sizes="36px" className="size-9 object-contain" />
            <span className="font-serif text-lg font-bold text-primary-950">Menu</span>
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="grid size-11 place-items-center rounded-md text-ink-700 hover:bg-primary-50"
          >
            <X aria-hidden="true" size={22} strokeWidth={1.75} />
          </button>
        </div>

        <nav aria-label="Main" className="flex-1 overflow-y-auto">
          <ul>
            {mainNav.map((item) => {
              const links = navItemLinks(item);
              if (links.length === 0) {
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={pathname === item.href ? 'page' : undefined}
                      className={rowClasses}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              }
              const isExpanded = expanded === item.href;
              return (
                <li key={item.href}>
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() => setExpanded(isExpanded ? null : item.href)}
                    className={rowClasses}
                  >
                    {item.label}
                    <ChevronDown
                      aria-hidden="true"
                      size={18}
                      className={cn('text-ink-500 transition-transform duration-200', isExpanded && 'rotate-180')}
                    />
                  </button>
                  {isExpanded && (
                    <ul className="border-b border-ink-200 bg-ink-50 py-2">
                      {links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            onClick={() => setOpen(false)}
                            aria-current={pathname === link.href ? 'page' : undefined}
                            className={cn(
                              'block py-3 pl-8 pr-5 text-sm',
                              pathname === link.href ? 'font-semibold text-primary-800' : 'text-ink-700',
                            )}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="shrink-0 space-y-3 border-t border-ink-200 p-5">
          <Link href={applyHref} onClick={() => setOpen(false)} className={buttonClasses('accent', 'md', 'w-full')}>
            Apply Now
          </Link>
          {(phoneHref || whatsappHref) && (
            <div className="grid grid-cols-2 gap-3">
              {phoneHref && (
                <a href={phoneHref} className={buttonClasses('outline', 'md', phoneHref && whatsappHref ? '' : 'col-span-2')}>
                  <Phone aria-hidden="true" size={18} strokeWidth={1.75} />
                  Call
                </a>
              )}
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses('outline', 'md', phoneHref ? '' : 'col-span-2')}
                >
                  <WhatsappIcon size={18} />
                  WhatsApp
                  <span className="sr-only">(opens in new tab)</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="grid size-11 place-items-center rounded-md border border-ink-200 text-ink-900 transition-colors duration-200 hover:bg-primary-50 xl:hidden"
      >
        <Menu aria-hidden="true" size={22} strokeWidth={1.75} />
      </button>

      {open && createPortal(drawer, document.body)}
    </>
  );
}
