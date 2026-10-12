import Image from 'next/image';
import { GoogleIcon } from '@/components/icons/social';
import StarRating from '@/components/ui/StarRating';
import { formatDate } from '@/lib/format';
import type { Testimonial } from '@/lib/wp/types';

export default function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const { rating, source, review_url: reviewUrl, date, programme_batch: batch } = testimonial;
  const meta = batch || (date ? formatDate(date) : '');

  return (
    <figure className="flex h-full flex-col rounded-xl border border-ink-200 bg-white p-6 shadow-sm md:p-8">
      {rating !== null && (
        <p className="mb-4 flex items-center gap-2">
          <StarRating value={rating} size={16} />
          <span className="sr-only">{`Rated ${rating} out of 5`}</span>
        </p>
      )}
      <blockquote className="leading-7 text-ink-700">“{testimonial.quote}”</blockquote>
      <figcaption className="mt-auto flex items-center gap-3 pt-6">
        {testimonial.photo ? (
          <Image src={testimonial.photo.url} alt="" width={44} height={44} className="size-11 rounded-full object-cover" />
        ) : (
          <span aria-hidden="true" className="grid size-11 place-items-center rounded-full bg-primary-100 font-semibold text-primary-800">
            {testimonial.name.charAt(0)}
          </span>
        )}
        <span className="min-w-0">
          <span className="block font-semibold text-ink-900">{testimonial.name}</span>
          {meta && <span className="block text-sm text-ink-500">{meta}</span>}
        </span>
        {source === 'google' && (
          <span className="ml-auto shrink-0">
            {reviewUrl ? (
              <a
                href={reviewUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="grid size-9 place-items-center rounded-full border border-ink-200 transition-colors duration-200 hover:bg-primary-50"
              >
                <GoogleIcon size={18} />
                <span className="sr-only">{`Read ${testimonial.name}'s review on Google (opens in new tab)`}</span>
              </a>
            ) : (
              <span className="grid size-9 place-items-center rounded-full border border-ink-200">
                <GoogleIcon size={18} />
                <span className="sr-only">Review posted on Google</span>
              </span>
            )}
          </span>
        )}
      </figcaption>
    </figure>
  );
}
