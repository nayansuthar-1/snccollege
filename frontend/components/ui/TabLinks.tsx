import Link from 'next/link';
import { cn } from '@/lib/cn';

type TabLinksProps = {
  items: { label: string; href: string; active: boolean }[];
  label: string;
  className?: string;
};

/** Tab-styled navigation whose state lives in the URL (e.g. ?type=examination). */
export default function TabLinks({ items, label, className }: TabLinksProps) {
  return (
    <nav aria-label={label} className={cn('-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0', className)}>
      <ul className="flex border-b border-ink-200">
        {items.map((item) => (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href}
              scroll={false}
              aria-current={item.active ? 'page' : undefined}
              className={cn(
                '-mb-px block whitespace-nowrap border-b-2 px-4 pb-3 text-sm font-semibold transition-colors duration-200',
                item.active ? 'border-primary-800 text-primary-800' : 'border-transparent text-ink-500 hover:text-ink-900',
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
