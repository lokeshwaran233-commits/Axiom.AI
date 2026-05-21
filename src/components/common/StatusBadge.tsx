import { cn } from '../../lib/utils';

const STATUS_MAP: Record<string, { text: string; bg: string; border: string; pulse?: boolean }> = {
  // Hypothesis statuses
  draft: { text: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20' },
  generating: { text: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
  critiquing: { text: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  coding: { text: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
  simulating: { text: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
  refining: { text: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  converged: { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  failed: { text: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
  archived: { text: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
  // Simulation statuses
  queued: { text: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  running: { text: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20', pulse: true },
  completed: { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  cancelled: { text: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
  // Uppercase simulation statuses
  RUNNING: { text: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20', pulse: true },
  COMPLETED: { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  FAILED: { text: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
  QUEUED: { text: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = STATUS_MAP[status] || STATUS_MAP.draft;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border',
        style.text,
        style.bg,
        style.border,
        className
      )}
    >
      {style.pulse && <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" aria-hidden="true" />}
      {status}
    </span>
  );
}
