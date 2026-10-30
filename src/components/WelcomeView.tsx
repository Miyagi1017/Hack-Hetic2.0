import React from 'react';
import { DestinationOption, Trip, UserProfile } from '../types/travel';
import { formatEuros } from '../data/activity-budget';
import { SafeImage } from './SafeImage';

export interface PlanningCard {
  id: string;
  destination: DestinationOption;
  dates: string;
  daysCount: number;
  travelers: number;
  budgetTotal: number;
  isCurrent: boolean;
}

interface WelcomeViewProps {
  user: UserProfile;
  trip: Trip;
  activitiesCount: number;
  plannings: PlanningCard[];
  scheduleLabel: string;
  positionLabel: string;
  onOpenPlanner: () => void;
  onOpenNearby: () => void;
  onOpenDates: () => void;
  onOpenSchedule: () => void;
  onOpenGlobalEdit: () => void;
  onRefreshPosition: () => void;
  onOpenPosition: () => void;
  onOpenPlan: (planId: string) => void;
  onAddDestination: () => void;
}

const todayLabel = () =>
  new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  user,
  trip,
  activitiesCount,
  plannings,
  scheduleLabel,
  positionLabel,
  onOpenPlanner,
  onOpenNearby,
  onOpenDates,
  onOpenSchedule,
  onOpenGlobalEdit,
  onRefreshPosition,
  onOpenPosition,
  onOpenPlan,
  onAddDestination,
}) => {
  const firstName = user.name.split(' ')[0] || user.name;
  const city = trip.destination.split(',')[0];

  return (
    <div className="space-y-6">
      {/* Bonjour + résumé du séjour */}
      <section className="border-b border-line pb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          {todayLabel()} · {city}
        </p>
        <h1 className="mt-2 font-serif text-[32px] font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
          Bonjour, {firstName}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          Votre itinéraire, vos réservations et votre budget, réunis au même endroit.
        </p>

        <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-4">
          {[
            { label: 'Durée', value: `${trip.daysCount} jour${trip.daysCount > 1 ? 's' : ''}` },
            { label: 'Voyageurs', value: `${trip.travelers}` },
            { label: 'Activités', value: `${activitiesCount}` },
            { label: 'Budget', value: formatEuros(trip.budgetTotal) },
          ].map((item) => (
            <div key={item.label}>
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                {item.label}
              </dt>
              <dd className="mt-0.5 font-serif text-xl font-semibold text-ink">{item.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-muted">
          <button
            type="button"
            onClick={onOpenDates}
            className="cursor-pointer underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Dates · {trip.dates}
          </button>
          <button
            type="button"
            onClick={onOpenSchedule}
            className="cursor-pointer underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Horaires · {scheduleLabel}
          </button>
          <button
            type="button"
            onClick={onOpenGlobalEdit}
            className="cursor-pointer underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Tout modifier
          </button>
          <button
            type="button"
            onClick={onOpenPosition}
            className="cursor-pointer underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Position · {positionLabel}
          </button>
          <button
            type="button"
            onClick={onRefreshPosition}
            className="cursor-pointer underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Actualiser
          </button>
        </div>
      </section>

      {/* Deux points d'entrée */}
      <section className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={onOpenPlanner}
          className="group flex h-full flex-col justify-between rounded-2xl border border-line bg-white p-5 text-left transition-colors hover:border-ink/30"
        >
          <div>
            <h2 className="font-serif text-xl font-semibold tracking-tight text-ink">
              Consulter mon séjour
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {city} · {trip.dates} · {trip.daysCount} jour
              {trip.daysCount > 1 ? 's' : ''} · {activitiesCount} activité
              {activitiesCount > 1 ? 's' : ''} planifiée{activitiesCount > 1 ? 's' : ''}
            </p>
            <p className="mt-2 text-[11px] text-muted">
              {trip.travelers} voyageur{trip.travelers > 1 ? 's' : ''} ·{' '}
              {formatEuros(trip.budgetTotal)} d'enveloppe
            </p>
          </div>
          <span className="mt-4 text-xs font-semibold text-ink">Ouvrir le planning →</span>
        </button>

        <button
          type="button"
          onClick={onOpenNearby}
          className="group flex h-full flex-col justify-between rounded-2xl border border-line bg-white p-5 text-left transition-colors hover:border-ink/30"
        >
          <div>
            <h2 className="font-serif text-xl font-semibold tracking-tight text-ink">
              Activités aux alentours
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Les adresses connues autour de vous, triées par distance et filtrées selon votre
              budget.
            </p>
            <p className="mt-2 text-[11px] text-muted">
              Position demandée à l'ouverture · repli sur le centre-ville si refusée.
            </p>
          </div>
          <span className="mt-4 text-xs font-semibold text-ink">Me localiser et explorer →</span>
        </button>
      </section>

      {/* Séjours prévus */}
      <section>
        <div className="mb-3 flex items-end justify-between gap-3 px-1">
          <div>
            <h2 className="font-serif text-xl font-semibold tracking-tight text-ink">
              Mes plannings
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Vos séjours prévus, ou une nouvelle destination.
            </p>
          </div>
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted">
            {plannings.length} séjour{plannings.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {plannings.map((planning) => (
            <button
              key={planning.id}
              type="button"
              onClick={() => onOpenPlan(planning.id)}
              aria-pressed={planning.isCurrent}
              className={`group relative h-36 overflow-hidden rounded-2xl border text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
                planning.isCurrent ? 'border-ink ring-2 ring-ink/70' : 'border-line'
              }`}
            >
              <SafeImage
                src={planning.destination.coverImage}
                alt={planning.destination.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                icon={<span className="text-[10px] text-white/70">Photo</span>}
              />
              <span
                className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent"
                aria-hidden="true"
              />
              <span className="absolute inset-x-0 bottom-0 p-3">
                <span className="flex items-center gap-1.5">
                  <span className="font-serif text-base font-semibold text-white">
                    {planning.destination.name}
                  </span>
                  {planning.isCurrent && (
                    <span className="rounded-full bg-amber-300 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-ink">
                      En cours
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-[10px] text-white/75">
                  {planning.destination.country} · {planning.dates}
                </span>
                <span className="mt-0.5 block text-[10px] text-white/60">
                  {planning.daysCount} jour{planning.daysCount > 1 ? 's' : ''} ·{' '}
                  {planning.travelers} voyageur{planning.travelers > 1 ? 's' : ''} ·{' '}
                  {formatEuros(planning.budgetTotal)}
                </span>
              </span>
            </button>
          ))}

          <button
            type="button"
            onClick={onAddDestination}
            className="flex h-36 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-line-strong bg-white/60 px-4 text-center transition-colors hover:border-ink hover:bg-white"
          >
            <span className="text-xl font-light text-ink" aria-hidden="true">+</span>
            <span className="text-xs font-semibold text-ink">Ajouter une destination</span>
            <span className="text-[10px] text-muted">Plusieurs séjours possibles</span>
          </button>
        </div>
      </section>
    </div>
  );
};
