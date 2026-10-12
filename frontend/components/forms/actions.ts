'use server';

import { headers } from 'next/headers';
import { submitEnquiry } from '@/lib/wp/api';
import type { EnquiryState } from './enquiry-state';

/** First address in X-Forwarded-For, so WordPress rate-limits per visitor and not per server. */
async function clientIp(): Promise<string | undefined> {
  const list = await headers();
  const forwarded = list.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || list.get('x-real-ip') || undefined;
}

export async function sendEnquiry(_previous: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const value = (name: string) => String(formData.get(name) ?? '').trim();

  const result = await submitEnquiry(
    {
      name: value('name'),
      phone: value('phone'),
      email: value('email'),
      programme: value('programme'),
      message: value('message'),
      website: value('website'),
    },
    await clientIp(),
  );

  if (result.ok) return { status: 'success', errors: {} };
  if (result.status === 429) return { status: 'throttled', errors: {} };
  if (result.errors && Object.keys(result.errors).length > 0) return { status: 'invalid', errors: result.errors };
  return { status: 'failed', errors: {} };
}
