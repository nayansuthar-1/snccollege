import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';

/**
 * On-demand revalidation called by the WordPress plugin (Plan B6).
 * POST, header x-snc-secret, body { "tags": string[] } (max 20, each ≤ 100 chars).
 */

function secretMatches(given: string | null): boolean {
  const expected = process.env.REVALIDATE_SECRET ?? '';
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!secretMatches(request.headers.get('x-snc-secret'))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const tags = (body as { tags?: unknown })?.tags;
  if (!Array.isArray(tags) || tags.length === 0 || tags.length > 20 || !tags.every((t) => typeof t === 'string' && t.length > 0 && t.length <= 100)) {
    return Response.json({ error: 'Body must be { tags: string[] } with 1–20 tags of ≤100 chars' }, { status: 400 });
  }

  for (const tag of tags as string[]) {
    revalidateTag(tag, 'max');
  }
  return Response.json({ revalidated: tags });
}
