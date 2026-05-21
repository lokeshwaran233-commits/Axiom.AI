export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

export function formatScore(score: number, decimals = 1): string {
  return score.toFixed(decimals);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'text-slate-400',
    generating: 'text-cyan-400',
    critiquing: 'text-amber-400',
    coding: 'text-cyan-400',
    simulating: 'text-blue-400',
    refining: 'text-amber-400',
    converged: 'text-emerald-400',
    failed: 'text-red-400',
    archived: 'text-slate-500',
    queued: 'text-slate-400',
    running: 'text-cyan-400',
    completed: 'text-emerald-400',
    cancelled: 'text-slate-500',
  };
  return colors[status] || 'text-slate-400';
}

export function getStatusBgColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-slate-400/10',
    generating: 'bg-cyan-400/10',
    critiquing: 'bg-amber-400/10',
    coding: 'bg-cyan-400/10',
    simulating: 'bg-blue-400/10',
    refining: 'bg-amber-400/10',
    converged: 'bg-emerald-400/10',
    failed: 'bg-red-400/10',
    archived: 'bg-slate-500/10',
    queued: 'bg-slate-400/10',
    running: 'bg-cyan-400/10',
    completed: 'bg-emerald-400/10',
    cancelled: 'bg-slate-500/10',
  };
  return colors[status] || 'bg-slate-400/10';
}

export function getStatusBorderColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'border-slate-400/20',
    generating: 'border-cyan-400/30',
    critiquing: 'border-amber-400/30',
    coding: 'border-cyan-400/30',
    simulating: 'border-blue-400/30',
    refining: 'border-amber-400/30',
    converged: 'border-emerald-400/30',
    failed: 'border-red-400/30',
    archived: 'border-slate-500/20',
    queued: 'border-slate-400/20',
    running: 'border-cyan-400/30',
    completed: 'border-emerald-400/30',
    cancelled: 'border-slate-500/20',
  };
  return colors[status] || 'border-slate-400/20';
}

export function getAgentColor(agent: string): string {
  const colors: Record<string, string> = {
    biosynthesis: 'text-emerald-400',
    admet_skeptic: 'text-red-400',
    code_architect: 'text-cyan-400',
    memory_broker: 'text-amber-400',
    orchestrator: 'text-blue-400',
    simulation_dispatcher: 'text-violet-400',
  };
  return colors[agent] || 'text-slate-400';
}

export function getAgentBgColor(agent: string): string {
  const colors: Record<string, string> = {
    biosynthesis: 'bg-emerald-400/10',
    admet_skeptic: 'bg-red-400/10',
    code_architect: 'bg-cyan-400/10',
    memory_broker: 'bg-amber-400/10',
    orchestrator: 'bg-blue-400/10',
    simulation_dispatcher: 'bg-violet-400/10',
  };
  return colors[agent] || 'bg-slate-400/10';
}

export function getAgentBorderColor(agent: string): string {
  const colors: Record<string, string> = {
    biosynthesis: 'border-emerald-400/20',
    admet_skeptic: 'border-red-400/20',
    code_architect: 'border-cyan-400/20',
    memory_broker: 'border-amber-400/20',
    orchestrator: 'border-blue-400/20',
    simulation_dispatcher: 'border-violet-400/20',
  };
  return colors[agent] || 'border-slate-400/20';
}

export function getAgentLabel(agent: string): string {
  const labels: Record<string, string> = {
    biosynthesis: 'Biosynthesis',
    admet_skeptic: 'ADMET Skeptic',
    code_architect: 'Code-Architect',
    memory_broker: 'Memory Broker',
    orchestrator: 'Orchestrator',
    simulation_dispatcher: 'Simulation Dispatcher',
  };
  return labels[agent] || agent;
}

export function getAgentHexColor(agent: string): string {
  const colors: Record<string, string> = {
    biosynthesis: '#34d399',
    admet_skeptic: '#f87171',
    code_architect: '#22d3ee',
    memory_broker: '#fbbf24',
    orchestrator: '#60a5fa',
    simulation_dispatcher: '#a78bfa',
  };
  return colors[agent] || '#94a3b8';
}

export function getActionColor(action: string): string {
  const colors: Record<string, string> = {
    TOOL_CALL: 'text-cyan-400',
    CRITIQUE: 'text-red-400',
    GENERATION: 'text-emerald-400',
    MEMORY_WRITE: 'text-amber-400',
  };
  return colors[action] || 'text-slate-400';
}

export function getActionBgColor(action: string): string {
  const colors: Record<string, string> = {
    TOOL_CALL: 'bg-cyan-400/10',
    CRITIQUE: 'bg-red-400/10',
    GENERATION: 'bg-emerald-400/10',
    MEMORY_WRITE: 'bg-amber-400/10',
  };
  return colors[action] || 'bg-slate-400/10';
}

export function getActionBorderColor(action: string): string {
  const colors: Record<string, string> = {
    TOOL_CALL: 'border-cyan-400/20',
    CRITIQUE: 'border-red-400/20',
    GENERATION: 'border-emerald-400/20',
    MEMORY_WRITE: 'border-amber-400/20',
  };
  return colors[action] || 'border-slate-400/20';
}

export function getEngineLabel(engine: string): string {
  const labels: Record<string, string> = {
    autodock_vina: 'AutoDock Vina',
    gromacs: 'GROMACS',
    openmm: 'OpenMM',
  };
  return labels[engine] || engine;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
