import React, { useEffect, useState } from 'react';
import { AlertTriangle, CalendarClock, Check, Clock, X } from 'lucide-react';
import { Trip } from '../types/travel';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  initialDay?: number;
  onApply: (day: number, updates: Array<{ index: number; time: string }>) => void;
}

/**
 * Édition groupée des horaires d'une journée : on ajuste chaque étape,
 * puis on valide pour réordonner le programme et recalculer les trajets.
 */
export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  trip,
  initialDay = 1,
  onApply,
}) => {
  const [activeDay, setActiveDay] = useState(initialDay);
  const [drafts, setDrafts] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    setActiveDay(initialDay);
    setDrafts({});
  }, [isOpen, initialDay]);

  if (!isOpen) return null;

  const steps = trip.steps[activeDay] ?? [];
  const timeFor = (index: number) => drafts[index] ?? steps[index]?.activity.time ?? '09:00';
  const times = steps.map((_, index) => timeFor(index));
  const duplicateTimes = times.filter((time, index) => times.indexOf(time) !== index);

  const handleApply = () => {
    onApply(
      activeDay,
      steps.map((_, index) => ({ index, time: timeFor(index) }))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-0 backdrop-blur-xs animate-in fade-in duration-200 sm:items-center sm:p-4">
      <div className="flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-line bg-white shadow-2xl sm:rounded-[26px]">
        {/* En-tête */}
        <div className="flex items-start justify-between gap-3 border-b border-line bg-white/95 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-ink text-amber-300">
              <CalendarClock className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                {trip.destination}
              </span>
              <h3 className="font-serif text-xl font-semibold leading-tight text-ink">
                Modifier les horaires
              </h3>
              <p className="mt-0.5 text-[11px] text-muted">
                Ajustez l'heure de chaque étape, puis validez : le programme est réordonné et les
                trajets sont recalculés.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer la modification des horaires"
            className="cursor-pointer rounded-full p-2 text-muted transition-colors hover:bg-paper hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Jours */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-paper/60 px-5 py-3">
          {Array.from({ length: trip.daysCount }, (_, i) => i + 1).map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => {
                setActiveDay(day);
                setDrafts({});
              }}
              aria-pressed={activeDay === day}
              className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeDay === day
                  ? 'bg-ink text-white'
                  : 'border border-line bg-white text-ink-soft hover:border-line-strong hover:text-ink'
              }`}
            >
              J{day}
            </button>
          ))}
          <span className="ml-auto text-[10px] font-medium text-muted">
            {steps.length} étape{steps.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Étapes */}
        <div className="space-y-2 overflow-y-auto p-5">
          {steps.length === 0 && (
            <p className="rounded-xl border border-dashed border-line bg-paper px-3 py-6 text-center text-xs text-muted">
              Aucune activité ce jour : ajoutez une étape depuis le planificateur.
            </p>
          )}

          {steps.map((step, index) => {
            const time = timeFor(index);
            const duplicate = times.filter((value) => value === time).length > 1;
            return (
              <div
                key={`${step.activity.id}-${index}`}
                className={`flex items-center gap-3 rounded-xl border p-2.5 ${
                  duplicate ? 'border-amber-200 bg-amber-50/70' : 'border-line bg-white'
                }`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper text-[10px] font-bold text-ink">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-xs font-semibold text-ink">{step.activity.name}</p>
                  <p className="mt-0.5 text-[10px] text-muted">
                    {step.activity.category} · {step.activity.duration}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Clock className="h-3 w-3 text-muted" />
                  <input
                    type="time"
                    value={time}
                    onChange={(event) =>
                      setDrafts((prev) => ({ ...prev, [index]: event.target.value }))
                    }
                    aria-label={`Horaire de ${step.activity.name}`}
                    className="rounded-lg border border-line bg-paper px-2 py-1 text-sm font-semibold text-ink focus:border-ink focus:outline-none"
                  />
                </div>
              </div>
            );
          })}

          {duplicateTimes.length > 0 && (
            <p className="flex items-start gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-900">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              Plusieurs activités partagent le même horaire. Vous pouvez valider, mais vérifiez
              qu'elles restent compatibles.
            </p>
          )}
        </div>

        {/* Pied */}
        <div className="flex items-center justify-end gap-2 border-t border-line bg-white p-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full border border-line bg-white px-4 py-2.5 text-xs font-semibold text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={steps.length === 0}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-ink-soft disabled:cursor-default disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
            Valider et recalculer
          </button>
        </div>
      </div>
    </div>
  );
};
