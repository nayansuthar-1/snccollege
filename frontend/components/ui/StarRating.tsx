import { Star } from 'lucide-react';
import { cn } from '@/lib/cn';

type StarRatingProps = {
  /** 0–5. Fractions are drawn as a partly filled star. */
  value: number;
  size?: number;
  /** Stars are gold on dark panels and on white alike; the track is the muted variant. */
  className?: string;
  trackClassName?: string;
};

/**
 * Five stars filled to `value`, drawn as one clipped overlay so a 4.2 reads as 4.2.
 * Decorative: the surrounding component states the number in text.
 */
export default function StarRating({ value, size = 18, className, trackClassName }: StarRatingProps) {
  const clamped = Math.min(5, Math.max(0, value));
  const stars = [0, 1, 2, 3, 4];

  return (
    <span aria-hidden="true" className="relative inline-flex shrink-0 gap-0.5">
      {stars.map((i) => (
        <Star key={i} size={size} strokeWidth={1.75} className={cn('fill-current', trackClassName ?? 'text-ink-300')} />
      ))}
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${(clamped / 5) * 100}%` }}>
        <span className="flex gap-0.5">
          {stars.map((i) => (
            <Star key={i} size={size} strokeWidth={1.75} className={cn('shrink-0 fill-current', className ?? 'text-gold-500')} />
          ))}
        </span>
      </span>
    </span>
  );
}
