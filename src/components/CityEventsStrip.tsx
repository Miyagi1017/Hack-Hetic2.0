import React from 'react';
import { CityFestival, CityTradition } from '../types/travel';

interface CityEventsStripProps {
  city: string;
  country: string;
  festivals: CityFestival[];
  traditions: CityTradition[];
  /** Ouvre l'onglet des coutumes et alertes locales. */
  onSeeAll?: () => void;
}

/**
 * Bandeau « événements du pays » : les festivités de la destination,
 * affichées sous l'en-tête du jour, juste avant le programme.
 */
export const CityEventsStrip: React.FC<CityEventsStripProps> = ({
  city,
  country,
  festivals,
  traditions,
  onSeeAll,
}) => {
  if (festivals.length === 0 && traditions.length === 0) return null;

  return (
    <section className="mb-6 rounded-2xl border border-line bg-white">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-4 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          Événements · {country || city}
        </p>
        <p className="text-[11px] text-muted">
          {festivals.length} festivité{festivals.length > 1 ? 's' : ''} à {city}
        </p>
      </div>

      {festivals.length > 0 && (
        <div className="flex gap-3 overflow-x-auto px-4 py-3">
          {festivals.map((festival) => (
            <article
              key={festival.id}
              className="min-w-[180px] max-w-[220px] shrink-0 border-l border-line pl-3 first:border-l-0 first:pl-0"
            >
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-accent">
                {festival.period}
              </p>
              <h4 className="mt-0.5 font-serif text-[13px] font-semibold leading-snug text-ink">
                {festival.name}
              </h4>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted">
                {festival.description}
              </p>
              <p className="mt-1 text-[10px] font-semibold text-ink-soft">
                {festival.isFree ? 'Gratuit' : `Dès ${festival.priceFrom ?? 0} €`}
              </p>
            </article>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2">
        <p className="min-w-0 flex-1 truncate text-[11px] text-muted">
          <span className="font-semibold text-ink-soft">À savoir · </span>
          {traditions[0]?.title ?? 'Les us locales de la destination'}
        </p>
        {onSeeAll && (
          <button
            type="button"
            onClick={onSeeAll}
            className="shrink-0 cursor-pointer text-[11px] font-semibold text-ink hover:text-accent"
          >
            Infos pratiques →
          </button>
        )}
      </div>
    </section>
  );
};
