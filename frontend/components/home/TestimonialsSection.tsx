import { ArrowUpRight } from 'lucide-react';
import TestimonialCard from '@/components/cards/TestimonialCard';
import { GoogleIcon } from '@/components/icons/social';
import Section, { type SectionTone } from '@/components/ui/Section';
import SectionHeader from '@/components/ui/SectionHeader';
import StarRating from '@/components/ui/StarRating';
import type { Settings, Testimonial } from '@/lib/wp/types';

type TestimonialsSectionProps = {
  testimonials: Testimonial[];
  settings: Settings;
  tone: SectionTone;
};

/**
 * "What People Say About Us" — the Google rating panel beside the reviews themselves
 * (design system §5.13, §6.1). Every figure here comes from WordPress: the score and
 * review count from SNC Settings → Reviews, the reviews from the Reviews post type.
 * The homepage omits the whole section when there is neither a score nor a review.
 */
export default function TestimonialsSection({ testimonials, settings, tone }: TestimonialsSectionProps) {
  const rating = Number.parseFloat(settings.google_rating);
  const hasRating = Number.isFinite(rating) && rating > 0;
  const reviews = testimonials.slice(0, 4);

  return (
    <Section tone={tone} labelledBy="reviews-heading">
      <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
        {hasRating && (
          <aside className="lg:col-span-4">
            <div className="rounded-xl bg-primary-950 p-6 text-white md:p-8">
              <p className="flex items-baseline gap-3">
                <span className="font-serif text-5xl font-bold leading-none text-white">{settings.google_rating}</span>
                <span className="text-sm text-white/60">out of 5</span>
              </p>
              <p className="mt-4">
                <StarRating value={rating} size={20} className="text-gold-400" trackClassName="text-white/20" />
              </p>
              <div className="mt-6 flex items-center gap-3 rounded-md bg-white p-4">
                <GoogleIcon size={28} />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink-900">Google rating</span>
                  {settings.google_review_count && (
                    <span className="block text-sm text-ink-500">{`${settings.google_review_count} reviews`}</span>
                  )}
                </span>
              </div>
              {settings.google_reviews_url && (
                <a
                  href={settings.google_reviews_url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-400 transition-colors duration-200 hover:text-gold-500"
                >
                  Read all reviews on Google
                  <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.75} />
                  <span className="sr-only">(opens in new tab)</span>
                </a>
              )}
            </div>
          </aside>
        )}

        <div className={hasRating ? 'lg:col-span-8' : 'lg:col-span-12'}>
          <SectionHeader
            id="reviews-heading"
            eyebrow="Reviews"
            title="What People Say About Us"
            description={
              hasRating
                ? 'Reviews left by students, parents and visitors on the college’s Google listing.'
                : undefined
            }
          />
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {reviews.map((review) => (
                <TestimonialCard key={review.id} testimonial={review} />
              ))}
            </div>
          ) : (
            <p className="text-base leading-7 text-ink-700">
              Individual reviews are published here as they are collected from the college’s Google listing.
            </p>
          )}
        </div>
      </div>
    </Section>
  );
}
