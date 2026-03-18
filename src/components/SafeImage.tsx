import { useState } from "react";

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

export const SafeImage = ({
  src,
  alt,
  className,
  fallback,
}: SafeImageProps) => {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div className={`bg-zinc-200 ${className ?? ""}`} aria-label={alt} />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
    />
  );
};
