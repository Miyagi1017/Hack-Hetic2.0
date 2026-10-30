import React, { useEffect, useId, useRef, useState } from 'react';
import { describeTime, normalizeTime, TIME_SUGGESTIONS } from '../data/time';

interface TimeFieldProps {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  /** Autorise un champ vide (borne ouverte d'une tranche horaire). */
  allowEmpty?: boolean;
  /** Version compacte pour les barres de filtres et les cartes. */
  compact?: boolean;
  /** Version grande pour les fenêtres de choix d'horaire. */
  large?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * Champ horaire sans limite : menu de suggestions (datalist) mais saisie
 * totalement libre, y compris après minuit (24:00 à 29:59).
 */
export const TimeField: React.FC<TimeFieldProps> = ({
  value,
  onChange,
  ariaLabel,
  allowEmpty = false,
  compact = false,
  large = false,
  placeholder,
  className = '',
}) => {
  const listId = useId();
  const [draft, setDraft] = useState(value);
  const [invalid, setInvalid] = useState(false);
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) {
      setDraft(value);
      setInvalid(false);
    }
  }, [value]);

  const commit = (raw: string) => {
    const normalized = normalizeTime(raw);
    if (normalized) {
      setInvalid(false);
      if (normalized !== value) onChange(normalized);
      return normalized;
    }
    setInvalid(raw.trim().length > 0);
    return null;
  };

  const handleChange = (raw: string) => {
    setDraft(raw);
    if (!raw.trim()) {
      setInvalid(false);
      if (allowEmpty) onChange('');
      return;
    }
    const normalized = normalizeTime(raw);
    if (normalized) {
      setInvalid(false);
      if (normalized !== value) onChange(normalized);
    }
  };

  const handleBlur = () => {
    focused.current = false;
    const normalized = commit(draft);
    if (normalized) setDraft(normalized);
    else if (!draft.trim() && allowEmpty) setDraft('');
  };

  const isLate = /^(2[4-9])/.test(draft.trim());

  const inputClasses = compact
    ? `w-[5.5rem] rounded-lg border px-2 py-1 text-[11px] font-semibold text-ink focus:border-ink focus:outline-none ${
        invalid ? 'border-red-300 bg-red-50' : 'border-line bg-white'
      }`
    : large
      ? `w-full rounded-xl border px-3 py-2.5 text-lg font-semibold text-ink focus:border-ink focus:outline-none ${
          invalid ? 'border-red-300 bg-red-50' : 'border-line bg-white'
        }`
      : `w-full rounded-xl border px-3 py-2.5 text-sm font-medium text-ink focus:border-ink focus:outline-none ${
          invalid ? 'border-red-300 bg-red-50' : 'border-line bg-paper'
        }`;

  return (
    <div className={className}>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        list={listId}
        value={draft}
        placeholder={placeholder ?? (compact ? 'HH:MM' : 'ex: 19:30')}
        aria-label={ariaLabel}
        aria-invalid={invalid}
        onFocus={() => {
          focused.current = true;
        }}
        onChange={(event) => handleChange(event.target.value)}
        onBlur={handleBlur}
        className={inputClasses}
      />
      <datalist id={listId}>
        {TIME_SUGGESTIONS.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>

      {!compact && invalid && (
        <p className="mt-1 text-[10px] font-medium text-red-600">
          Heure invalide — format HH:MM, de 00:00 à 29:59.
        </p>
      )}

      {!compact && !invalid && isLate && (
        <p className="mt-1 text-[10px] font-medium text-accent">
          Après minuit → {describeTime(draft.trim())}
        </p>
      )}
    </div>
  );
};
