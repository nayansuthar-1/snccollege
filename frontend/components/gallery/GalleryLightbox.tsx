'use client';

import Lightbox from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import type { Img } from '@/lib/wp/types';

type GalleryLightboxProps = {
  photos: Img[];
  /** Index of the open photo, or -1 when closed. */
  index: number;
  onClose: () => void;
};

/** Full-screen photo viewer: captions, counter, arrow keys and Escape (design system §5.23). */
export default function GalleryLightbox({ photos, index, onClose }: GalleryLightboxProps) {
  return (
    <Lightbox
      open={index >= 0}
      index={Math.max(index, 0)}
      close={onClose}
      plugins={[Captions, Counter]}
      captions={{ descriptionTextAlign: 'center', showToggle: false }}
      carousel={{ finite: true }}
      slides={photos.map((photo) => ({
        src: photo.url,
        width: photo.width,
        height: photo.height,
        alt: photo.alt,
        description: photo.alt,
      }))}
      // The library reads its backdrop colour from this variable, so the token sets it — no inline colour.
      className="[--yarl__color_backdrop:color-mix(in_srgb,var(--color-primary-950)_92%,transparent)]"
    />
  );
}
