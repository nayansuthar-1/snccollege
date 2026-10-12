import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

type ImagePlaceholderProps = {
  /** Tailwind aspect class, e.g. "aspect-[16/10]". Omit when the parent sets the size. */
  aspect?: string;
  label?: string;
  className?: string;
  tone?: 'light' | 'dark';
};

/** Neutral stand-in until the college supplies real photographs. Never replace with stock photos. */
export default function ImagePlaceholder({ aspect, label = 'Photo coming soon', className, tone = 'light' }: ImagePlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        'grid w-full place-items-center',
        tone === 'dark' ? 'bg-primary-900 text-white/30' : 'bg-ink-100 text-ink-300',
        aspect,
        className,
      )}
    >
      <ImageIcon aria-hidden="true" size={32} strokeWidth={1.5} />
    </div>
  );
}
