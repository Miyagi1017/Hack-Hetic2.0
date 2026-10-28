import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  CalendarDays,
  Minus,
  Plus,
  Wallet,
  Sparkles,
  Check,
  ArrowRight,
  AlertTriangle,
  Moon,
  Users,
} from 'lucide-react';
import { Trip } from '../types/travel';
import { BUDGET_MAX } from './BudgetPlanner';
import {
  addDaysIso,
  clampTravelers,
  formatDateRangeLong,
  formatTripDates,
  MAX_TRAVELERS,
  MIN_TRAVELERS,
  parseIsoDate,
  todayIso,
} from '../data/trip-dates';

export interface DateUpdatePayload {
  startDate: string;
  daysCount: number;
  travelers: number;
  /** true : l'enveloppe suit le rythme quotidien actuel. */
  adaptBudget: boolean;
}

interface DateRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  onConfirm: (payload: DateUpdatePayload) => void;
}

const DURATION_PRESETS = [2, 3, 4, 5, 7, 10];
const TRAVELER_PRESETS = [1, 2, 3, 4, 5, 6];
const MIN_DAYS = 1;
const MAX_DAYS = 21;

const euro = (value: number) =>
  `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(value))} €`;

const clampDays = (value: number) => Math.max(MIN_DAYS, Math.min(MAX_DAYS, Math.round(value)));

const budgetMood = (perPersonPerDay: number) => {
  if (perPersonPerDay < 70) {
    return {
      label: 'Rythme serré',
      tip: 'Misez sur les options gratuites et les festivités du comparateur.',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    };
  }
  if (perPersonPerDay < 140) {
    return {
      label: 'Rythme équilibré',
      tip: 'Bon compromis entre visites guidées, bonnes tables et trajets courts.',
      className: 'border-blue-200 bg-blue-50 text-blue-900',
    };
  }
  if (perPersonPerDay < 260) {
    return {
      label: 'Rythme confort',
      tip: 'Quelques expériences signature et un hôtel central sont finançables.',
      className: 'border-amber-200 bg-amber-50 text-amber-900',
    };
  }
  return {
    label: 'Rythme signature',
    tip: 'Guides privés, tables gastronomiques et adresses premium envisageables.',
    className: 'border-purple-200 bg-purple-50 text-purple-900',
  };
};

/**
 * Modale de modification des dates : date de départ, durée, et adaptation
 * proactive de l'enveloppe budget au rythme quotidien du voyageur.
 */
export const DateRangeModal: React.FC<DateRangeModalProps> = ({
  isOpen,
  onClose,
  trip,
  onConfirm,
}) => {
  const [startDate, setStartDate] = useState(trip.startDate ?? todayIso());
  const [daysCount, setDaysCount] = useState(clampDays(trip.daysCount));
  const [travelers, setTravelers] = useState(clampTravelers(trip.travelers));
  const [adaptBudget, setAdaptBudget] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setStartDate(trip.startDate ?? todayIso());
    setDaysCount(clampDays(trip.daysCount));
    setTravelers(clampTravelers(trip.travelers));
    setAdaptBudget(true);
  }, [isOpen, trip.startDate, trip.daysCount, trip.travelers]);

  const preview = useMemo(() => {
    const safeDays = clampDays(daysCount);
    const safeTravelers = clampTravelers(travelers);
    const currentDays = Math.max(1, trip.daysCount);
    const currentTravelers = Math.max(1, trip.travelers);
    // Rythme actuel exprimé par personne et par jour, pour rester juste
    // quand la durée ou le nombre de voyageurs change.
    const currentRate = trip.budgetTotal > 0 ? trip.budgetTotal / (currentDays * currentTravelers) : 0;
    const fallbackRate = 110;
    const rate = currentRate > 0 ? currentRate : fallbackRate;
    const scaled = Math.round((rate * safeDays * safeTravelers) / 10) * 10;
    const nextBudget = adaptBudget
      ? Math.max(0, Math.min(BUDGET_MAX, scaled))
      : Math.max(0, Math.min(BUDGET_MAX, trip.budgetTotal));

    return {
      safeDays,
      safeTravelers,
      nights: Math.max(0, safeDays - 1),
      rate: adaptBudget
        ? rate * safeTravelers
        : trip.budgetTotal / safeDays,
      nextBudget,
      delta: nextBudget - trip.budgetTotal,
      perPersonPerDay: nextBudget / Math.max(1, safeDays * safeTravelers),
      endDate: addDaysIso(startDate, safeDays - 1),
      datesLabel: formatTripDates(startDate, safeDays),
      rangeLabel: formatDateRangeLong(startDate, safeDays),
    };
  }, [startDate, daysCount, travelers, adaptBudget, trip.budgetTotal, trip.daysCount, trip.travelers]);

  if (!isOpen) return null;

  const mood = budgetMood(preview.perPersonPerDay);
  const startInPast =
    Number.isFinite(parseIsoDate(startDate).getTime()) && startDate < todayIso();

  const handleConfirm = () => {
    if (!startDate) return;
    onConfirm({
      startDate,
      daysCount: preview.safeDays,
      travelers: preview.safeTravelers,
      adaptBudget,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-0 backdrop-blur-xs animate-in fade-in duration-200 sm:items-center sm:p-4">
      <div className="flex max-h-[94vh] w-full max-w-xl flex-col overflow-y-auto rounded-t-3xl border border-line bg-white shadow-2xl sm:rounded-[26px]">
        {/* En-tête */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-line bg-white/95 p-5 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-ink text-amber-300">
              <CalendarDays className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                Itinéraire · {trip.destination}
              </span>
              <h2 className="font-serif text-xl font-semibold leading-tight text-ink">
                Dates &amp; voyageurs
              </h2>
              <p className="mt-0.5 text-[11px] text-muted">
                Le budget s'ajuste automatiquement à la durée et au nombre de voyageurs.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer la modification des dates"
            className="cursor-pointer rounded-full p-2 text-muted transition-colors hover:bg-paper hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 p-5 sm:p-6">
          {/* Date de départ & durée */}
          <div className="grid gap-4 sm:grid-cols-[1fr_1.15fr]">
            <div>
              <label
                htmlFor="trip-start-date"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted"
              >
                Date de départ
              </label>
              <input
                id="trip-start-date"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm font-semibold text-ink focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/5"
              />
              <p className="mt-1.5 text-[11px] text-muted">
                Retour prévu le{' '}
                <span className="font-semibold text-ink-soft">
                  {formatDateRangeLong(preview.endDate, 1).replace(/^./, (c) => c.toLowerCase())}
                </span>
              </p>
            </div>

            <div>
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted">
                Durée du séjour
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDaysCount((prev) => clampDays(prev - 1))}
                  aria-label="Retirer un jour"
                  disabled={daysCount <= MIN_DAYS}
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line bg-white text-ink-soft transition-colors hover:border-line-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <div className="flex-1 rounded-xl border border-line bg-paper px-3 py-2 text-center">
                  <span className="font-serif text-lg font-semibold text-ink">{preview.safeDays}</span>
                  <span className="ml-1 text-[11px] text-muted">
                    jour{preview.safeDays > 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDaysCount((prev) => clampDays(prev + 1))}
                  aria-label="Ajouter un jour"
                  disabled={daysCount >= MAX_DAYS}
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line bg-white text-ink-soft transition-colors hover:border-line-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {DURATION_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDaysCount(preset)}
                    aria-pressed={preview.safeDays === preset}
                    className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                      preview.safeDays === preset
                        ? 'border-ink bg-ink text-white'
                        : 'border-line bg-white text-ink-soft hover:border-line-strong'
                    }`}
                  >
                    {preset} j
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Nombre de voyageurs */}
          <div className="rounded-2xl border border-line bg-paper p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-ink ring-1 ring-line">
                  <Users className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">Voyageurs</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
                    Chambres partagées, entrées et repas recalculés pour{' '}
                    {preview.safeTravelers} personne{preview.safeTravelers > 1 ? 's' : ''}.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTravelers((prev) => clampTravelers(prev - 1))}
                  aria-label="Retirer un voyageur"
                  disabled={travelers <= MIN_TRAVELERS}
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line bg-white text-ink-soft transition-colors hover:border-line-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <div className="min-w-[72px] rounded-xl border border-line bg-white px-3 py-1.5 text-center">
                  <span className="font-serif text-lg font-semibold text-ink">
                    {preview.safeTravelers}
                  </span>
                  <span className="ml-1 text-[11px] text-muted">
                    pers.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setTravelers((prev) => clampTravelers(prev + 1))}
                  aria-label="Ajouter un voyageur"
                  disabled={travelers >= MAX_TRAVELERS}
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line bg-white text-ink-soft transition-colors hover:border-line-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {TRAVELER_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTravelers(preset)}
                  aria-pressed={preview.safeTravelers === preset}
                  className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    preview.safeTravelers === preset
                      ? 'border-ink bg-ink text-white'
                      : 'border-line bg-white text-ink-soft hover:border-line-strong'
                  }`}
                >
                  {preset} pers.
                </button>
              ))}
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="rounded-2xl border border-line bg-gradient-to-br from-[#fffdf9] via-white to-[#fbf6ec] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
              Nouveau programme
            </p>
            <p className="mt-1 font-serif text-xl font-semibold text-ink">{preview.datesLabel}</p>
            <p className="mt-0.5 text-xs text-muted">{preview.rangeLabel}</p>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
                <CalendarDays className="h-3 w-3 text-accent" />
                {preview.safeDays} jour{preview.safeDays > 1 ? 's' : ''}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
                <Moon className="h-3 w-3 text-gold" />
                {preview.nights} nuit{preview.nights > 1 ? 's' : ''}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
                {preview.safeTravelers} voyageur{preview.safeTravelers > 1 ? 's' : ''}
              </span>
            </div>
            {startInPast && (
              <p className="mt-2.5 flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] leading-relaxed text-amber-900">
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                Cette date est déjà passée : vérifiez que les horaires restent cohérents.
              </p>
            )}
          </div>

          {/* Adaptation proactive du budget */}
          <div className="rounded-2xl border border-line bg-paper p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gold-soft text-gold">
                  <Wallet className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">Adapter l'enveloppe budget</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
                    {trip.budgetTotal > 0
                      ? `Rythme actuel : ${euro(
                          trip.budgetTotal / Math.max(1, trip.daysCount)
                        )} / jour, soit ${euro(
                          trip.budgetTotal / Math.max(1, trip.daysCount * trip.travelers)
                        )} / pers. / jour.`
                      : 'Aucune enveloppe définie : nous proposons un rythme de 110 € / pers. / jour.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={adaptBudget}
                aria-label="Adapter automatiquement le budget à la durée et au nombre de voyageurs"
                onClick={() => setAdaptBudget((prev) => !prev)}
                className={`relative mt-0.5 h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
                  adaptBudget ? 'bg-emerald-600' : 'bg-line-strong'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    adaptBudget ? 'left-[1.375rem]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="mt-3 space-y-2 rounded-xl border border-line bg-white p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">Enveloppe actuelle</span>
                <span className="font-semibold text-ink">{euro(trip.budgetTotal)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">
                  {adaptBudget ? 'Nouvelle enveloppe recalculée' : 'Enveloppe conservée'}
                </span>
                <span className="font-serif text-base font-semibold text-ink">
                  {euro(preview.nextBudget)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-line pt-2 text-[11px]">
                <span className="text-muted">Rythme proposé</span>
                <span className="font-semibold text-ink-soft">
                  {euro(preview.rate)} / jour · {euro(preview.perPersonPerDay)} / pers. / jour
                </span>
              </div>
              {adaptBudget && preview.delta !== 0 && (
                <p
                  className={`flex items-center gap-1.5 pt-1 text-[11px] font-semibold ${
                    preview.delta > 0 ? 'text-amber-800' : 'text-emerald-800'
                  }`}
                >
                  <ArrowRight className="h-3 w-3" />
                  {preview.delta > 0 ? '+' : ''}
                  {euro(preview.delta)} par rapport à l'enveloppe actuelle
                </p>
              )}
            </div>

            <div className={`mt-3 flex items-start gap-2 rounded-xl border px-3 py-2 text-[11px] leading-relaxed ${mood.className}`}>
              <Sparkles className="mt-0.5 h-3 w-3 shrink-0" />
              <span>
                <strong className="font-semibold">{mood.label}.</strong> {mood.tip}
              </span>
            </div>
          </div>

          <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted">
            <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
            Les journées ajoutées reprennent le programme de la dernière journée (à personnaliser
            ensuite). Les réservations déjà confirmées sont conservées.
          </p>
        </div>

        {/* Pied */}
        <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-line bg-white p-5">
          <div className="min-w-0">
            <span className="block truncate text-[11px] text-muted">
              {preview.safeDays} jours · {preview.safeTravelers} voyageur
              {preview.safeTravelers > 1 ? 's' : ''} · enveloppe {euro(preview.nextBudget)}
            </span>
            <span className="text-[11px] font-semibold text-ink-soft">
              {adaptBudget ? 'Budget ajusté automatiquement' : 'Budget inchangé'}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={onClose}
              className="cursor-pointer rounded-2xl border border-line bg-white px-4 py-2.5 text-xs font-semibold text-ink transition-colors hover:bg-paper"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={!startDate}
              className="flex cursor-pointer items-center gap-1.5 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CalendarDays className="h-4 w-4 text-amber-300" />
              Mettre à jour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
