import { FacebookIcon, InstagramIcon, YoutubeIcon } from '@/components/icons/social';
import { cn } from '@/lib/cn';
import type { Settings } from '@/lib/wp/types';

type SocialLinksProps = {
  settings: Pick<Settings, 'facebook' | 'instagram' | 'youtube'>;
  variant: 'topbar' | 'footer';
};

export default function SocialLinks({ settings, variant }: SocialLinksProps) {
  const links = [
    { href: settings.facebook, label: 'Facebook', Icon: FacebookIcon },
    { href: settings.instagram, label: 'Instagram', Icon: InstagramIcon },
    { href: settings.youtube, label: 'YouTube', Icon: YoutubeIcon },
  ].filter((l) => l.href);

  if (links.length === 0) return null;

  return (
    <ul className={cn('flex items-center', variant === 'footer' ? 'gap-3' : 'gap-4')}>
      {links.map(({ href, label, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`SNC College on ${label} (opens in new tab)`}
            className={cn(
              'transition-colors duration-200',
              variant === 'footer'
                ? 'grid size-10 place-items-center rounded-full border border-white/15 text-white/70 hover:border-gold-400 hover:text-gold-400'
                : 'text-white/75 hover:text-gold-400',
            )}
          >
            <Icon size={variant === 'footer' ? 18 : 16} />
          </a>
        </li>
      ))}
    </ul>
  );
}
