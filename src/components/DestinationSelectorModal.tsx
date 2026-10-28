import React, { useMemo, useState } from 'react';
import {
  X,
  MapPin,
  Check,
  Search,
  ExternalLink,
  Globe,
  Navigation,
  Compass,
} from 'lucide-react';
import { DestinationOption } from '../types/travel';
import { AVAILABLE_DESTINATIONS } from '../data/mock-data';
import { SafeImage } from './SafeImage';

interface DestinationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDestinationId: string;
  onSelectDestination: (dest: DestinationOption) => void;
}

const mapsEmbedUrl = (dest: DestinationOption) =>
  `https://www.google.com/maps?q=${encodeURIComponent(`${dest.name}, ${dest.country}`)}&z=${dest.zoom}&output=embed`;

const mapsSearchUrl = (dest: DestinationOption) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${dest.name} ${dest.country}`)}`;

const mapsDirectionsUrl = (dest: DestinationOption) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${dest.name} ${dest.country}`)}`;

export const DestinationSelectorModal: React.FC<DestinationSelectorModalProps> = ({
  isOpen,
  onClose,
  currentDestinationId,
  onSelectDestination,
}) => {
  const [search, setSearch] = useState('');
  const [previewId, setPreviewId] = useState<string>(currentDestinationId);

  const filtered = useMemo(
    () =>
      AVAILABLE_DESTINATIONS.filter(
        (dest) =>
          dest.name.toLowerCase().includes(search.toLowerCase()) ||
          dest.country.toLowerCase().includes(search.toLowerCase()) ||
          dest.region.toLowerCase().includes(search.toLowerCase()) ||
          dest.tagline.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  if (!isOpen) return null;

  const preview =
    AVAILABLE_DESTINATIONS.find((dest) => dest.id === previewId) ??
    AVAILABLE_DESTINATIONS.find((dest) => dest.id === currentDestinationId) ??
    AVAILABLE_DESTINATIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-3 backdrop-blur-xs animate-in fade-in duration-200 sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-y-auto rounded-[26px] border border-line bg-white p-4 shadow-2xl sm:p-6">
        {/* En-tête */}
        <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-white">
              <Globe className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-semibold text-ink">Choisir une destination</h2>
              <p className="text-xs text-muted">
                Aperçu Google Maps, itinéraire et programme adaptés à chaque ville.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer le sélecteur de destination"
            className="cursor-pointer rounded-full p-2 text-muted transition-colors hover:bg-paper hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Recherche */}
        <div className="relative my-4">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher une ville, un pays, une région…"
            className="w-full rounded-xl border border-line bg-paper py-2.5 pl-10 pr-4 text-sm font-medium focus:border-ink focus:outline-none"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Liste */}
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-line-strong bg-paper p-6 text-center text-sm text-muted">
                Aucune destination ne correspond à « {search} ».
              </div>
            )}

            {filtered.map((dest) => {
              const isSelected = currentDestinationId === dest.id;
              const isPreviewed = preview.id === dest.id;
              return (
                <div
                  key={dest.id}
                  onClick={() => setPreviewId(dest.id)}
                  onDoubleClick={() => {
                    onSelectDestination(dest);
                    onClose();
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      onSelectDestination(dest);
                      onClose();
                    }
                  }}
                  className={`group flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3 transition-all sm:gap-4 ${
                    isPreviewed
                      ? 'border-ink bg-paper/70 shadow-xs ring-2 ring-ink/10'
                      : 'border-line bg-white hover:border-line-strong'
                  }`}
                >
                  <SafeImage
                    src={dest.coverImage}
                    alt={dest.name}
                    className="h-16 w-16 shrink-0 rounded-xl border border-line object-cover sm:h-20 sm:w-20"
                    icon={<MapPin className="h-5 w-5 text-ink/25" aria-hidden="true" />}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="font-serif text-lg font-semibold text-ink">{dest.name}</h3>
                      <span className="text-xs text-muted">• {dest.country}</span>
                      {isSelected && (
                        <span className="ml-auto flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold text-white">
                          <Check className="h-2.5 w-2.5" /> Actuel
                        </span>
                      )}
                    </div>
                    <p className="mb-1.5 truncate text-xs text-muted">{dest.tagline}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Compass className="h-3 w-3" /> {dest.region}
                      </span>
                      <span className="inline-flex items-center gap-1">Devise : {dest.currency}</span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onSelectDestination(dest);
                          onClose();
                        }}
                        className="cursor-pointer rounded-full bg-ink px-3 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-ink-soft"
                      >
                        {isSelected ? 'Garder cette ville' : `Choisir ${dest.name}`}
                      </button>
                      <a
                        href={mapsSearchUrl(dest)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-semibold text-blue-700 transition-colors hover:border-blue-200 hover:bg-blue-50"
                      >
                        Google Maps
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Aperçu carte */}
          <aside className="order-first lg:order-none lg:sticky lg:top-4 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-line bg-paper">
              <div className="relative h-56 w-full bg-paper-deep sm:h-64 lg:h-56">
                <iframe
                  key={preview.id}
                  title={`Carte Google Maps de ${preview.name}`}
                  src={mapsEmbedUrl(preview)}
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>

              <div className="space-y-2 p-3.5">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                    Aperçu de la destination
                  </span>
                  <h3 className="font-serif text-lg font-semibold text-ink">
                    {preview.name}
                    <span className="ml-1 text-xs font-normal text-muted">· {preview.country}</span>
                  </h3>
                  <p className="text-[11px] text-muted">{preview.tagline}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={mapsSearchUrl(preview)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1 rounded-xl border border-line bg-white px-2 py-2 text-[11px] font-semibold text-ink transition-colors hover:border-line-strong hover:bg-paper"
                  >
                    <MapPin className="h-3 w-3" />
                    Voir la carte
                  </a>
                  <a
                    href={mapsDirectionsUrl(preview)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1 rounded-xl border border-line bg-white px-2 py-2 text-[11px] font-semibold text-ink transition-colors hover:border-line-strong hover:bg-paper"
                  >
                    <Navigation className="h-3 w-3" />
                    Itinéraire
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectDestination(preview);
                    onClose();
                  }}
                  className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-ink px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-ink-soft"
                >
                  <Check className="h-3.5 w-3.5" />
                  {currentDestinationId === preview.id
                    ? 'Conserver cette destination'
                    : `Partir à ${preview.name}`}
                </button>

                <p className="text-center text-[10px] leading-relaxed text-muted">
                  Astuce : cliquez sur une carte pour l’afficher, double-cliquez pour partir
                  directement.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
