import React from 'react';
import {
  ArrowRight,
  CalendarDays,
  Coins,
  Compass,
  Clock,
  LocateFixed,
  MapPin,
  Pencil,
  Plus,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
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
  onOpenPlanner: () => void;
  onOpenNearby: () => void;
  onOpenDates: () => void;
  onOpenSchedule: () => void;
  onOpenGlobalEdit: () => void;
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
  onOpenPlanner,
  onOpenNearby,
  onOpenDates,
  onOpenSchedule,
  onOpenGlobalEdit,
  onOpenPlan,
  onAddDestination,
}) => {
  const firstName = user.name.split(' ')[0] || user.name;
  const city = trip.destination.split(',')[0];

  return (
    <div className="space-y-6">
      {/* Bonjour + résumé du séjour */}
      <section className="relative overflow-hidden rounded-[28px] bg-ink px-6 py-7 text-white shadow-lg sm:px-9 sm:py-9">
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-gold/20 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-accent/25 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-200/80">
              <Compass className="h-3.5 w-3.5" />
              Votre espace voyage · {todayLabel()}
            </p>
            <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              <span className="uppercase">Bonjour</span>, {firstName}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">
              Retrouvez votre séjour prévu, ajustez vos dates ou partez à la découverte des
              activités autour de vous.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold ring-1 ring-white/15">
              <MapPin className="h-3.5 w-3.5 text-amber-300" />
              {city}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold ring-1 ring-white/15">
              <CalendarDays className="h-3.5 w-3.5 text-amber-300" />
              {trip.dates}
            </span>
            <button
              type="button"
              onClick={onOpenSchedule}
              title="Modifier les horaires des activités"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold ring-1 ring-white/15 transition-colors hover:bg-white/20"
            >
              <Clock className="h-3.5 w-3.5 text-amber-300" />
              {scheduleLabel}
              <Pencil className="h-3 w-3 text-white/70" />
            </button>
            <button
              type="button"
              onClick={onOpenDates}
              title="Modifier les dates et le nombre de voyageurs"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold ring-1 ring-white/15 transition-colors hover:bg-white/20"
            >
              <Pencil className="h-3 w-3" />
              Modifier
            </button>
            <button
              type="button"
              onClick={onOpenGlobalEdit}
              title="Modifier tous les choix et tout recalculer"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-amber-300 px-3 py-1.5 text-[11px] font-bold text-ink transition-colors hover:bg-amber-200"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Tout modifier
            </button>
          </div>
        </div>

        <dl className="relative z-10 mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {[
            { label: 'Durée', value: `${trip.daysCount} jour${trip.daysCount > 1 ? 's' : ''}` },
            { label: 'Voyageurs', value: `${trip.travelers}` },
            { label: 'Activités', value: `${activitiesCount}` },
            { label: 'Budget', value: formatEuros(trip.budgetTotal) },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl bg-white/10 px-3.5 py-2.5 ring-1 ring-white/10 backdrop-blur-sm"
            >
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
                {item.label}
              </dt>
              <dd className="mt-0.5 font-serif text-lg font-semibold">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Deux points d'entrée */}
      <section className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={onOpenPlanner}
          className="group flex h-full flex-col justify-between rounded-[26px] border border-line bg-white p-5 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-md"
        >
          <div>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-amber-300">
              <CalendarDays className="h-5 w-5" />
            </span>
            <h2 className="mt-3.5 font-serif text-xl font-semibold tracking-tight text-ink">
              Consulter mon séjour
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {city} · {trip.dates} · {trip.daysCount} jour
              {trip.daysCount > 1 ? 's' : ''} · {activitiesCount} activité
              {activitiesCount > 1 ? 's' : ''} planifiée{activitiesCount > 1 ? 's' : ''}
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft">
              <Users className="h-3 w-3" />
              {trip.travelers} voyageur{trip.travelers > 1 ? 's' : ''}
              <span className="text-line-strong">•</span>
              <Coins className="h-3 w-3" />
              {formatEuros(trip.budgetTotal)} d'enveloppe
            </p>
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-accent">
            Ouvrir mon planning
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenNearby}
          className="group flex h-full flex-col justify-between rounded-[26px] border border-gold/40 bg-gold-soft/70 p-5 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-gold/70 hover:shadow-md"
        >
          <div>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-gold ring-1 ring-gold/30">
              <LocateFixed className="h-5 w-5" />
            </span>
            <h2 className="mt-3.5 font-serif text-xl font-semibold tracking-tight text-ink">
              Activités aux alentours
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">
              Utilisez votre position pour découvrir les activités connues autour de vous, triées
              par distance et filtrées selon votre budget.
            </p>
            <p className="mt-2 text-[11px] font-semibold text-ink-soft">
              Géolocalisation demandée à l'ouverture · repli sur le centre-ville si refusée.
            </p>
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-accent">
            Me localiser et explorer
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
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
              Consultez vos séjours prévus ou ajoutez plusieurs destinations.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-line bg-white px-2.5 py-1 text-[10px] font-semibold text-muted">
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
                icon={<MapPin className="h-5 w-5 text-white/70" aria-hidden="true" />}
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
            className="flex h-36 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong bg-white/60 px-4 text-center transition-colors hover:border-ink hover:bg-white"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paper text-ink ring-1 ring-line">
              <Plus className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold text-ink">Ajouter une destination</span>
            <span className="text-[10px] text-muted">Plusieurs séjours possibles</span>
          </button>
        </div>
      </section>
    </div>
  );
};
