"use client";

import { useState } from "react";
import Image from "next/image";

interface PlaceholderImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackIcon?: React.ReactNode;
  fallbackText?: string;
}

export function PlaceholderImage({
  src,
  alt,
  width,
  height,
  className = "",
  fallbackIcon,
  fallbackText,
}: PlaceholderImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`bg-bocra-light flex flex-col items-center justify-center text-muted-foreground ${className}`}
        style={{ width, height }}
        role="img"
        aria-label={alt}
      >
        {fallbackIcon}
        {fallbackText && (
          <span className="text-[10px] mt-1 text-center px-2">{fallbackText}</span>
        )}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
