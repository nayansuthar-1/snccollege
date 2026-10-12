import Link from 'next/link';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';

const popular = [
  { label: 'Admissions', href: '/admissions' },
  { label: 'Notices', href: '/students/notices' },
  { label: 'Programmes', href: '/academics/programmes' },
  { label: 'Merit Lists', href: '/admissions/merit-lists' },
];

export default function NotFound() {
  return (
    <Container size="narrow" className="py-24 text-center md:py-32">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-800">Error 404</p>
      <h1 className="mt-3 font-serif text-3xl font-bold text-ink-900 md:text-[2.75rem] md:leading-[1.2]">Page not found</h1>
      <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-700">
        The page you are looking for may have moved. Try one of the links below.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/">Go to homepage</Button>
        <Button href="/contact" variant="outline">
          Contact us
        </Button>
      </div>
      <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
        {popular.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-primary-800 underline-offset-4 hover:underline">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
