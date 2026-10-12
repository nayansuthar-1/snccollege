import 'server-only';
import { siteConfig } from '@/config/site';

/**
 * Low-level WordPress fetch for the snc/v1 namespace.
 * Uses ?rest_route= so it works with any WordPress permalink setting (Plan B5).
 */

const WORDPRESS_URL = (process.env.WORDPRESS_URL ?? '').replace(/\/+$/, '');

export class WpError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'WpError';
  }
}

type Params = Record<string, string | number | undefined | null>;

type WpFetchOptions = {
  params?: Params;
  /** Cache tags for on-demand revalidation (Plan B6). */
  tags: string[];
  revalidate?: number;
};

export function wpUrl(path: string, params: Params = {}): string {
  if (!WORDPRESS_URL) throw new WpError('WORDPRESS_URL is not set');
  const url = new URL(`${WORDPRESS_URL}/`);
  url.searchParams.set('rest_route', `/snc/v1${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  }
  return url.toString();
}

/** GET a snc/v1 endpoint. Returns null on 404, throws WpError on any other failure. */
export async function wpFetch<T>(path: string, { params, tags, revalidate = siteConfig.revalidateSeconds }: WpFetchOptions): Promise<T | null> {
  let res: Response;
  try {
    res = await fetch(wpUrl(path, params), {
      headers: { Accept: 'application/json' },
      next: { revalidate, tags },
    });
  } catch (error) {
    throw new WpError(`WordPress unreachable for ${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (res.status === 404) return null;
  if (!res.ok) throw new WpError(`WordPress responded ${res.status} for ${path}`, res.status);
  try {
    return (await res.json()) as T;
  } catch {
    throw new WpError(`WordPress returned invalid JSON for ${path}`, res.status);
  }
}

/** POST to a snc/v1 endpoint (never cached). Sends the shared secret so WordPress trusts the forwarded visitor IP. */
export async function wpPost<T>(path: string, body: unknown, clientIp?: string): Promise<{ status: number; data: T | null }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' };
  const secret = process.env.REVALIDATE_SECRET;
  if (secret && clientIp) {
    headers['x-snc-secret'] = secret;
    headers['x-snc-client-ip'] = clientIp;
  }
  const res = await fetch(wpUrl(path), { method: 'POST', headers, body: JSON.stringify(body), cache: 'no-store' });
  let data: T | null = null;
  try {
    data = (await res.json()) as T;
  } catch {
    data = null;
  }
  return { status: res.status, data };
}
