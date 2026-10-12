import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

type IconTileProps = { icon: LucideIcon; className?: string };

export default function IconTile({ icon: Icon, className }: IconTileProps) {
  return (
    <span className={cn('grid size-12 shrink-0 place-items-center rounded-md bg-primary-100 text-primary-800', className)}>
      <Icon aria-hidden="true" size={24} strokeWidth={1.75} />
    </span>
  );
}
