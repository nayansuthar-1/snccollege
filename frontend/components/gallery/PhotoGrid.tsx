'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import GalleryLightbox from './GalleryLightbox';
import type { Img } from '@/lib/wp/types';

/** Album photo tiles; clicking one opens the lightbox at that photo (design system §5.23). */
export default function PhotoGrid({ photos }: { photos: Img[] }) {
  const [index, setIndex] = useState(-1);
  const tiles = useRef<(HTMLButtonElement | null)[]>([]);
  const opener = useRef(-1);

  function close() {
    if (index < 0) return;
    const tile = tiles.current[opener.current];
    setIndex(-1);
    // Return focus to the tile the visitor clicked.
    tile?.focus();
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo, i) => (
          <li key={photo.url}>
            <button
              type="button"
              ref={(el) => {
                tiles.current[i] = el;
              }}
              onClick={() => {
                opener.current = i;
                setIndex(i);
              }}
              className="block w-full overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
            >
              <span className="sr-only">Open photo {i + 1} of {photos.length}</span>
              <Image
                src={photo.url}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                loading="lazy"
                sizes="(min-width: 1024px) 280px, (min-width: 768px) 33vw, 50vw"
                className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
              />
            </button>
          </li>
        ))}
      </ul>

      <GalleryLightbox photos={photos} index={index} onClose={close} />
    </>
  );
}
