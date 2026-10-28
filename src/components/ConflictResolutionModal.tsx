import React from 'react';
import { Sparkles, X, ChevronRight, Clock, AlertTriangle, ArrowRight, Check, Footprints, Bike, Calendar } from 'lucide-react';
import { ConflictDetails, ConflictSolution, ItineraryStep } from '../types/travel';

interface ConflictResolutionModalProps {
  step: ItineraryStep;
  isOpen: boolean;
  onClose: () => void;
  onApplySolution: (solution: ConflictSolution) => void;
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  step,
  isOpen,
  onClose,
  onApplySolution,
}) => {
  if (!isOpen || !step.conflict) return null;

  const conflict = step.conflict;

  return (
    <div className="fixed inset-0 bg-ink/40 backdrop-blur-xs z-50 flex items-end md:items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-[26px] border border-line bg-white p-6 shadow-2xl md:rounded-[26px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-100 p-2.5 rounded-2xl">
              <Sparkles className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-xl font-semibold font-serif text-ink">
                3 solutions trouvées
              </h2>
              <p className="text-xs text-muted">Optimisation intelligente de votre journée</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-paper rounded-full text-muted hover:text-ink transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning card */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-amber-950 mb-0.5">{conflict.title}</p>
            <p className="text-xs text-amber-900 leading-relaxed">{conflict.description}</p>
          </div>
        </div>

        {/* Solutions list */}
        <div className="space-y-3">
          {conflict.solutions.map((sol) => (
            <button
              key={sol.id}
              onClick={() => onApplySolution(sol)}
              className="w-full bg-paper hover:bg-line/80 border-2 border-transparent hover:border-line-strong rounded-2xl p-4 text-left transition-all group cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-2 mb-1">
                    {sol.type === 'shift' && <Calendar className="w-4 h-4 text-blue-600" />}
                    {sol.type === 'replace' && <Sparkles className="w-4 h-4 text-emerald-600" />}
                    {sol.type === 'transport' && <Bike className="w-4 h-4 text-amber-600" />}
                    <p className="font-semibold text-sm text-ink">{sol.title}</p>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{sol.desc}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="bg-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-line text-ink shadow-2xs">
                    {sol.badge}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-muted group-hover:text-ink group-hover:bg-ink group-hover:text-white transition-all">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Cancel button */}
        <button
          onClick={onClose}
          className="w-full mt-5 py-3.5 bg-white border border-line text-ink hover:bg-paper font-semibold text-sm rounded-2xl transition-colors cursor-pointer"
        >
          Garder l'itinéraire actuel
        </button>
      </div>
    </div>
  );
};
