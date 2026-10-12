import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import { cn } from '@/lib/cn';
import type { NavItem } from '@/config/navigation';

type MegaMenuProps = {
  item: NavItem;
  id: string;
  open: boolean;
  alignRight: boolean;
  currentPath: string;
  onNavigate: () => void;
};

/** Dropdown panel: links left, image panel right (design system §5.6). */
export default function MegaMenu({ item, id, open, alignRight, currentPath, onNavigate }: MegaMenuProps) {
  const groups = item.groups ?? [];
  return (
    <div
      id={id}
      hidden={!open}
      className={cn(
        'absolute top-full z-50 overflow-hidden rounded-b-xl border-t-4 border-gold-500 bg-white shadow-xl',
        item.wide ? 'w-[720px]' : 'w-[560px]',
        alignRight ? 'right-0' : 'left-0',
      )}
    >
      <div className="grid grid-cols-[1fr_200px]">
        <div className={cn('py-4', item.wide && 'grid grid-cols-2')}>
          {groups.map((group, gi) => (
            <div key={group.heading ?? gi}>
              {group.heading && (
                <p className="px-6 pb-1 pt-3 text-xs font-bold uppercase tracking-[0.14em] text-ink-500">{group.heading}</p>
              )}
              <ul>
                {group.links.map((link) => {
                  const active = link.href === currentPath;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={onNavigate}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'flex items-center border-l-2 px-6 py-2.5 text-sm transition-colors duration-200',
                          active
                            ? 'border-primary-800 bg-primary-50 font-semibold text-primary-800'
                            : 'border-transparent text-ink-700 hover:border-primary-800 hover:bg-primary-50 hover:text-primary-800',
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        {item.panel && (
          <div className="relative min-h-60">
            <ImagePlaceholder tone="dark" className="absolute inset-0 h-full" label="" />
            <div className="absolute inset-0 bg-primary-950/70" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-400">{item.panel.tagline}</p>
              <p className="mt-1 font-serif text-lg leading-snug text-white">{item.panel.title}</p>
              {item.panel.cta && (
                <Link
                  href={item.panel.cta.href}
                  onClick={onNavigate}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-400 hover:text-gold-500"
                >
                  {item.panel.cta.label}
                  <ArrowRight aria-hidden="true" size={14} />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
