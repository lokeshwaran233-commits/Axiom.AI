import { FlaskConical, ArrowRight, Clock, Zap } from 'lucide-react';
import { cn, getStatusColor, getStatusBgColor, getStatusBorderColor, formatScore } from '../../lib/utils';
import type { Hypothesis } from '../../types';

interface HypothesisOverviewProps {
  hypotheses: Hypothesis[];
  onSelect: (id: string) => void;
}

export default function HypothesisOverview({ hypotheses, onSelect }: HypothesisOverviewProps) {
  if (hypotheses.length === 0) {
    return (
      <div className="text-center py-12 text-axiom-border-secondary">
        <FlaskConical className="w-8 h-8 mx-auto mb-3 opacity-40" />
        <p className="text-sm font-medium">No hypotheses yet</p>
        <p className="text-xs mt-1">Create a new hypothesis to start the discovery pipeline</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hypotheses.map((h, i) => (
        <button
          key={h.id}
          onClick={() => onSelect(h.id)}
          className={cn(
            'w-full text-left p-4 rounded-xl glass-panel glass-panel-hover animate-slide-in',
            getStatusBorderColor(h.status)
          )}
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-white">{h.target_gene}</span>
                {h.target_protein && (
                  <span className="text-[10px] text-axiom-border-secondary font-mono">
                    / {h.target_protein}
                  </span>
                )}
              </div>
              <p className="text-xs text-axiom-border-secondary line-clamp-1">{h.objective_text}</p>
            </div>
            <div className={cn('px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider', getStatusColor(h.status), getStatusBgColor(h.status))}>
              {h.status}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-[10px] text-axiom-border-secondary">
              <Clock className="w-3 h-3" />
              <span>Iteration {h.iteration_count}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-axiom-border-secondary">
              <Zap className="w-3 h-3" />
              <span>Convergence: {formatScore(h.convergence_score * 100)}%</span>
            </div>
            <ArrowRight className="w-3 h-3 text-axiom-border-secondary ml-auto" />
          </div>
        </button>
      ))}
    </div>
  );
}
