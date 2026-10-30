import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Bed,
  Ticket,
  Utensils,
  Train,
  Wallet,
  TrendingUp,
  CalendarDays,
  ArrowRight,
  SlidersHorizontal,
  Minus,
  Plus,
  Check,
} from 'lucide-react';
import { Trip } from '../types/travel';
import { getActivityBudget } from '../data/activity-budget';
import { getLocalCurrency, localEquivalent } from '../data/currency';
import { BudgetPlanner } from './BudgetPlanner';
import { CurrencyConverter } from './CurrencyConverter';

interface BudgetViewProps {
  trip: Trip;
  onBudgetChange?: (value: number, adaptActivities?: boolean) => void;
  /** Ajuste la répartition hébergement / restauration du séjour. */
  onBreakdownChange?: (next: { lodging: number; food: number }) => void;
  onEditDates?: () => void;
  onPickBudgetActivity?: () => void;
  userName?: string;
  profileStyle?: string;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  trip,
  onBudgetChange,
  onBreakdownChange,
  onEditDates,
  onPickBudgetActivity,
  userName,
  profileStyle,
}) => {
  const city = trip.destination.split(',')[0];
  const activityBudget = getActivityBudget(trip);
  const localCurrency = getLocalCurrency(trip.destination, trip.country);

  // Aggregate activities from all days
  const allActivities = Object.values(trip.steps).flat().map((s) => s.activity);
  const allTravels = Object.values(trip.steps)
    .flat()
    .map((s) => s.travel)
    .filter(Boolean);

  const totalActivitiesCost = allActivities.reduce((sum, a) => sum + a.price, 0);
  const totalTransportCost = allTravels.reduce((sum, t) => sum + (t?.cost || 0), 0);
  const estimatedLodgingCost = trip.budgetBreakdown?.lodging ?? 310;
  const estimatedFoodCost = trip.budgetBreakdown?.food ?? 210;
  const lodgingLabel = trip.budgetBreakdown?.lodgingLabel ?? 'Hébergement';

  const totalCalculated =
    totalActivitiesCost + totalTransportCost + estimatedLodgingCost + estimatedFoodCost;
  const perTraveler = totalCalculated / trip.travelers;
  const remaining = trip.budgetTotal - totalCalculated;

  // Ajustement manuel des postes fixes de l'enveloppe.
  const [isAdjustingBreakdown, setIsAdjustingBreakdown] = useState(false);
  const [lodgingDraft, setLodgingDraft] = useState(String(estimatedLodgingCost));
  const [foodDraft, setFoodDraft] = useState(String(estimatedFoodCost));

  useEffect(() => {
    setLodgingDraft(String(estimatedLodgingCost));
  }, [estimatedLodgingCost]);

  useEffect(() => {
    setFoodDraft(String(estimatedFoodCost));
  }, [estimatedFoodCost]);

  const draftLodging = Math.max(0, Number(lodgingDraft) || 0);
  const draftFood = Math.max(0, Number(foodDraft) || 0);
  const draftRemaining =
    trip.budgetTotal - draftLodging - draftFood - totalActivitiesCost - totalTransportCost;

  const applyBreakdown = () => {
    onBreakdownChange?.({ lodging: draftLodging, food: draftFood });
    setIsAdjustingBreakdown(false);
  };
  const confirmedCount = allActivities.filter((a) => a.isConfirmed).length;
  const confirmedPercent = allActivities.length
    ? Math.round((confirmedCount / allActivities.length) * 100)
    : 0;

  const categories = [
    {
      title: 'Hébergement',
      amount: estimatedLodgingCost,
      icon: <Bed className="h-4 w-4 text-purple-700" />,
      bg: 'bg-purple-50',
      barColor: 'bg-purple-500',
      note: lodgingLabel,
    },
    {
      title: 'Activités & musées',
      amount: totalActivitiesCost,
      icon: <Ticket className="h-4 w-4 text-blue-700" />,
      bg: 'bg-blue-50',
      barColor: 'bg-blue-500',
      note: `${allActivities.length} visites planifiées`,
    },
    {
      title: 'Restauration & cafés',
      amount: estimatedFoodCost,
      icon: <Utensils className="h-4 w-4 text-amber-700" />,
      bg: 'bg-amber-50',
      barColor: 'bg-amber-500',
      note: 'Trattorias, cafés et marchés',
    },
    {
      title: 'Transports urbains',
      amount: totalTransportCost,
      icon: <Train className="h-4 w-4 text-emerald-700" />,
      bg: 'bg-emerald-50',
      barColor: 'bg-emerald-500',
      note: 'Métro, bus, vélo et marche',
    },
  ].map((category) => ({
    ...category,
    percentage: totalCalculated ? Math.round((category.amount / totalCalculated) * 100) : 0,
  }));

  return (
    <div className="space-y-6">
      {/* Résumé */}
      <div className="rounded-[26px] border border-line bg-white p-5 shadow-xs sm:p-6">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
          Finances du séjour
        </span>
        <h2 className="mt-1.5 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">
          Budget prévisionnel — {city}
        </h2>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px] text-muted">
          <span>
            {trip.dates} · {trip.travelers} voyageurs · estimation tout compris
          </span>
          {onEditDates && (
            <button
              onClick={onEditDates}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-semibold text-ink-soft transition-colors hover:border-accent/40 hover:text-accent"
            >
              <CalendarDays className="h-3 w-3" />
              Dates &amp; voyageurs
            </button>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-line bg-paper p-5">
            <p className="text-[11px] font-semibold text-muted">Dépenses estimées</p>
            <p className="mt-1 font-serif text-3xl font-semibold text-ink">
              {totalCalculated.toFixed(0)} €
            </p>
            {localCurrency.code !== 'EUR' && (
              <p className="mt-0.5 text-[11px] font-medium text-muted">
                ≈ {localEquivalent(totalCalculated, localCurrency.code)} sur place
              </p>
            )}
            <p
              className={`mt-2 text-[11px] font-medium ${
                remaining >= 0 ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {remaining >= 0
                ? `${remaining.toFixed(0)} € de marge sur le budget`
                : `${Math.abs(remaining).toFixed(0)} € au-dessus du budget`}
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-paper p-5">
            <p className="text-[11px] font-semibold text-muted">Coût par voyageur</p>
            <p className="mt-1 font-serif text-3xl font-semibold text-ink">
              {perTraveler.toFixed(0)} €
            </p>
            <p className="mt-2 text-[11px] text-muted">
              Base : {trip.travelers} personnes (chambre partagée)
            </p>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-line bg-paper p-5">
            <div>
              <p className="text-[11px] font-semibold text-muted">Réservations confirmées</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                {confirmedPercent}% des activités
              </p>
            </div>
            <div className="mt-3">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${confirmedPercent}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-muted">
                {confirmedCount} sur {allActivities.length} activités confirmées
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enveloppe ajustable : curseur 0 → 100 000 €, formules adaptées */}
      {onBudgetChange && (
        <BudgetPlanner
          variant="full"
          value={trip.budgetTotal}
          onChange={onBudgetChange}
          spent={totalCalculated}
          spentLabel="Estimation tout compris"
          travelers={trip.travelers}
          days={trip.daysCount}
          city={city}
          userName={userName}
          profileStyle={profileStyle}
        />
      )}

      {/* Conversion en devise locale */}
      <CurrencyConverter
        destination={trip.destination}
        country={trip.country}
        budgetTotal={trip.budgetTotal}
        travelers={trip.travelers}
        totalCalculated={totalCalculated}
      />

      {/* Activités compatibles avec l'enveloppe */}
      {onPickBudgetActivity && (
        <div
          className={`rounded-[26px] border p-5 shadow-xs ${
            activityBudget.isOverBudget
              ? 'border-amber-200 bg-amber-50/70'
              : 'border-emerald-200 bg-emerald-50/60'
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white ${
                  activityBudget.isOverBudget ? 'text-amber-700' : 'text-emerald-700'
                }`}
              >
                <Ticket className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">
                  {activityBudget.isOverBudget
                    ? 'Enveloppe activités dépassée'
                    : 'Activités adaptées à votre budget'}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
                  {activityBudget.isOverBudget
                    ? `Le programme dépasse l'enveloppe de ${Math.abs(
                        activityBudget.remainingTotal
                      ).toFixed(0)} €. Le sélecteur mettra en avant les activités gratuites.`
                    : `Il reste ${activityBudget.remainingPerPerson.toFixed(
                        0
                      )} € par voyageur pour de nouvelles activités (${activityBudget.perDayPerPerson.toFixed(
                        0
                      )} € / pers. / jour).`}
                </p>
                <p className="mt-1 text-[11px] text-muted">
                  {activityBudget.plannedActivities} étapes planifiées · l'enveloppe choisie filtre
                  automatiquement les suggestions.
                </p>
              </div>
            </div>

            <button
              onClick={onPickBudgetActivity}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-ink-soft"
            >
              {activityBudget.isOverBudget ? 'Rééquilibrer les activités' : 'Choisir dans mon budget'}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Répartition */}
      <div className="rounded-[26px] border border-line bg-white p-5 shadow-xs sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-serif text-xl font-semibold text-ink">Répartition par catégorie</h3>
            <p className="mt-0.5 text-[13px] text-muted">Vue d'ensemble de vos postes de dépense.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-paper px-2.5 py-1 text-[11px] font-semibold text-muted">
              <Wallet className="h-3 w-3" />
              {trip.budgetTotal} €
            </span>
            {onBreakdownChange && (
              <button
                type="button"
                onClick={() => setIsAdjustingBreakdown((prev) => !prev)}
                aria-expanded={isAdjustingBreakdown}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors ${
                  isAdjustingBreakdown
                    ? 'border-ink bg-ink text-white'
                    : 'border-line bg-white text-ink-soft hover:border-line-strong hover:text-ink'
                }`}
              >
                <SlidersHorizontal className="h-3 w-3" />
                Ajuster
              </button>
            )}
          </div>
        </div>

        {/* Ajustement des enveloppes hébergement / restauration */}
        {isAdjustingBreakdown && onBreakdownChange && (
          <div className="mb-5 rounded-2xl border border-line bg-paper p-3.5">
            <p className="text-[11px] leading-relaxed text-muted">
              Modifiez les deux postes fixes. La marge restante finance les activités et les
              transports du programme.
            </p>

            <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
              {[
                {
                  id: 'lodging-adjust',
                  label: 'Hébergement (séjour)',
                  value: lodgingDraft,
                  setValue: setLodgingDraft,
                },
                {
                  id: 'food-adjust',
                  label: 'Restauration (séjour)',
                  value: foodDraft,
                  setValue: setFoodDraft,
                },
              ].map((field) => {
                const numeric = Math.max(0, Number(field.value) || 0);
                return (
                  <div key={field.id}>
                    <label
                      htmlFor={field.id}
                      className="text-[10px] font-semibold uppercase tracking-wider text-muted"
                    >
                      {field.label}
                    </label>
                    <div className="mt-1 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          field.setValue(String(Math.max(0, Math.round(numeric / 10) * 10 - 20)))
                        }
                        aria-label={`Réduire ${field.label} de 20 €`}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink-soft hover:border-line-strong hover:text-ink"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <input
                        id={field.id}
                        type="number"
                        min={0}
                        max={trip.budgetTotal}
                        step={10}
                        value={field.value}
                        onChange={(event) => field.setValue(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            applyBreakdown();
                          }
                        }}
                        className="w-full rounded-lg border border-line bg-white px-2 py-1.5 text-right font-serif text-sm font-semibold text-ink focus:border-ink focus:outline-none"
                      />
                      <span className="text-xs font-semibold text-muted">€</span>
                      <button
                        type="button"
                        onClick={() =>
                          field.setValue(String(Math.min(trip.budgetTotal, Math.round(numeric / 10) * 10 + 20)))
                        }
                        aria-label={`Augmenter ${field.label} de 20 €`}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink-soft hover:border-line-strong hover:text-ink"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span
                className={`text-[11px] font-semibold ${
                  draftRemaining < 0 ? 'text-amber-700' : 'text-emerald-700'
                }`}
              >
                {draftRemaining < 0
                  ? `${Math.abs(draftRemaining).toFixed(0)} € de dépassement`
                  : `${draftRemaining.toFixed(0)} € de marge pour les activités`}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsAdjustingBreakdown(false)}
                  className="cursor-pointer rounded-full border border-line bg-white px-3 py-1.5 text-[11px] font-semibold text-ink-soft hover:border-line-strong hover:text-ink"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={applyBreakdown}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-ink px-3.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-ink-soft"
                >
                  <Check className="h-3 w-3" />
                  Appliquer la répartition
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-5">
          {categories.map((cat) => (
            <div key={cat.title} className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className={`rounded-xl p-2 ${cat.bg}`}>{cat.icon}</div>
                  <div className="min-w-0">
                    <span className="block truncate font-semibold text-ink">{cat.title}</span>
                    <span className="block truncate text-[11px] text-muted">{cat.note}</span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className="font-semibold text-ink">{cat.amount.toFixed(0)} €</span>
                  <span className="block text-[11px] text-muted">{cat.percentage}%</span>
                </div>
              </div>

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper-deep">
                <div
                  className={`h-full rounded-full ${cat.barColor} transition-all duration-700`}
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-line bg-paper p-4">
          <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p className="text-xs leading-relaxed text-muted">
            <strong className="font-semibold text-ink-soft">Conseil :</strong> réservez les musées en
            ligne pour éviter les frais de guichet et sécuriser vos créneaux. Les transports en commun
            restent la solution la plus économique pour ce séjour.
          </p>
        </div>
      </div>
    </div>
  );
};
