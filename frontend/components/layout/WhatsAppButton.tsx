import { WhatsappIcon } from '@/components/icons/social';

/** Single floating action on lg+ (design system §5.22). */
export default function WhatsAppButton({ href }: { href: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with the admission cell on WhatsApp (opens in new tab)"
      title="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 hidden size-14 place-items-center rounded-full bg-whatsapp text-white shadow-md transition-transform duration-200 hover:-translate-y-0.5 lg:grid"
    >
      <WhatsappIcon size={28} />
    </a>
  );
}
