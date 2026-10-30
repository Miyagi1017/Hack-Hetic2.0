import React, { useEffect, useState } from 'react';

export const BUDGET_MIN = 0;
export const BUDGET_MAX = 100000;

const euro = (value: number) =>
  `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(value))} €`;

interface BudgetPlannerProps {
  /** Enveloppe totale choisie (0 → 100 000 €) */
  value: number;
  /**
   * Met à jour l'enveloppe. `adaptActivities` retire les activités qui ne
   * tiennent plus dans le nouveau budget et recalcule les trajets.
   */
  onChange: (value: number, adaptActivities?: boolean) => void;
  /** Montant déjà engagé / estimé pour le séjour */
  spent: number;
  spentLabel?: string;
  travelers: number;
  days: number;
  city: string;
  userName?: string;
  profileStyle?: string;
  variant?: 'compact' | 'full';
}

interface Preset {
  id: string;
  label: string;
  hint: string;
  rate: number;
}

const PRESETS: Preset[] = [
  { id: 'essentiel', label: 'Essentiel', hint: 'Auberge & street food', rate: 50 },
  { id: 'equilibre', label: 'Équilibré', hint: 'Hôtel 3★ & bistrots', rate: 110 },
  { id: 'confort', label: 'Confort', hint: 'Boutique-hôtel & tables', rate: 210 },
  { id: 'signature', label: 'Signature', hint: 'Palace & gastronomie', rate: 380 },
];

const clamp = (value: number, min = BUDGET_MIN, max = BUDGET_MAX) =>
  Math.max(min, Math.min(max, value));

const snap = (value: number) => Math.round(value / 10) * 10;

/**
 * Enveloppe budgétaire du séjour : curseur 0 → 100 000 €, formules adaptées
 * au nombre de voyageurs, à la durée, à la ville et au profil du voyageur.
 * La valeur est mémorisée par utilisateur (voir App.tsx).
 */
export const BudgetPlanner: React.FC<BudgetPlannerProps> = ({
  value,
  onChange,
  spent,
  spentLabel = 'Engagé sur le programme',
  travelers,
  days,
  city,
  userName,
  profileStyle,
  variant = 'compact',
}) => {
  const isFull = variant === 'full';
  const safeValue = clamp(value);
  const pct = safeValue > 0 ? Math.round((spent / safeValue) * 100) : 100;
  const remaining = safeValue - spent;
  const perDay = safeValue / Math.max(1, days);
  const perPersonPerDay = safeValue / Math.max(1, days * travelers);

  const isOver = remaining < 0;
  const isTight = !isOver && pct >= 85;
  const barColor = isOver ? 'bg-accent' : isTight ? 'bg-amber-500' : 'bg-emerald-600';

  // Saisie manuelle : le budget n'est appliqué qu'à la validation,
  // avec ou sans recalcul des activités.
  const [manualValue, setManualValue] = useState(String(safeValue));

  useEffect(() => {
    setManualValue(String(safeValue));
  }, [safeValue]);

  const applyManualBudget = (adaptActivities: boolean) => {
    const parsed = Number.parseInt(manualValue, 10);
    if (!Number.isFinite(parsed)) {
      setManualValue(String(safeValue));
      return;
    }
    const next = clamp(snap(parsed));
    onChange(next, adaptActivities);
    setManualValue(String(next));
  };

  const manualBudgetNumber = Number.parseInt(manualValue, 10);
  const manualDelta = Number.isFinite(manualBudgetNumber) ? manualBudgetNumber - safeValue : 0;
  const remainingColor = isOver
    ? 'text-accent'
    : isTight
      ? 'text-amber-700'
      : 'text-emerald-700';

  // Les formules s'adaptent à la ville, au profil et au nombre de voyageurs
  const cityFactor = /paris/i.test(city) ? 1.18 : /rome|florence|venise|milan/i.test(city) ? 1 : 1.05;
  const styleFactor = /épicurien|epicurien|confort|premium|luxe/i.test(profileStyle ?? '')
    ? 1.12
    : /routard|petit budget|backpack/i.test(profileStyle ?? '')
      ? 0.85
      : 1;

  const presets = PRESETS.map((preset) => ({
    ...preset,
    amount: clamp(
      snap(preset.rate * cityFactor * styleFactor * Math.max(1, travelers) * Math.max(1, days)),
      100
    ),
  }));

  const nudge = safeValue < 2000 ? 50 : safeValue < 20000 ? 500 : 2500;

  // « Optimiser » : la formule la plus juste qui couvre le programme avec ~10 % de marge
  const optimizeBudget = () => {
    const target = spent > 0 ? spent * 1.1 : presets[0].amount;
    const fitting = presets.find((preset) => preset.amount >= target);
    if (fitting) {
      onChange(fitting.amount);
      return;
    }
    onChange(clamp(Math.ceil(Math.max(target, presets[presets.length - 1].amount) / 50) * 50));
  };

  const matchedPreset = presets.find((preset) => Math.abs(preset.amount - safeValue) < 1);

  // Diagnostic proactif : le rythme quotidien est comparé aux formules
  const rhythm =
    perPersonPerDay < 70
      ? {
          label: 'Rythme routard',
          tip: 'Options gratuites, marchés et transports en commun',
          className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        }
      : perPersonPerDay < 140
        ? {
            label: 'Rythme équilibré',
            tip: 'Visites guidées, bistrots et quelques extras',
            className: 'border-blue-200 bg-blue-50 text-blue-800',
          }
        : perPersonPerDay < 260
          ? {
              label: 'Rythme confort',
              tip: 'Hôtel central, tables choisies et expériences',
              className: 'border-amber-200 bg-amber-50 text-amber-900',
            }
          : {
              label: 'Rythme signature',
              tip: 'Adresses premium, guides privés et gastronomie',
              className: 'border-purple-200 bg-purple-50 text-purple-900',
            };

  return (
    <div
      className={
        isFull
          ? 'rounded-[26px] border border-line bg-white p-5 shadow-xs sm:p-6'
          : 'rounded-[24px] border border-line bg-white p-5 shadow-xs'
      }
    >
      {/* En-tête */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-ink">Enveloppe budget</h4>
          <p className="mt-0.5 text-[11px] text-muted">
            {city} · {travelers} voyageur{travelers > 1 ? 's' : ''} · {days} jours
          </p>
        </div>

        <div className="text-right">
          <span className="font-serif text-xl font-semibold leading-none text-ink">
            {euro(safeValue)}
          </span>
          <span className="mt-1 block text-[11px] text-muted">
            {euro(perPersonPerDay)} / pers. / jour
          </span>
        </div>
      </div>

      {/* Diagnostic proactif du rythme quotidien */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-paper px-3 py-2">
        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${rhythm.className}`}>
          {rhythm.label}
        </span>
        <span className="text-[11px] text-muted">
          {euro(perDay)} / jour · {rhythm.tip}
        </span>
      </div>

      {/* Formules adaptées */}
      <div className="mt-4 grid grid-cols-2 gap-1.5">
        {presets.map((preset) => {
          const isActive = matchedPreset?.id === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(preset.amount)}
              aria-pressed={isActive}
              title={`${preset.label} — ${preset.hint}`}
              className={`rounded-xl border px-2.5 py-2 text-left transition-colors ${
                isActive
                  ? 'border-ink bg-ink text-white'
                  : 'border-line bg-white text-ink hover:border-line-strong hover:bg-paper'
              }`}
            >
              <span className="block text-[11px] font-semibold leading-tight">{preset.label}</span>
              <span
                className={`mt-0.5 block text-[10px] ${isActive ? 'text-white/70' : 'text-muted'}`}
              >
                {euro(preset.amount)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Curseur 0 → 100 000 € */}
      <div className="mt-4">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onChange(clamp(safeValue - nudge))}
            aria-label={`Réduire le budget de ${euro(nudge)}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-white text-sm font-semibold text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
          >
            −
          </button>

          <input
            type="range"
            className="budget-range"
            min={BUDGET_MIN}
            max={BUDGET_MAX}
            step={10}
            value={safeValue}
            onChange={(e) => onChange(Number(e.target.value))}
            aria-label="Budget total du séjour"
            aria-valuetext={euro(safeValue)}
            style={{ ['--fill' as string]: `${(safeValue / BUDGET_MAX) * 100}%` }}
          />

          <button
            type="button"
            onClick={() => onChange(clamp(safeValue + nudge))}
            aria-label={`Augmenter le budget de ${euro(nudge)}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-white text-sm font-semibold text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
          >
            +
          </button>
        </div>

        <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted">
          <span>0 €</span>
          <span>{euro(safeValue)}</span>
          <span>100 000 €</span>
        </div>
      </div>

      {/* Saisie manuelle + recalcul */}
      <div className="mt-3 rounded-xl border border-line bg-paper px-3 py-2.5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <label
              htmlFor="budget-manual"
              className="text-[10px] font-semibold uppercase tracking-wider text-muted"
            >
              Modifier manuellement
            </label>
            <div className="mt-1 flex items-center gap-1">
              <input
                id="budget-manual"
                type="number"
                inputMode="numeric"
                min={BUDGET_MIN}
                max={BUDGET_MAX}
                step={50}
                value={manualValue}
                onChange={(event) => setManualValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    applyManualBudget(true);
                  }
                }}
                aria-label="Budget total saisi manuellement"
                className="w-28 rounded-lg border border-line bg-white px-2 py-1.5 text-right font-serif text-base font-semibold text-ink focus:border-ink focus:outline-none"
              />
              <span className="text-sm font-semibold text-muted">€</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              onClick={() => applyManualBudget(true)}
              className="cursor-pointer rounded-full bg-ink px-3.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-ink-soft"
            >
              Valider et recalculer
            </button>
            <button
              type="button"
              onClick={() => applyManualBudget(false)}
              className="cursor-pointer text-[10px] font-semibold text-muted underline underline-offset-2 hover:text-ink"
            >
              Appliquer sans recalcul
            </button>
          </div>
        </div>

        <p className="mt-1.5 text-[10px] leading-relaxed text-muted">
          {manualDelta === 0
            ? 'Le programme est déjà calibré sur cette enveloppe.'
            : manualDelta > 0
              ? `+${euro(manualDelta)} : davantage de marge pour les activités.`
              : `${euro(Math.abs(manualDelta))} de moins : le recalcul retirera les activités qui ne tiennent plus.`}
        </p>
      </div>

      {/* Consommation */}
      <div className="mt-4 border-t border-line pt-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted">{spentLabel}</span>
          <span className="font-semibold text-ink">
            {euro(spent)} <span className="font-normal text-muted">/ {euro(safeValue)}</span>
          </span>
        </div>

        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-paper-deep">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span className="text-muted">{pct}% de l'enveloppe</span>
          <span className={`font-semibold ${remainingColor}`}>
            {isOver ? `${euro(Math.abs(remaining))} de dépassement` : `${euro(remaining)} de marge`}
          </span>
        </div>

        <p className="mt-1 text-[11px] leading-relaxed text-muted">
          {isOver
            ? `Il manque ${euro(Math.abs(remaining))} : augmentez l'enveloppe ou choisissez des étapes moins chères.`
            : `${euro(perDay)} par jour pour ${travelers} personne${travelers > 1 ? 's' : ''}.`}
        </p>
      </div>

      {/* Optimisation + mémoire utilisateur */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={optimizeBudget}
          className="cursor-pointer rounded-full bg-ink px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-ink-soft"
        >
          Optimiser l'enveloppe
        </button>

        <span className="text-[10px] text-muted">
          {matchedPreset ? `Formule ${matchedPreset.label}` : 'Montant libre'}
        </span>
      </div>

      {userName && (
        <p className="mt-2 text-[10px] text-muted">
          Réglage mémorisé pour {userName} sur cet appareil.
        </p>
      )}
    </div>
  );
};
