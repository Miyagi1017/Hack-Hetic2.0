import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  icon?: React.ReactNode;
  loading?: 'lazy' | 'eager';
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

/**
 * Image avec repli visuel doux : si la source est absente ou indisponible
 * (hors ligne, réseau bloqué), on affiche un aplat crème plutôt que le texte
 * alternatif brut, qui casse la mise en page.
 */
export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackClassName = '',
  icon,
  loading = 'lazy',
  onClick,
}) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        onClick={onClick}
        className={`flex items-center justify-center bg-[linear-gradient(140deg,#f6f1e7_0%,#ece2d2_62%,#e4d9c6_100%)] text-ink/25 ${className} ${fallbackClassName}`}
      >
        {icon ?? <ImageOff className="h-5 w-5" aria-hidden="true" />}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      draggable={false}
      onClick={onClick}
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
