import PersonCard from '@/components/cards/PersonCard';
import type { Person } from '@/lib/wp/types';

/** Staff-type slugs in the order shown; any other type follows in the order WordPress returns. */
const STAFF_TYPE_ORDER = ['teaching', 'non-teaching'];

type Group = { key: string; heading: string; people: Person[] };

function groupByStaffType(people: Person[]): Group[] {
  const groups = new Map<string, Group>();
  for (const person of people) {
    const key = person.staff_type?.slug ?? '';
    if (!groups.has(key)) {
      groups.set(key, { key, heading: person.staff_type ? `${person.staff_type.name} staff` : 'Other staff', people: [] });
    }
    groups.get(key)!.people.push(person);
  }
  const rank = (key: string) => {
    const index = STAFF_TYPE_ORDER.indexOf(key);
    return index === -1 ? STAFF_TYPE_ORDER.length : index;
  };
  return [...groups.values()].sort((a, b) => rank(a.key) - rank(b.key));
}

/** Person cards grouped by staff type, teaching first (Plan Phase 8 task 3). */
export default function FacultyGroups({ people }: { people: Person[] }) {
  return (
    <div className="space-y-16">
      {groupByStaffType(people).map((group) => (
        <section key={group.key || 'other'}>
          <h2 className="mb-8 font-serif text-[1.75rem] font-bold leading-snug text-ink-900 md:text-3xl">{group.heading}</h2>
          <ul className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
            {group.people.map((person) => (
              <li key={person.id}>
                <PersonCard person={person} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
