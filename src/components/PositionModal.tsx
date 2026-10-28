import React from 'react';
import { Check, Compass, Loader2, LocateFixed, MapPin, X } from 'lucide-react';
import { AVAILABLE_DESTINATIONS } from '../data/mock-data';
import { SavedPosition } from '../data/position';

interface PositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  current: SavedPosition | null;
  locating: boolean;
  error: string | null;
  onLocate: () => void;
  onSelect: (position: SavedPosition) => void;
}

export const PositionModal: React.FC<PositionModalProps> = ({
  isOpen,
  onClose,
  current,
  locating,
  error,
  onLocate,
  onSelect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-0 backdrop-blur-xs animate-in fade-in duration-200 sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-line bg-white shadow-2xl sm:rounded-[26px]">
        <div className="flex items-start justify-between gap-3 border-b border-line p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-ink text-amber-300">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                Géolocalisation
              </span>
              <h3 className="font-serif text-xl font-semibold leading-tight text-ink">
                Position actuelle
              </h3>
              <p className="mt-0.5 text-[11px] text-muted">
                Actualisez votre position GPS ou définissez-la manuellement.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer la position"
            className="cursor-pointer rounded-full p-2 text-muted transition-colors hover:bg-paper hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-5">
          <div className="rounded-2xl border border-line bg-paper p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Position enregistrée
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-ink">
              <MapPin className="h-4 w-4 text-accent" />
              {current ? current.label : 'Aucune position définie'}
            </p>
            {current && (
              <p className="mt-0.5 text-[10px] text-muted">
                {current.source === 'gps' ? 'GPS' : 'Définie manuellement'} ·{' '}
                {current.lat.toFixed(4)}, {current.lng.toFixed(4)}
              </p>
            )}

            <button
              type="button"
              onClick={onLocate}
              disabled={locating}
              className="mt-2.5 inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-ink-soft disabled:cursor-default disabled:opacity-60"
            >
              {locating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LocateFixed className="h-3.5 w-3.5" />
              )}
              {locating ? 'Localisation…' : 'Actualiser ma position'}
            </button>

            {error && (
              <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[10px] leading-relaxed text-amber-900">
                {error}
              </p>
            )}
          </div>

          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
              <Compass className="h-3 w-3" />
              ou définir manuellement
            </p>

            <div className="mt-2 space-y-2">
              {AVAILABLE_DESTINATIONS.map((destination) => {
                const active =
                  !!current &&
                  Math.abs(current.lat - destination.center[0]) < 0.001 &&
                  Math.abs(current.lng - destination.center[1]) < 0.001;
                return (
                  <div
                    key={destination.id}
                    className={`flex items-center gap-3 rounded-xl border p-2.5 ${
                      active ? 'border-emerald-200 bg-emerald-50/60' : 'border-line bg-white'
                    }`}
                  >
                    <img
                      src={destination.coverImage}
                      alt={destination.name}
                      className="h-10 w-10 shrink-0 rounded-lg object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-ink">
                        {destination.name}{' '}
                        <span className="font-normal text-muted">{destination.country}</span>
                      </p>
                      <p className="text-[10px] text-muted">{destination.region}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onSelect({
                          lat: destination.center[0],
                          lng: destination.center[1],
                          label: `${destination.name} centre`,
                          source: 'manual',
                          updatedAt: new Date().toISOString(),
                        })
                      }
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-semibold transition-colors ${
                        active
                          ? 'cursor-default bg-emerald-100 text-emerald-800'
                          : 'cursor-pointer bg-ink text-white hover:bg-ink-soft'
                      }`}
                    >
                      {active ? (
                        <>
                          <Check className="h-3 w-3" /> Définie
                        </>
                      ) : (
                        'Définir'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
