'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';
import { resolveImage } from '@/lib/api';

/** next/image that falls back to a neutral placeholder when the source is missing or broken. */
export default function SafeImage({ src, alt, ...rest }: Omit<ImageProps, 'src'> & { src?: string | null }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const resolved = resolveImage(src);
  const current = failedSrc === resolved ? '/img/placeholder.svg' : resolved;

  return (
    <Image
      {...rest}
      src={current}
      alt={alt}
      unoptimized={current.endsWith('.svg') || /^https?:/.test(current)}
      onError={() => setFailedSrc(resolved)}
    />
  );
}
