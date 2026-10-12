const shortDate = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const longDate = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
const dayOnly = new Intl.DateTimeFormat('en-IN', { day: '2-digit' });
const monthOnly = new Intl.DateTimeFormat('en-IN', { month: 'short' });

function toDate(iso: string): Date | null {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "9 Oct 2026" (short) or "9 October 2026" (long). Returns '' for invalid input. */
export function formatDate(iso: string, style: 'short' | 'long' = 'short'): string {
  const d = toDate(iso);
  if (!d) return '';
  return (style === 'long' ? longDate : shortDate).format(d);
}

/** Parts for the notice-board date tile: { day: "09", month: "Oct" }. */
export function dateTileParts(iso: string): { day: string; month: string } | null {
  const d = toDate(iso);
  if (!d) return null;
  return { day: dayOnly.format(d), month: monthOnly.format(d) };
}

/** "420 KB", "1.2 MB". Returns '' for missing sizes. */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** File type label from a MIME type, e.g. "PDF". */
export function fileTypeLabel(mime: string | null | undefined): string {
  if (!mime) return 'File';
  if (mime === 'application/pdf') return 'PDF';
  if (mime.includes('word')) return 'DOC';
  if (mime.includes('sheet') || mime.includes('excel')) return 'XLS';
  if (mime.startsWith('image/')) return 'Image';
  return 'File';
}

/** True when the date is within the last `days` days. */
export function isNew(iso: string, days = 7, now: Date = new Date()): boolean {
  const d = toDate(iso);
  if (!d) return false;
  const diff = now.getTime() - d.getTime();
  return diff >= 0 && diff < days * 24 * 60 * 60 * 1000;
}
