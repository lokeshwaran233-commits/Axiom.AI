import {
  FlaskConical,
  Shield,
  Cpu,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Beaker,
} from 'lucide-react';
import { useState } from 'react';
import { cn, getStatusColor, getStatusBgColor, getStatusBorderColor, formatScore, getEngineLabel } from '../../lib/utils';
import type { Hypothesis, HypothesisVersion, SimulationJob } from '../../types';

interface HypothesisCardProps {
  hypothesis: Hypothesis;
  latestVersion?: HypothesisVersion | null;
  simulationJobs?: SimulationJob[];
}

export default function HypothesisCard({ hypothesis, latestVersion, simulationJobs }: HypothesisCardProps) {
  const [expanded, setExpanded] = useState(false);

  const statusSteps = [
    { key: 'generating', label: 'Generate', icon: FlaskConical },
    { key: 'critiquing', label: 'Critique', icon: Shield },
    { key: 'coding', label: 'Code', icon: Cpu },
    { key: 'simulating', label: 'Simulate', icon: Cpu },
    { key: 'refining', label: 'Refine', icon: BookOpen },
    { key: 'converged', label: 'Converge', icon: CheckCircle2 },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.key === hypothesis.status);

  return (
    <div className={cn('glass-panel rounded-xl overflow-hidden', getStatusBorderColor(hypothesis.status))}>
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base font-bold text-white">{hypothesis.target_gene}</span>
              {hypothesis.target_protein && (
                <span className="text-xs text-axiom-border-secondary font-mono">/ {hypothesis.target_protein}</span>
              )}
            </div>
            <p className="text-xs text-axiom-border-secondary leading-relaxed max-w-lg">{hypothesis.objective_text}</p>
          </div>
          <div className={cn('px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider', getStatusColor(hypothesis.status), getStatusBgColor(hypothesis.status))}>
            {hypothesis.status}
          </div>
        </div>

        {/* Pipeline Progress */}
        <div className="flex items-center gap-1 mb-4">
          {statusSteps.map((step, i) => {
            const Icon = step.icon;
            const isCompleted = i < currentStepIndex;
            const isCurrent = i === currentStepIndex;
            const isPending = i > currentStepIndex;

            return (
              <div key={step.key} className="flex items-center gap-1 flex-1">
                <div
                  className={cn(
                    'flex items-center justify-center w-7 h-7 rounded-md border transition-all',
                    isCompleted && 'bg-axiom-emerald/10 border-axiom-emerald/30 text-axiom-emerald',
                    isCurrent && 'bg-axiom-cyan/10 border-axiom-cyan/30 text-axiom-cyan animate-pulse-slow',
                    isPending && 'bg-axiom-bg-tertiary border-axiom-border text-axiom-border-secondary'
                  )}
                >
                  <Icon className="w-3 h-3" />
                </div>
                {i < statusSteps.length - 1 && (
                  <div className={cn('flex-1 h-px', i < currentStepIndex ? 'bg-axiom-emerald/30' : 'bg-axiom-border')} />
                )}
              </div>
            );
          })}
        </div>

        {/* Scores Row */}
        {latestVersion && (
          <div className="grid grid-cols-5 gap-3">
            <div className="text-center p-2 rounded-lg bg-axiom-bg-tertiary">
              <div className="text-sm font-bold text-white stat-value">{formatScore(latestVersion.admet_score * 100)}%</div>
              <div className="text-[10px] text-axiom-border-secondary mt-0.5">ADMET</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-axiom-bg-tertiary">
              <div className="text-sm font-bold text-white stat-value">{formatScore(latestVersion.docking_score)}</div>
              <div className="text-[10px] text-axiom-border-secondary mt-0.5">Docking</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-axiom-bg-tertiary">
              <div className="text-sm font-bold text-white stat-value">{formatScore(latestVersion.binding_affinity_kcal)}</div>
              <div className="text-[10px] text-axiom-border-secondary mt-0.5">kcal/mol</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-axiom-bg-tertiary">
              <div className="text-sm font-bold text-white stat-value">{formatScore(latestVersion.confidence_score * 100)}%</div>
              <div className="text-[10px] text-axiom-border-secondary mt-0.5">Confidence</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-axiom-bg-tertiary">
              <div className="text-sm font-bold text-white stat-value">{formatScore(latestVersion.novelty_score * 100)}%</div>
              <div className="text-[10px] text-axiom-border-secondary mt-0.5">Novelty</div>
            </div>
          </div>
        )}
      </div>

      {/* Expandable Details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 border-t border-axiom-border text-[11px] text-axiom-border-secondary hover:text-white hover:bg-axiom-bg-tertiary/50 transition-colors"
      >
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {expanded ? 'Hide Details' : 'Show Details'}
      </button>

      {expanded && (
        <div className="p-5 border-t border-axiom-border space-y-4 animate-slide-in">
          {/* SMILES */}
          {latestVersion?.proposed_smiles && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Beaker className="w-3 h-3 text-axiom-cyan" />
                <span className="text-[10px] font-semibold text-axiom-border-secondary uppercase tracking-wider">Proposed SMILES</span>
              </div>
              <div className="p-2.5 rounded-lg bg-axiom-bg-tertiary font-mono text-[11px] text-axiom-cyan break-all leading-relaxed">
                {latestVersion.proposed_smiles}
              </div>
            </div>
          )}

          {/* Mechanism */}
          {latestVersion?.mechanism_text && (
            <div>
              <div className="text-[10px] font-semibold text-axiom-border-secondary uppercase tracking-wider mb-1.5">Mechanism of Action</div>
              <p className="text-xs text-axiom-border-secondary leading-relaxed">{latestVersion.mechanism_text}</p>
            </div>
          )}

          {/* Biosecurity */}
          <div className="flex items-center gap-2">
            {latestVersion?.biosecurity_clearance ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-axiom-emerald" />
                <span className="text-xs text-axiom-emerald font-medium">Biosecurity Clearance: Passed</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-axiom-amber" />
                <span className="text-xs text-axiom-amber font-medium">Biosecurity Clearance: Pending</span>
              </>
            )}
          </div>

          {/* Simulation Jobs */}
          {simulationJobs && simulationJobs.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-axiom-border-secondary uppercase tracking-wider mb-2">Simulation Jobs</div>
              <div className="space-y-2">
                {simulationJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-2.5 rounded-lg bg-axiom-bg-tertiary">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3 h-3 text-axiom-cyan" />
                      <span className="text-xs text-white font-medium">{getEngineLabel(job.engine)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {job.docking_score !== 0 && (
                        <span className="text-[10px] font-mono text-axiom-border-secondary">{job.docking_score} kcal/mol</span>
                      )}
                      <span className={cn('text-[10px] font-semibold', getStatusColor(job.status))}>{job.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Iteration Info */}
          <div className="flex items-center justify-between text-[10px] text-axiom-border-secondary">
            <span>Iteration {hypothesis.iteration_count}</span>
            <span>Convergence: {formatScore(hypothesis.convergence_score * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
