import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  Check,
  Coins,
  Minus,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { Trip } from '../types/travel';
import { clampDaysCount, clampTravelers, formatTripDates, todayIso } from '../data/trip-dates';
import { BUDGET_MAX } from './BudgetPlanner';

export interface GlobalEditPayload {
  startDate: string;
  daysCount: number;
  travelers: number;
  budgetTotal: number;
  lodging: number;
  food: number;
  adaptActivities: boolean;
}

interface GlobalEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  onApply: (payload: GlobalEditPayload) => void;
}

const euro = (value: number) =>
  `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(value))} €`;

const clampBudget = (value: number) => Math.max(0, Math.min(BUDGET_MAX, Math.round(value / 10) * 10));

export const GlobalEditModal: React.FC<GlobalEditModalProps> = ({
  isOpen,
  onClose,
  trip,
  onApply,
}) => {
  const [startDate, setStartDate] = useState(trip.startDate ?? todayIso());
  const [daysCount, setDaysCount] = useState(clampDaysCount(trip.daysCount));
  const [travelers, setTravelers] = useState(clampTravelers(trip.travelers));
  const [budget, setBudget] = useState(trip.budgetTotal);
  const [lodging, setLodging] = useState(trip.budgetBreakdown?.lodging ?? 310);
  const [food, setFood] = useState(trip.budgetBreakdown?.food ?? 210);
  const [adaptActivities, setAdaptActivities] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setStartDate(trip.startDate ?? todayIso());
    setDaysCount(clampDaysCount(trip.daysCount));
    setTravelers(clampTravelers(trip.travelers));
    setBudget(trip.budgetTotal);
    setLodging(trip.budgetBreakdown?.lodging ?? 310);
    setFood(trip.budgetBreakdown?.food ?? 210);
    setAdaptActivities(true);
  }, [isOpen, trip]);

  const activitiesTotal = useMemo(
    () =>
      Object.values(trip.steps)
        .flat()
        .reduce((sum, step) => sum + Math.max(0, step.activity.price || 0), 0),
    [trip.steps]
  );
  const transportTotal = useMemo(
    () =>
      Object.values(trip.steps)
        .flat()
        .reduce((sum, step) => sum + (step.travel?.cost || 0), 0),
    [trip.steps]
  );

  if (!isOpen) return null;

  const safeDays = clampDaysCount(daysCount);
  const safeTravelers = clampTravelers(travelers);
  const datesLabel = formatTripDates(startDate, safeDays);
  const perPersonPerDay = budget / Math.max(1, safeDays * safeTravelers);
  const margin = budget - lodging - food - activitiesTotal - transportTotal;
  const sliderMax = Math.max(
    2000,
    Math.ceil((Math.max(budget, trip.budgetTotal, lodging + food + 500) * 1.5) / 500) * 500
  );

  const canApply = Boolean(startDate) && safeDays >= 1 && safeTravelers >= 1;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-0 backdrop-blur-xs animate-in fade-in duration-200 sm:items-center sm:p-4">
      <div className="flex max-h-[94vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-line bg-white shadow-2xl sm:rounded-[26px]">
        {/* En-tête */}
        <div className="flex items-start justify-between gap-3 border-b border-line p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-ink text-amber-300">
              <SlidersHorizontal className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                {trip.destination}
              </span>
              <h3 className="font-serif text-xl font-semibold leading-tight text-ink">
                Modifier tous les choix
              </h3>
              <p className="mt-0.5 text-[11px] text-muted">
                Dates, voyageurs, budget et répartition : tout est recalculé en une validation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer la modification globale"
            className="cursor-pointer rounded-full p-2 text-muted transition-colors hover:bg-paper hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-5">
          {/* Séjour */}
          <section className="rounded-2xl border border-line bg-paper p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Séjour</p>

            <label
              htmlFor="global-start-date"
              className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft"
            >
              <CalendarDays className="h-3.5 w-3.5 text-accent" />
              Date de départ
            </label>
            <input
              id="global-start-date"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
            />
            <p className="mt-1 text-[10px] text-muted">
              Nouveau programme : {datesLabel || '—'} · {Math.max(1, safeDays - 1)} nuit
              {safeDays - 1 > 1 ? 's' : ''}
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Durée
                </span>
                <div className="mt-1 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDaysCount(clampDaysCount(safeDays - 1))}
                    aria-label="Réduire la durée"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-white text-ink-soft hover:border-line-strong hover:text-ink"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={21}
                    value={daysCount}
                    onChange={(event) => setDaysCount(Number(event.target.value) || 1)}
                    aria-label="Durée en jours"
                    className="w-full rounded-lg border border-line bg-white px-2 py-1.5 text-center text-sm font-semibold text-ink focus:border-ink focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setDaysCount(clampDaysCount(safeDays + 1))}
                    aria-label="Augmenter la durée"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-white text-ink-soft hover:border-line-strong hover:text-ink"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Voyageurs
                </span>
                <div className="mt-1 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setTravelers(clampTravelers(safeTravelers - 1))}
                    aria-label="Retirer un voyageur"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-white text-ink-soft hover:border-line-strong hover:text-ink"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={travelers}
                    onChange={(event) => setTravelers(Number(event.target.value) || 1)}
                    aria-label="Nombre de voyageurs"
                    className="w-full rounded-lg border border-line bg-white px-2 py-1.5 text-center text-sm font-semibold text-ink focus:border-ink focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setTravelers(clampTravelers(safeTravelers + 1))}
                    aria-label="Ajouter un voyageur"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-white text-ink-soft hover:border-line-strong hover:text-ink"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Budget */}
          <section className="rounded-2xl border border-line bg-paper p-3.5">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                <Wallet className="h-3.5 w-3.5 text-gold" />
                Enveloppe budget
              </p>
              <span className="font-serif text-base font-semibold text-ink">{euro(budget)}</span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <input
                type="range"
                className="budget-range w-full"
                min={0}
                max={sliderMax}
                step={10}
                value={Math.min(budget, sliderMax)}
                onChange={(event) => setBudget(clampBudget(Number(event.target.value)))}
                aria-label="Budget total ajustable"
                style={{ ['--fill' as string]: `${(Math.min(budget, sliderMax) / sliderMax) * 100}%` }}
              />
              <div className="flex shrink-0 items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={BUDGET_MAX}
                  step={50}
                  value={budget}
                  onChange={(event) => setBudget(clampBudget(Number(event.target.value) || 0))}
                  aria-label="Budget total saisi"
                  className="w-24 rounded-lg border border-line bg-white px-2 py-1.5 text-right text-sm font-semibold text-ink focus:border-ink focus:outline-none"
                />
                <span className="text-xs font-semibold text-muted">€</span>
              </div>
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-2.5">
              <div>
                <label
                  htmlFor="global-lodging"
                  className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted"
                >
                  <Coins className="h-3 w-3" />
                  Hébergement
                </label>
                <input
                  id="global-lodging"
                  type="number"
                  min={0}
                  max={budget}
                  step={10}
                  value={lodging}
                  onChange={(event) => setLodging(Math.max(0, Number(event.target.value) || 0))}
                  className="mt-1 w-full rounded-lg border border-line bg-white px-2 py-1.5 text-right text-sm font-semibold text-ink focus:border-ink focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="global-food"
                  className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted"
                >
                  <Coins className="h-3 w-3" />
                  Restauration
                </label>
                <input
                  id="global-food"
                  type="number"
                  min={0}
                  max={budget}
                  step={10}
                  value={food}
                  onChange={(event) => setFood(Math.max(0, Number(event.target.value) || 0))}
                  className="mt-1 w-full rounded-lg border border-line bg-white px-2 py-1.5 text-right text-sm font-semibold text-ink focus:border-ink focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-muted">
                {euro(perPersonPerDay)} / pers. / jour · {activitiesTotal > 0 ? `${euro(activitiesTotal)} d'activités` : 'aucune activité payante'}
              </span>
              <span className={`font-semibold ${margin < 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {margin < 0 ? `${euro(Math.abs(margin))} de dépassement` : `${euro(margin)} de marge`}
              </span>
            </div>
          </section>

          {/* Recalcul */}
          <section className="rounded-2xl border border-line bg-white p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                  <RefreshCw className="h-4 w-4 text-accent" />
                  Tout recalculer
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
                  Réordonne les journées, recalcule les trajets et retire les activités qui ne
                  tiennent plus dans la nouvelle enveloppe.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={adaptActivities}
                aria-label="Adapter les activités au budget"
                onClick={() => setAdaptActivities((prev) => !prev)}
                className={`relative mt-0.5 h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
                  adaptActivities ? 'bg-emerald-600' : 'bg-line-strong'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    adaptActivities ? 'left-[1.375rem]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {adaptActivities && margin < 0 && (
              <p className="mt-2 flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[10px] leading-relaxed text-amber-900">
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                L'enveloppe est dépassée : les activités les plus chères seront retirées du programme.
              </p>
            )}
          </section>
        </div>

        {/* Pied */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-white p-4">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted">
            <Users className="h-3.5 w-3.5" />
            {safeDays} jour{safeDays > 1 ? 's' : ''} · {safeTravelers} voyageur
            {safeTravelers > 1 ? 's' : ''} · {euro(budget)}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-full border border-line bg-white px-4 py-2.5 text-xs font-semibold text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() =>
                onApply({
                  startDate,
                  daysCount: safeDays,
                  travelers: safeTravelers,
                  budgetTotal: clampBudget(budget),
                  lodging: Math.max(0, Math.round(lodging)),
                  food: Math.max(0, Math.round(food)),
                  adaptActivities,
                })
              }
              disabled={!canApply}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-ink-soft disabled:cursor-default disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              Valider et tout recalculer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
