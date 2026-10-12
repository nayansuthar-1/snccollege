import 'server-only';
import { cache } from 'react';
import { WpError, wpFetch, wpPost } from './client';
import {
  emptySettings,
  type Album,
  type AlbumSummary,
  type CommitteesResponse,
  type DocumentsResponse,
  type HomeData,
  type Leader,
  type MeritListsResponse,
  type NewsItem,
  type NewsResponse,
  type NewsSummary,
  type Notice,
  type NoticesResponse,
  type Paged,
  type PathsResponse,
  type Person,
  type Programme,
  type ProgrammeSummary,
  type Settings,
  type WpPage,
} from './types';

/**
 * One function per snc/v1 endpoint (Plan Phase 4).
 * Rule: on failure, list functions return EMPTY results — never sample or fallback data.
 * Single-item functions return null (callers use notFound()).
 */

function logFailure(what: string, error: unknown) {
  console.error(`[wp] ${what} failed:`, error instanceof WpError ? error.message : error);
}

async function safe<T>(what: string, run: () => Promise<T | null>, empty: T): Promise<T> {
  try {
    return (await run()) ?? empty;
  } catch (error) {
    logFailure(what, error);
    return empty;
  }
}

async function safeItem<T>(what: string, run: () => Promise<T | null>): Promise<T | null> {
  try {
    return await run();
  } catch (error) {
    logFailure(what, error);
    return null;
  }
}

const emptyPaged = <T,>(): Paged<T> => ({ items: [], page: 1, total_pages: 0, total: 0 });

// cache() dedupes calls within one render (layout + page both need settings).
export const getSettings = cache(async (): Promise<Settings> => {
  const data = await safe('settings', () => wpFetch<Settings>('/settings', { tags: ['settings'] }), emptySettings);
  return { ...emptySettings, ...data };
});

export const getHome = cache(
  (): Promise<HomeData> =>
    safe(
      'home',
      () => wpFetch<HomeData>('/home', { tags: ['home', 'slides', 'notices', 'programmes', 'leaders', 'news', 'gallery', 'testimonials'] }),
      { slides: [], notices: [], programmes: [], leaders: [], news: [], gallery: [], testimonials: [] },
    ),
);

export const getPage = cache(
  (path: string): Promise<WpPage | null> =>
    safeItem(`page ${path}`, () => wpFetch<WpPage>('/page', { params: { path }, tags: ['pages', `page:${path}`] })),
);

export function getNotices(params: { type?: string; page?: number; perPage?: number; q?: string } = {}): Promise<NoticesResponse> {
  return safe(
    'notices',
    () => wpFetch<NoticesResponse>('/notices', { params: { type: params.type, page: params.page, per_page: params.perPage, q: params.q }, tags: ['notices'] }),
    { ...emptyPaged<Notice>(), types: [] },
  );
}

export function getMeritLists(params: { year?: string; programme?: string; listType?: string; category?: string } = {}): Promise<MeritListsResponse> {
  return safe(
    'merit-lists',
    () =>
      wpFetch<MeritListsResponse>('/merit-lists', {
        params: { year: params.year, programme: params.programme, list_type: params.listType, category: params.category },
        tags: ['merit-lists'],
      }),
    { items: [], selected_year: '', years: [], programmes: [], list_types: [], categories: [] },
  );
}

/** type may be a comma-separated list, e.g. "aqar,aishe,annual-report". */
export function getDocuments(params: { type?: string; year?: string; programme?: string } = {}): Promise<DocumentsResponse> {
  return safe('documents', () => wpFetch<DocumentsResponse>('/documents', { params, tags: ['documents'] }), { items: [], years: [] });
}

export const getProgrammes = cache(
  (): Promise<ProgrammeSummary[]> => safe('programmes', () => wpFetch<ProgrammeSummary[]>('/programmes', { tags: ['programmes'] }), []),
);

export const getProgramme = cache(
  (slug: string): Promise<Programme | null> => safeItem(`programme ${slug}`, () => wpFetch<Programme>(`/programmes/${encodeURIComponent(slug)}`, { tags: ['programmes'] })),
);

export function getFaculty(department?: string): Promise<Person[]> {
  return safe('faculty', () => wpFetch<Person[]>('/faculty', { params: { department }, tags: ['faculty'] }), []);
}

export function getCommittees(year?: string): Promise<CommitteesResponse> {
  return safe('committees', () => wpFetch<CommitteesResponse>('/committees', { params: { year }, tags: ['committees'] }), {
    items: [],
    selected_year: '',
    years: [],
  });
}

export const getLeaders = cache((): Promise<Leader[]> => safe('leaders', () => wpFetch<Leader[]>('/leaders', { tags: ['leaders'] }), []));

export function getAlbums(page = 1): Promise<Paged<AlbumSummary>> {
  return safe('gallery', () => wpFetch<Paged<AlbumSummary>>('/gallery', { params: { page }, tags: ['gallery'] }), emptyPaged<AlbumSummary>());
}

export const getAlbum = cache(
  (slug: string): Promise<Album | null> => safeItem(`album ${slug}`, () => wpFetch<Album>(`/gallery/${encodeURIComponent(slug)}`, { tags: ['gallery'] })),
);

export function getNews(params: { category?: string; page?: number; q?: string } = {}): Promise<NewsResponse> {
  return safe('news', () => wpFetch<NewsResponse>('/news', { params, tags: ['news'] }), { ...emptyPaged<NewsSummary>(), categories: [] });
}

export const getNewsItem = cache(
  (slug: string): Promise<NewsItem | null> => safeItem(`news ${slug}`, () => wpFetch<NewsItem>(`/news/${encodeURIComponent(slug)}`, { tags: ['news'] })),
);

export function getPaths(): Promise<PathsResponse> {
  return safe('paths', () => wpFetch<PathsResponse>('/paths', { tags: ['paths', 'pages'] }), { pages: [], programmes: [], news: [], gallery: [] });
}

export type EnquiryInput = { name: string; phone: string; email?: string; programme?: string; message?: string; website?: string };
export type EnquiryResult = { ok: boolean; errors?: Record<string, string>; status: number };

export async function submitEnquiry(input: EnquiryInput, clientIp?: string): Promise<EnquiryResult> {
  try {
    const { status, data } = await wpPost<{ ok: boolean; errors?: Record<string, string> }>('/enquiry', input, clientIp);
    return { ok: Boolean(data?.ok), errors: data?.errors, status };
  } catch (error) {
    logFailure('enquiry', error);
    return { ok: false, status: 0 };
  }
}
