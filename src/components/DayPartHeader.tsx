import React from 'react';
import { DayPart } from '../data/day-parts';

interface DayPartHeaderProps {
  part: DayPart;
  count: number;
  /** Premier bloc de la journée : pas d'espace supérieur. */
  isFirst?: boolean;
}

/**
 * Séparateur de la timeline : Matin, Déjeuner, Après-midi, Dîner, Soirée…
 * Un simple point de couleur suffit à situer le moment de la journée.
 */
export const DayPartHeader: React.FC<DayPartHeaderProps> = ({ part, count, isFirst }) => (
  <div className={isFirst ? 'mb-3' : 'mb-3 mt-7'}>
    <div className="flex items-baseline gap-2.5">
      <span
        className="h-2 w-2 shrink-0 self-center rounded-full"
        style={{ background: part.accent }}
        aria-hidden="true"
      />
      <span
        className="font-serif text-[17px] font-semibold leading-none tracking-tight"
        style={{ color: part.accent }}
      >
        {part.label}
      </span>
      <span className="text-[10px] uppercase tracking-[0.16em] text-muted">{part.range}</span>
      <span className="ml-auto shrink-0 text-[10px] text-muted">
        {count} étape{count > 1 ? 's' : ''}
      </span>
    </div>

    <div
      className="mt-2 h-px w-full"
      style={{
        background: `linear-gradient(90deg, ${part.accent} 0%, ${part.border} 18%, rgba(0,0,0,0) 90%)`,
      }}
      aria-hidden="true"
    />
  </div>
);
