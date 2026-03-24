"use client";

interface PlaceholderImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function PlaceholderImage({
  src,
  alt,
  className = "",
}: PlaceholderImageProps) {
  return (
    <div className={`bg-bocra-light overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
