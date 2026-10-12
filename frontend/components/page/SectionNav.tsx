import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { NavLink } from '@/config/navigation';

type SectionNavProps = {
  title: string;
  links: NavLink[];
  currentPath: string;
};

function NavList({ links, currentPath }: { links: NavLink[]; currentPath: string }) {
  return (
    <ul>
      {links.map((link) => {
        const active = link.href === currentPath;
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'block border-l-4 px-5 py-3 text-sm transition-colors duration-200',
                active
                  ? 'border-gold-500 bg-primary-50 font-semibold text-primary-800'
                  : 'border-transparent text-ink-700 hover:bg-primary-50 hover:text-primary-800',
              )}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Desktop: sticky sidebar card. Below lg: collapsible "In this section" menu. */
export default function SectionNav({ title, links, currentPath }: SectionNavProps) {
  return (
    <>
      <details className="group mb-8 rounded-xl border border-ink-200 bg-white lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold text-ink-900 [&::-webkit-details-marker]:hidden">
          <span>
            <span className="text-ink-500">In this section:</span> {title}
          </span>
          <ChevronDown aria-hidden="true" size={18} className="text-ink-500 transition-transform duration-200 group-open:rotate-180" />
        </summary>
        <nav aria-label={`${title} pages`} className="border-t border-ink-200 py-2">
          <NavList links={links} currentPath={currentPath} />
        </nav>
      </details>

      <nav aria-label={`${title} pages`} className="hidden overflow-hidden rounded-xl border border-ink-200 bg-white lg:block">
        <p className="bg-primary-950 px-5 py-4 text-sm font-bold uppercase tracking-wide text-white">{title}</p>
        <div className="py-2">
          <NavList links={links} currentPath={currentPath} />
        </div>
      </nav>
    </>
  );
}
