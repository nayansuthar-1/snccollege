import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import IconTile from '@/components/ui/IconTile';

type InfoCardProps = {
  title: string;
  icon?: LucideIcon;
  children?: ReactNode;
  /** Makes the whole card a link. */
  href?: string;
};

export default function InfoCard({ title, icon, children, href }: InfoCardProps) {
  if (href) {
    return (
      <article className="group relative flex h-full flex-col rounded-xl border border-ink-200 bg-white p-6 shadow-sm transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md md:p-8">
        {icon && <IconTile icon={icon} className="mb-5" />}
        <h3 className="text-lg font-bold leading-snug text-ink-900">
          <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
            {title}
          </Link>
        </h3>
        {children && <div className="mt-2 text-sm leading-6 text-ink-700">{children}</div>}
        <span className="mt-auto pt-5">
          <ArrowRight
            aria-hidden="true"
            size={18}
            strokeWidth={1.75}
            className="text-primary-800 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </span>
      </article>
    );
  }

  return (
    <div className="h-full rounded-xl border border-ink-200 bg-white p-6 shadow-sm md:p-8">
      {icon && <IconTile icon={icon} className="mb-5" />}
      <h3 className="text-lg font-bold leading-snug text-ink-900">{title}</h3>
      {children && <div className="mt-2 text-sm leading-6 text-ink-700">{children}</div>}
    </div>
  );
}
