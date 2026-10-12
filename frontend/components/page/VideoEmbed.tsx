'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Play } from 'lucide-react';

type VideoEmbedProps = { videoId: string; title: string };

/**
 * Click-to-load YouTube player (design system §6.9): a thumbnail and a play button;
 * the iframe — and YouTube's scripts and cookies — load only after the visitor clicks.
 */
export default function VideoEmbed({ videoId, title }: VideoEmbedProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="my-8 aspect-video w-full rounded-xl border-0"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group relative my-8 block aspect-video w-full overflow-hidden rounded-xl bg-primary-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
    >
      <Image
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        fill
        sizes="(min-width: 768px) 768px, 100vw"
        className="object-cover opacity-80 transition-opacity duration-200 group-hover:opacity-100"
      />
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid size-16 place-items-center rounded-full bg-primary-950/80 text-white transition-colors duration-200 group-hover:bg-primary-800">
          <Play aria-hidden="true" size={28} strokeWidth={1.75} className="translate-x-0.5" />
        </span>
      </span>
      <span className="sr-only">Play video: {title}</span>
    </button>
  );
}
