'use client';

import { useActionState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { buttonClasses } from '@/components/ui/Button';
import { telHref } from '@/lib/contact';
import { cn } from '@/lib/cn';
import { sendEnquiry } from './actions';
import { enquiryInitialState } from './enquiry-state';

type EnquiryFormProps = {
  /** Programme names from WordPress — never a hardcoded list. */
  programmes: string[];
  /** Shown if the message cannot be delivered, so the visitor still has a way to reach the college. */
  phone: string;
  heading?: string;
  description?: string;
};

const labelClass = 'mb-2 block text-sm font-semibold text-ink-900';
const fieldClass =
  'h-11 w-full rounded-md border border-ink-300 bg-white px-4 text-sm text-ink-900 placeholder:text-ink-500 focus:border-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-800/20';

/** Admission enquiry form (design system §5.20). Validated in the browser and again in WordPress. */
export default function EnquiryForm({ programmes, phone, heading = 'Send an enquiry', description }: EnquiryFormProps) {
  const [state, formAction, isPending] = useActionState(sendEnquiry, enquiryInitialState);

  if (state.status === 'success') {
    return (
      <div role="status" className="rounded-xl border border-ink-200 bg-white p-6 shadow-sm md:p-8">
        <CheckCircle2 aria-hidden="true" size={28} strokeWidth={1.75} className="text-success-700" />
        <h2 className="mt-4 font-serif text-xl font-bold leading-snug text-ink-900">Thank you — your enquiry has reached the college.</h2>
        <p className="mt-2 text-sm leading-6 text-ink-700">
          The admission office will call you back. If your query is urgent, please call
          {phone ? (
            <>
              {' '}
              <a href={telHref(phone)} className="font-semibold text-primary-800 underline underline-offset-4">
                {phone}
              </a>
              .
            </>
          ) : (
            ' the college office.'
          )}
        </p>
      </div>
    );
  }

  const error = (field: string) => state.errors[field];
  const describedBy = (field: string) => (error(field) ? `${field}-error` : undefined);

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="font-serif text-xl font-bold leading-snug text-ink-900">{heading}</h2>
      {description && <p className="mt-2 text-sm leading-6 text-ink-700">{description}</p>}

      {(state.status === 'failed' || state.status === 'throttled') && (
        <p role="alert" className="mt-5 rounded-md border border-ink-200 bg-ink-50 px-4 py-3 text-sm leading-6 text-danger-700">
          {state.status === 'throttled'
            ? 'Too many enquiries have been sent from this connection. Please try again in a few minutes'
            : 'Your enquiry could not be sent'}
          {phone ? (
            <>
              , or call <a href={telHref(phone)} className="font-semibold underline underline-offset-4">{phone}</a>.
            </>
          ) : (
            '.'
          )}
        </p>
      )}

      <form action={formAction} className="mt-6 grid gap-5 md:grid-cols-2" noValidate={false}>
        <div>
          <label htmlFor="name" className={labelClass}>
            Full name <span aria-hidden="true" className="text-danger-700">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            aria-invalid={error('name') ? true : undefined}
            aria-describedby={describedBy('name')}
            className={fieldClass}
          />
          {error('name') && (
            <p id="name-error" className="mt-1.5 text-sm text-danger-700">
              {error('name')}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            Mobile number <span aria-hidden="true" className="text-danger-700">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            inputMode="numeric"
            pattern="[6-9][0-9]{9}"
            placeholder="10-digit mobile number"
            autoComplete="tel-national"
            title="Enter a 10-digit Indian mobile number"
            aria-invalid={error('phone') ? true : undefined}
            aria-describedby={describedBy('phone')}
            className={fieldClass}
          />
          {error('phone') && (
            <p id="phone-error" className="mt-1.5 text-sm text-danger-700">
              {error('phone')}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={error('email') ? true : undefined}
            aria-describedby={describedBy('email')}
            className={fieldClass}
          />
          {error('email') && (
            <p id="email-error" className="mt-1.5 text-sm text-danger-700">
              {error('email')}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="programme" className={labelClass}>
            Programme of interest
          </label>
          <select id="programme" name="programme" defaultValue="" className={fieldClass}>
            <option value="">Select a programme</option>
            {programmes.map((programme) => (
              <option key={programme} value={programme}>
                {programme}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="message" className={labelClass}>
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            maxLength={1000}
            aria-invalid={error('message') ? true : undefined}
            aria-describedby={describedBy('message')}
            className={cn(fieldClass, 'min-h-32 py-3')}
          />
          {error('message') && (
            <p id="message-error" className="mt-1.5 text-sm text-danger-700">
              {error('message')}
            </p>
          )}
        </div>

        {/* Honeypot: hidden from people, tempting to bots. */}
        <div aria-hidden="true" className="hidden">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="md:col-span-2">
          <button type="submit" disabled={isPending} className={buttonClasses('primary', 'lg')}>
            {isPending && <Loader2 aria-hidden="true" size={18} strokeWidth={2} className="motion-safe:animate-spin" />}
            {isPending ? 'Sending…' : 'Send enquiry'}
          </button>
        </div>
      </form>
    </div>
  );
}
