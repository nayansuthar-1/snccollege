import Image from 'next/image';
import type { Person } from '@/lib/wp/types';

function initials(name: string) {
  const parts = name
    .replace(/^(dr|mr|mrs|ms|prof|shri|smt)\.?\s+/i, '')
    .split(/\s+/)
    // Strip punctuation so bracketed or punctuated names still yield letters.
    .map((part) => part.replace(/[^\p{L}]/gu, ''))
    .filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export default function PersonCard({ person }: { person: Person }) {
  return (
    <article className="h-full rounded-xl border border-ink-200 bg-white p-6 text-center shadow-sm">
      {person.photo ? (
        <Image
          src={person.photo.url}
          alt={person.photo.alt || person.name}
          width={112}
          height={112}
          className="mx-auto size-28 rounded-full object-cover"
        />
      ) : (
        <span aria-hidden="true" className="mx-auto grid size-28 place-items-center rounded-full bg-primary-100 font-serif text-2xl font-bold text-primary-800">
          {initials(person.name)}
        </span>
      )}
      <h3 className="mt-4 text-base font-bold leading-snug text-ink-900">{person.name}</h3>
      {person.designation && <p className="mt-1 text-sm font-medium text-primary-800">{person.designation}</p>}
      {person.department && <p className="text-sm text-ink-500">{person.department.name}</p>}
      {person.qualification && <p className="mt-2 text-xs leading-5 text-ink-500">{person.qualification}</p>}
      {person.email && (
        <a href={`mailto:${person.email}`} className="mt-3 inline-block break-all text-xs text-primary-800 hover:underline">
          {person.email}
        </a>
      )}
    </article>
  );
}
