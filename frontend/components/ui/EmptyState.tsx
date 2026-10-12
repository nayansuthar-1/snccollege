import { Inbox, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
};

export default function EmptyState({ title, description, icon: Icon = Inbox, className }: EmptyStateProps) {
  return (
    <div className={cn('rounded-xl border border-dashed border-ink-300 bg-ink-50 px-6 py-14 text-center', className)}>
      <Icon aria-hidden="true" size={28} strokeWidth={1.75} className="mx-auto text-ink-500" />
      <p className="mt-4 font-semibold text-ink-900">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-ink-500">{description}</p>}
    </div>
  );
}
