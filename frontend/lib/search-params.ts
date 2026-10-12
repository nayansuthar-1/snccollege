/** Next 16 passes searchParams as a Promise of possibly-repeated values. */
export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** First value of a query parameter, trimmed. */
export function param(values: Record<string, string | string[] | undefined>, name: string): string {
  const value = values[name];
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? '';
}

/** Positive integer query parameter (page numbers). */
export function pageParam(values: Record<string, string | string[] | undefined>, name = 'page'): number {
  const parsed = Number.parseInt(param(values, name), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}
