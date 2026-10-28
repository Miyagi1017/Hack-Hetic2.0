import React, { useMemo, useState } from 'react';
import { Compass, MapPin, Plus, Search, X } from 'lucide-react';
import { AVAILABLE_DESTINATIONS } from '../data/mock-data';
import { SafeImage } from './SafeImage';

interface AddTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Destinations déjà planifiées (id de destination). */
  plannedDestinationIds: string[];
  onAdd: (destinationId: string) => void;
}

export const AddTripModal: React.FC<AddTripModalProps> = ({
  isOpen,
  onClose,
  plannedDestinationIds,
  onAdd,
}) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return AVAILABLE_DESTINATIONS;
    return AVAILABLE_DESTINATIONS.filter(
      (destination) =>
        destination.name.toLowerCase().includes(search) ||
        destination.country.toLowerCase().includes(search) ||
        destination.region.toLowerCase().includes(search)
    );
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-line bg-white shadow-2xl sm:rounded-[26px]">
        <div className="flex items-start justify-between gap-3 border-b border-line bg-white/95 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-ink text-amber-300">
              <Compass className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                Mes plannings
              </span>
              <h3 className="font-serif text-xl font-semibold leading-tight text-ink">
                Ajouter une destination
              </h3>
              <p className="mt-0.5 text-[11px] text-muted">
                Ajoutez plusieurs séjours prévus, puis consultez-les depuis l'accueil.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="cursor-pointer rounded-full p-2 text-muted transition-colors hover:bg-paper hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher une ville ou un pays..."
              className="w-full rounded-xl border border-line bg-paper py-2.5 pl-8 pr-3 text-sm text-ink focus:border-ink focus:outline-none"
            />
          </div>

          <div className="mt-3 max-h-[46vh] space-y-2 overflow-y-auto pr-0.5">
            {filtered.length === 0 && (
              <p className="rounded-xl border border-dashed border-line bg-paper px-3 py-6 text-center text-xs text-muted">
                Aucune destination ne correspond à cette recherche.
              </p>
            )}

            {filtered.map((destination) => {
              const alreadyPlanned = plannedDestinationIds.includes(destination.id);
              return (
                <div
                  key={destination.id}
                  className={`flex items-center gap-3 rounded-2xl border p-2.5 ${
                    alreadyPlanned ? 'border-emerald-200 bg-emerald-50/60' : 'border-line bg-white'
                  }`}
                >
                  <SafeImage
                    src={destination.coverImage}
                    alt={destination.name}
                    className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    icon={<MapPin className="h-4 w-4 text-ink/30" aria-hidden="true" />}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {destination.name}
                      <span className="ml-1 text-[11px] font-normal text-muted">
                        {destination.country}
                      </span>
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted">
                      {destination.tagline}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAdd(destination.id)}
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                      alreadyPlanned
                        ? 'cursor-pointer border border-line bg-white text-ink-soft hover:border-line-strong hover:text-ink'
                        : 'cursor-pointer bg-ink text-white hover:bg-ink-soft'
                    }`}
                  >
                    {alreadyPlanned ? (
                      <>
                        <Plus className="h-3 w-3" />
                        Ajouter encore
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3" />
                        Ajouter
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line bg-white p-4">
          <p className="text-[11px] text-muted">
            {plannedDestinationIds.length} destination{plannedDestinationIds.length > 1 ? 's' : ''}{' '}
            déjà planifiée{plannedDestinationIds.length > 1 ? 's' : ''}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-ink-soft"
          >
            Terminé
          </button>
        </div>
      </div>
    </div>
  );
};
