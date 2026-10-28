import React from 'react';
import { Sun, Zap, Plus, AlertTriangle, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { Trip } from '../types/travel';
import { BudgetPlanner } from './BudgetPlanner';

interface ContextPanelProps {
  trip: Trip;
  currentDay: number;
  onOptimizeTrip: () => void;
  onAddStep: () => void;
  onOpenChat: () => void;
  onOpenRestrictions: () => void;
  onBudgetChange: (value: number) => void;
  hasConflict: boolean;
  totalCost: number;
  userName?: string;
  profileStyle?: string;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({
  trip,
  currentDay,
  onOptimizeTrip,
  onAddStep,
  onOpenChat,
  onOpenRestrictions,
  onBudgetChange,
  hasConflict,
  totalCost,
  userName,
  profileStyle,
}) => {
  const city = trip.destination.split(',')[0];
  const activeRestrictions = trip.restrictions.filter((r) => r.status === 'obligatoire');
  const weather = trip.weather;

  return (
    <div className="space-y-4">
      {/* Séjour en cours */}
      <div className="rounded-[24px] border border-line bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
            Votre séjour
          </span>
          <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-semibold text-muted">
            {trip.duration}
          </span>
        </div>
        <p className="mt-2 font-serif text-base font-semibold text-ink">{trip.dates}</p>
        <div className="mt-3 flex gap-1.5" aria-hidden="true">
          {Array.from({ length: trip.daysCount }, (_, i) => i + 1).map((day) => (
            <span
              key={day}
              className={`h-1.5 flex-1 rounded-full ${
                day <= currentDay ? 'bg-ink' : 'bg-paper-deep'
              }`}
            />
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted">
          Jour {currentDay} sur {trip.daysCount} · {trip.travelers} voyageurs
        </p>
      </div>

      {/* Météo */}
      <div className="rounded-[24px] border border-line bg-white p-5 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold-soft text-gold">
              <Sun className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                Météo à {city}
              </p>
              <h4 className="mt-0.5 text-lg font-semibold leading-tight text-ink">
                {weather ? `${weather.temperature}°C · ${weather.condition}` : '22°C · Ensoleillé'}
              </h4>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
            {weather?.advice ?? 'Idéal pour marcher'}
          </span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          {weather?.summary ??
            'Ciel dégagé toute la journée. Prévoyez des lunettes de soleil et une gourde pour les fontaines.'}
        </p>
      </div>

      {/* Budget & enveloppe ajustable (curseur 0 → 100 000 €) */}
      <BudgetPlanner
        value={trip.budgetTotal}
        onChange={onBudgetChange}
        spent={totalCost}
        travelers={trip.travelers}
        days={trip.daysCount}
        city={city}
        userName={userName}
        profileStyle={profileStyle}
      />

      {/* Actions */}
      <div className="space-y-2.5">
        <button
          onClick={onOptimizeTrip}
          className={`flex w-full items-center justify-center gap-2.5 rounded-2xl py-3.5 px-5 text-sm font-semibold shadow-sm ${
            hasConflict
              ? 'bg-amber-500 text-white hover:bg-amber-600 animate-soft-pulse'
              : 'bg-ink text-white hover:bg-ink-soft'
          }`}
        >
          {hasConflict ? <AlertTriangle className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
          <span>{hasConflict ? 'Résoudre les conflits' : 'Optimiser les trajets (IA)'}</span>
        </button>

        <button
          onClick={onAddStep}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-line bg-white py-3 px-5 text-sm font-semibold text-ink-soft hover:border-line-strong hover:bg-paper"
        >
          <Plus className="h-4 w-4" />
          <span>Ajouter une étape</span>
        </button>
      </div>

      {/* Restrictions */}
      <button
        onClick={onOpenRestrictions}
        className="group flex w-full items-center justify-between rounded-[24px] border border-line bg-white p-4 text-left shadow-xs hover:border-line-strong"
      >
        <span className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-xs font-semibold text-ink">Restrictions actives</span>
            <span className="mt-0.5 block text-[11px] text-muted">
              {activeRestrictions.length} règles obligatoires à {city}
            </span>
          </span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
      </button>

      {/* Concierge */}
      <button
        onClick={onOpenChat}
        className="relative w-full overflow-hidden rounded-[24px] bg-[radial-gradient(125%_125%_at_100%_0%,#3a3428_0%,#1d1b16_58%)] p-5 text-left text-white shadow-lg"
      >
        <span className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-amber-400/10 blur-2xl" />
        <span className="relative block">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-amber-100 ring-1 ring-white/10">
            <Sparkles className="h-3 w-3 text-amber-300" />
            Concierge local
          </span>
          <span className="mt-2.5 block font-serif text-base font-semibold leading-snug">
            Une question sur {city} ?
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-neutral-300">
            Une table secrète, un itinéraire vélo ou le meilleur horaire sans file d'attente.
          </span>
          <span className="mt-3 flex items-center gap-1 text-xs font-semibold text-white">
            Ouvrir le chat <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </span>
      </button>
    </div>
  );
};
