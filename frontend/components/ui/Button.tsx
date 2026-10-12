import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'accent' | 'outline' | 'outline-light' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

type CommonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

type LinkButtonProps = CommonProps & {
  href: string;
  /** Force new-tab behaviour; auto-detected for http(s) URLs. */
  external?: boolean;
  ariaLabel?: string;
};

type NativeButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & { href?: undefined };

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 disabled:pointer-events-none disabled:opacity-50';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary-800 text-white hover:bg-primary-700',
  accent: 'bg-gold-500 text-primary-950 hover:bg-gold-400',
  outline: 'border border-primary-800 text-primary-800 hover:bg-primary-50',
  'outline-light': 'border border-white/70 text-white hover:bg-white/10',
  link: 'group px-0 text-primary-800 underline-offset-4 hover:text-primary-700 hover:underline',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4',
  md: 'h-11 px-5',
  lg: 'h-12 px-7 text-base',
};

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cn(base, variants[variant], variant === 'link' ? 'h-auto' : sizes[size], className);
}

export function isExternalHref(href: string) {
  return /^https?:\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');
}

export default function Button({ children, variant = 'primary', size = 'md', className, ...props }: LinkButtonProps | NativeButtonProps) {
  const classes = buttonClasses(variant, size, className);
  const content = (
    <>
      {children}
      {variant === 'link' && (
        <ArrowRight
          aria-hidden="true"
          size={16}
          strokeWidth={1.75}
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      )}
    </>
  );

  if ('href' in props && props.href !== undefined) {
    const { href, external, ariaLabel } = props;
    const newTab = external ?? /^https?:\/\//.test(href);
    if (newTab || isExternalHref(href)) {
      return (
        <a
          href={href}
          className={classes}
          aria-label={ariaLabel}
          {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {content}
          {newTab && <span className="sr-only">(opens in new tab)</span>}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  const { type = 'button', ...buttonProps } = props as Omit<NativeButtonProps, keyof CommonProps>;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {content}
    </button>
  );
}
