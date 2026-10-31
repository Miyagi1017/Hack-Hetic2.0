import React, { useState } from 'react';
import { ItineraryStep, Activity, PhotoSpotSpotlight } from '../types/travel';
import { CURATED_PHOTO_SPOTS } from '../data/mock-data';
import { formatDistance, haversineKm } from '../data/geo';
import { SafeImage } from './SafeImage';
import { TimeField } from './TimeField';

const TIME_PRESETS = [
  { label: 'Matin', time: '09:00' },
  { label: 'Déjeuner', time: '12:30' },
  { label: 'Après-midi', time: '15:00' },
  { label: 'Dîner', time: '19:30' },
  { label: 'Soirée', time: '21:30' },
];

interface TimelineItemProps {
  step: ItineraryStep;
  index: number;
  totalSteps: number;
  isSelected: boolean;
  onSelect: () => void;
  onOpenConflict: () => void;
  onOpenComparator?: (activity: Activity) => void;
  onToggleWishlist?: (activity: Activity) => void;
  isWishlisted?: boolean;
  onOpenPhotoSpot?: (spot: PhotoSpotSpotlight) => void;
  onUpdateRating?: (stepIndex: number, rating: number) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onReplace?: () => void;
  onUpdateTime?: (time: string) => void;
  /** Étape suivante : affiche le trajet en une seule ligne discrète. */
  nextStep?: ItineraryStep;
}

/**
 * Étape d'itinéraire — l'essentiel : une heure, un lieu, un prix, trois actions.
 * Aucune icône décorative, aucune couleur par moment de la journée.
 */
export const TimelineItem: React.FC<TimelineItemProps> = ({
  step,
  index,
  totalSteps,
  isSelected,
  onSelect,
  onOpenConflict,
  onOpenComparator,
  onToggleWishlist,
  isWishlisted,
  onOpenPhotoSpot,
  onMoveUp,
  onMoveDown,
  onReplace,
  onUpdateTime,
  nextStep,
}) => {
  const act = step.activity;
  const isConflict = !!step.conflict;
  const scenic = step.scenicPassage;

  const [isScenicExpanded, setIsScenicExpanded] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [draftTime, setDraftTime] = useState(act.time);

  const matchingSpot = CURATED_PHOTO_SPOTS.find(
    (s) =>
      s.locationName.toLowerCase().includes(act.name.toLowerCase().split(' ')[0]) ||
      act.name.toLowerCase().includes(s.name.toLowerCase().split(' ')[0]) ||
      (scenic &&
        (s.name.toLowerCase().includes(scenic.name.toLowerCase().split(' ')[0]) ||
          scenic.name.toLowerCase().includes(s.name.toLowerCase().split(' ')[0])))
  );

  const leg = nextStep?.travel;
  const legDistance =
    leg &&
    nextStep &&
    act.lat != null &&
    act.lng != null &&
    nextStep.activity.lat != null &&
    nextStep.activity.lng != null
      ? formatDistance(haversineKm([act.lat, act.lng], [nextStep.activity.lat, nextStep.activity.lng]))
      : null;

  return (
    <div>
      <article
        onClick={onSelect}
        className={`cursor-pointer rounded-2xl border bg-white p-4 transition-colors ${
          isConflict
            ? 'border-amber-300'
            : isSelected
              ? 'border-ink/35'
              : 'border-line hover:border-line-strong'
        }`}
      >
        <div className="flex items-start gap-3">
          {act.image && (
            <SafeImage
              src={act.image}
              alt={act.name}
              className="hidden h-14 w-14 shrink-0 rounded-lg border border-line object-cover sm:block"
              icon={<span className="text-[9px] text-muted">Photo</span>}
            />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-baseline gap-2">
                {onUpdateTime ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDraftTime(act.time);
                      setIsEditingTime((prev) => !prev);
                    }}
                    title="Modifier l'horaire"
                    aria-label={`Modifier l'horaire de ${act.name}`}
                    aria-expanded={isEditingTime}
                    className="-ml-1 shrink-0 cursor-pointer rounded-md px-1 py-0.5 text-[12px] font-semibold tabular-nums text-ink transition-colors hover:bg-paper-deep"
                  >
                    {act.time}
                  </button>
                ) : (
                  <span className="shrink-0 text-[12px] font-semibold tabular-nums text-ink">
                    {act.time}
                  </span>
                )}

                <h3 className="line-clamp-2 font-serif text-[16px] font-semibold leading-snug text-ink">
                  {act.name}
                </h3>
              </div>

              <span className="shrink-0 text-[11px] font-semibold text-ink">
                {act.price > 0 ? `${act.price} €` : 'Gratuit'}
              </span>
            </div>

            <p className="mt-1 truncate text-[11px] text-muted">{act.address}</p>
            <p className="mt-0.5 text-[11px] text-muted">
              {act.category}
              <span className="mx-1.5 opacity-40">·</span>
              {act.duration}
            </p>

            {isConflict && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenConflict();
                }}
                className="mt-1.5 cursor-pointer rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 hover:bg-amber-200"
              >
                Conflit · résoudre
              </button>
            )}

            {isEditingTime && onUpdateTime && (
              <div className="mt-2.5 rounded-xl border border-line bg-paper p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                    Nouvel horaire
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditingTime(false);
                    }}
                    className="cursor-pointer text-[11px] text-muted hover:text-ink"
                  >
                    Fermer
                  </button>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="contents" onClick={(e) => e.stopPropagation()}>
                    <TimeField
                      value={draftTime}
                      onChange={setDraftTime}
                      ariaLabel="Choisir l'horaire de l'activité"
                      compact
                    />
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!draftTime) return;
                      onUpdateTime(draftTime);
                      setIsEditingTime(false);
                    }}
                    className="cursor-pointer rounded-full bg-ink px-3 py-1 text-[11px] font-semibold text-white hover:bg-ink-soft"
                  >
                    Valider
                  </button>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {TIME_PRESETS.map((preset) => (
                    <button
                      key={preset.time}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDraftTime(preset.time);
                      }}
                      aria-pressed={draftTime === preset.time}
                      className={`cursor-pointer rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                        draftTime === preset.time
                          ? 'border-ink bg-ink text-white'
                          : 'border-line bg-white text-ink-soft hover:border-line-strong'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <p className="mt-1.5 text-[10px] leading-relaxed text-muted">
                  Les étapes se replacent dans l'ordre et les trajets sont recalculés.
                </p>
              </div>
            )}

            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-line/70 pt-2 text-[11px] font-medium">
              <a
                href={
                  act.googleMapsUrl ||
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.name + ' ' + act.address)}`
                }
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted transition-colors hover:text-ink"
              >
                Carte ↗
              </a>

              {onReplace && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReplace();
                  }}
                  className="cursor-pointer text-muted transition-colors hover:text-ink"
                >
                  Modifier
                </button>
              )}

              {onToggleWishlist && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWishlist(act);
                  }}
                  aria-pressed={isWishlisted}
                  className={`cursor-pointer transition-colors ${
                    isWishlisted ? 'font-semibold text-rose-600' : 'text-muted hover:text-ink'
                  }`}
                >
                  {isWishlisted ? 'Gardé' : 'Garder'}
                </button>
              )}

              {(onMoveUp || onMoveDown) && (
                <span className="flex items-center gap-1.5 text-muted">
                  {onMoveUp && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveUp();
                      }}
                      title="Monter l'étape"
                      aria-label="Monter l'étape"
                      className="cursor-pointer hover:text-ink"
                    >
                      ↑
                    </button>
                  )}
                  {onMoveDown && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveDown();
                      }}
                      title="Descendre l'étape"
                      aria-label="Descendre l'étape"
                      className="cursor-pointer hover:text-ink"
                    >
                      ↓
                    </button>
                  )}
                </span>
              )}

              {onOpenComparator && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenComparator(act);
                  }}
                  className="ml-auto rounded-full bg-ink px-3 py-1 font-semibold text-white transition-colors hover:bg-ink-soft"
                >
                  {act.price > 0 ? `Réserver · ${act.price} €` : 'Comparer'}
                </button>
              )}
            </div>

            {matchingSpot && onOpenPhotoSpot && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenPhotoSpot(matchingSpot);
                }}
                className="mt-2 cursor-pointer text-[11px] text-muted transition-colors hover:text-ink"
              >
                Photos & avis ({matchingSpot.reviews.length})
              </button>
            )}
          </div>
        </div>

        {scenic && (
          <div className="mt-3 border-t border-line/70 pt-2 text-[11px]">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 text-muted">
                <span className="font-semibold text-ink">Passage paysager · </span>
                <span className="truncate">{scenic.name}</span>
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsScenicExpanded(!isScenicExpanded);
                }}
                aria-expanded={isScenicExpanded}
                className="shrink-0 cursor-pointer font-semibold text-ink hover:text-accent"
              >
                {isScenicExpanded ? 'Fermer' : 'Détails'}
              </button>
            </div>

            {isScenicExpanded && (
              <div className="mt-2 space-y-1 text-[11px] text-muted">
                <p className="leading-relaxed">{scenic.description}</p>
                <p>
                  {scenic.safetyRating} · {scenic.safetyScore}% · {scenic.crowdLevel}
                </p>
                <p className="leading-relaxed">{scenic.photoTips}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(scenic.name)}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-block font-semibold text-ink hover:text-accent"
                >
                  Carte ↗
                </a>
              </div>
            )}
          </div>
        )}
      </article>

      {/* Trajet vers l'étape suivante : une ligne, sans icône */}
      {index < totalSteps - 1 && leg && nextStep && (
        <p className="py-1.5 pl-[3.25rem] text-[11px] text-muted">
          puis {leg.duration} · {leg.mode}
          {legDistance ? ` · ${legDistance}` : ''}
          {leg.cost > 0 ? ` · ${leg.cost.toFixed(2)} €` : ''}
        </p>
      )}
    </div>
  );
};
