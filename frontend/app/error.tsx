'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';

/** Runtime error fallback (design system §6.11). Next 16 passes `retry`, not `reset`. */
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container size="narrow" className="py-24 text-center md:py-32">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-800">Error</p>
      <h1 className="mt-3 font-serif text-3xl font-bold text-ink-900 md:text-[2.75rem] md:leading-[1.2]">Something went wrong</h1>
      <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-700">
        This page could not be loaded. Please try again, or contact the college office if the problem continues.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={() => retry()}>Try again</Button>
        <Button href="/" variant="outline">
          Go to homepage
        </Button>
        <Button href="/contact" variant="outline">
          Contact us
        </Button>
      </div>
      {error.digest && <p className="mt-10 text-xs text-ink-500">Reference: {error.digest}</p>}
    </Container>
  );
}
