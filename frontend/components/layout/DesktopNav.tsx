'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { getSectionForPath, isActivePath, mainNav } from '@/config/navigation';
import MegaMenu from './MegaMenu';

const OPEN_DELAY = 120;
const CLOSE_DELAY = 200;

// Padding and tracking tighten between xl and 2xl so that eight uppercase items, the brand
// block and Apply Now fit on one 1280 px line without overlapping (design system §5.5).
const itemClasses =
  'relative flex h-full items-center gap-1 whitespace-nowrap px-1.5 2xl:px-3 text-[13px] font-bold uppercase tracking-normal 2xl:tracking-wide transition-colors duration-200 hover:text-primary-800';
const activeClasses =
  'text-primary-800 after:absolute after:inset-x-1.5 2xl:after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-gold-500';

/** Desktop navigation with hover + keyboard mega menus, xl+ only (design system §5.5–5.6). */
export default function DesktopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeSection = getSectionForPath(pathname);

  function schedule(next: number | null, delay: number) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(next), delay);
  }

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function onKeyDown(e: KeyboardEvent<HTMLLIElement>, index: number) {
    if (e.key === 'Escape' && open !== null) {
      e.preventDefault();
      setOpen(null);
      triggerRefs.current[index]?.focus();
    }
  }

  function onTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(index);
      requestAnimationFrame(() => {
        document.querySelector<HTMLAnchorElement>(`#mega-${index} a`)?.focus();
      });
    }
  }

  return (
    <nav ref={navRef} aria-label="Main" className="hidden h-full xl:flex">
      <ul className="flex h-full items-center gap-0 2xl:gap-1">
        {mainNav.map((item, index) => {
          const isActive = item.href === '/' ? pathname === '/' : activeSection?.href === item.href || isActivePath(pathname, item.href);

          if (!item.groups) {
            return (
              <li key={item.href} className="h-full">
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? 'page' : undefined}
                  className={cn(itemClasses, isActive ? activeClasses : 'text-ink-700')}
                >
                  {item.label}
                </Link>
              </li>
            );
          }

          const isOpen = open === index;
          return (
            <li
              key={item.href}
              className="relative h-full"
              onMouseEnter={() => schedule(index, open === null ? OPEN_DELAY : 0)}
              onMouseLeave={() => schedule(null, CLOSE_DELAY)}
              onKeyDown={(e) => onKeyDown(e, index)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen((o) => (o === index ? null : o));
              }}
            >
              <button
                ref={(el) => {
                  triggerRefs.current[index] = el;
                }}
                type="button"
                aria-expanded={isOpen}
                aria-controls={`mega-${index}`}
                onClick={() => setOpen(isOpen ? null : index)}
                onKeyDown={(e) => onTriggerKeyDown(e, index)}
                className={cn(itemClasses, isActive ? activeClasses : 'text-ink-700')}
              >
                {item.label}
                <ChevronDown
                  aria-hidden="true"
                  size={14}
                  strokeWidth={2}
                  className={cn('transition-transform duration-200', isOpen && 'rotate-180')}
                />
              </button>
              <MegaMenu
                item={item}
                id={`mega-${index}`}
                open={isOpen}
                alignRight={index >= mainNav.length - 3}
                currentPath={pathname}
                onNavigate={() => setOpen(null)}
              />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
