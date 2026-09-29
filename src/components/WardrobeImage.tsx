"use client";

import Image from "next/image";
import { useState } from "react";

type WardrobeImageProps = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
};

export default function WardrobeImage({
  src,
  alt,
  sizes,
  className,
}: WardrobeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) return null;

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      quality={65}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
