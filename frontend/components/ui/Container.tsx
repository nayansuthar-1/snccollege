import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type ContainerProps = {
  children: ReactNode;
  className?: string;
  /** narrow = max-w-4xl for reading pages and forms. */
  size?: 'default' | 'narrow';
};

export default function Container({ children, className, size = 'default' }: ContainerProps) {
  return (
    <div className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', size === 'narrow' ? 'max-w-4xl' : 'max-w-8xl', className)}>
      {children}
    </div>
  );
}
