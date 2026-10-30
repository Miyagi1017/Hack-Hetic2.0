import React from 'react';
import { Accessibility, Check, RotateCcw, X } from 'lucide-react';
import { ComfortSettings, FONT_SCALES } from '../data/accessibility';

interface ComfortModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ComfortSettings;
  onChange: (patch: Partial<ComfortSettings>) => void;
  onReset: () => void;
}

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ label, description, checked, onToggle }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onToggle}
    className="flex w-full cursor-pointer items-start justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3 text-left transition-colors hover:border-line-strong"
  >
    <span className="min-w-0">
      <span className="block text-sm font-semibold text-ink">{label}</span>
      <span className="mt-0.5 block text-[11px] leading-relaxed text-muted">{description}</span>
    </span>
    <span
      className={`mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors ${
        checked ? 'border-ink bg-ink' : 'border-line-strong bg-paper-deep'
      }`}
      aria-hidden="true"
    >
      <span
        className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-[1.35rem]' : 'translate-x-0.5'
        }`}
      />
    </span>
  </button>
);

/**
 * Réglages de confort : taille du texte, contraste, animations réduites…
 * Un thème simple, lisible par les enfants comme par les aînés.
 */
export const ComfortModal: React.FC<ComfortModalProps> = ({
  isOpen,
  onClose,
  settings,
  onChange,
  onReset,
}) => {
  if (!isOpen) return null;

  const toggle = (key: keyof Omit<ComfortSettings, 'fontScale'>) =>
    onChange({ [key]: !settings[key] } as Partial<ComfortSettings>);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-0 backdrop-blur-xs animate-in fade-in duration-200 sm:items-center sm:p-4">
      <div className="flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-line bg-white shadow-2xl sm:rounded-[26px]">
        <div className="flex items-start justify-between gap-3 border-b border-line p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-ink text-amber-300">
              <Accessibility className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                Accessible à tous
              </span>
              <h3 className="font-serif text-xl font-semibold leading-tight text-ink">
                Confort de lecture
              </h3>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
                Un thème simple et lisible, à ajuster selon votre vue. Vos choix sont enregistrés
                sur cet appareil.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer les réglages de confort"
            className="cursor-pointer rounded-full p-2 text-muted transition-colors hover:bg-paper hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-5">
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
              Taille du texte
            </p>
            <div className="grid grid-cols-3 gap-2">
              {FONT_SCALES.map((scale) => {
                const active = settings.fontScale === scale.id;
                return (
                  <button
                    key={scale.id}
                    type="button"
                    onClick={() => onChange({ fontScale: scale.id })}
                    aria-pressed={active}
                    className={`cursor-pointer rounded-2xl border px-2 py-3 text-center transition-colors ${
                      active
                        ? 'border-ink bg-ink text-white'
                        : 'border-line bg-white text-ink-soft hover:border-line-strong'
                    }`}
                  >
                    <span
                      className={`block font-serif font-semibold leading-none ${
                        scale.id === 'normal'
                          ? 'text-xl'
                          : scale.id === 'large'
                            ? 'text-2xl'
                            : 'text-3xl'
                      }`}
                    >
                      {scale.sample}
                    </span>
                    <span className="mt-1.5 block text-[11px] font-semibold">{scale.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <ToggleRow
              label="Contraste élevé"
              description="Fonds plus clairs, textes et bordures plus foncés."
              checked={settings.highContrast}
              onToggle={() => toggle('highContrast')}
            />
            <ToggleRow
              label="Réduire les animations"
              description="Supprime les mouvements et transitions de l'interface."
              checked={settings.reduceMotion}
              onToggle={() => toggle('reduceMotion')}
            />
            <ToggleRow
              label="Boutons plus grands"
              description="Agrandit les zones à toucher : idéal sur mobile ou avec des mains moins sûres."
              checked={settings.biggerTargets}
              onToggle={() => toggle('biggerTargets')}
            />
            <ToggleRow
              label="Souligner les liens"
              description="Repère immédiatement ce qui peut être cliqué."
              checked={settings.underlineLinks}
              onToggle={() => toggle('underlineLinks')}
            />
          </div>

          <p className="flex items-start gap-1.5 rounded-xl border border-line bg-paper px-3 py-2.5 text-[11px] leading-relaxed text-muted">
            <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
            L'application respecte aussi le réglage « réduire les animations » de votre système, et
            tous les champs restent utilisables au clavier.
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-line bg-white p-4">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2.5 text-xs font-semibold text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Réinitialiser
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-ink-soft"
          >
            <Check className="h-3.5 w-3.5" />
            Terminé
          </button>
        </div>
      </div>
    </div>
  );
};
