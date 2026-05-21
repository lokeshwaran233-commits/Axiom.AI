import { useState } from 'react';
import {
  Shield,
  Brain,
  AlertTriangle,
  Code,
  Database,
  Send,
  ChevronDown,
  ChevronRight,
  Cpu,
  Activity,
  BookOpen,
  Zap,
  Hash,
} from 'lucide-react';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { EmptyState } from '../components/common/Skeleton';
import { cn, formatRelativeTime, getAgentColor, getAgentLabel, getAgentHexColor, getActionColor, getActionBgColor, getActionBorderColor } from '../lib/utils';
import type { TraceEntry, AgentType, TraceAction } from '../types';

const AGENT_ICONS: Record<string, React.FC<{ className?: string; style?: React.CSSProperties }>> = {
  biosynthesis: Brain,
  admet_skeptic: AlertTriangle,
  code_architect: Code,
  memory_broker: Database,
  simulation_dispatcher: Send,
  orchestrator: Shield,
};

const traceEntries: TraceEntry[] = [
  {
    id: 't1',
    agent: 'memory_broker',
    timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
    action: 'MEMORY_WRITE',
    tool: 'supabase_insert',
    hypothesis: 'KRAS G12C',
    input: { compound: 'sotorasib-derivative', result: 'CNS_penetration_FAIL', threshold: 'logBB < -1' },
    output: { status: 'stored', vault_id: 'neg-vault-0041' },
    reasoning: 'Recorded negative result to prevent redundant exploration of sotorasib scaffold for CNS-penetrant KRAS inhibitors. Flagging for cross-hypothesis memory propagation.',
    tokensIn: 310,
    tokensOut: 95,
  },
  {
    id: 't2',
    agent: 'biosynthesis',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    action: 'GENERATION',
    tool: 'hypothesis_v2_generator',
    hypothesis: 'c-Myc / MYC',
    input: { base_smiles: 'JQ1-triazole', modification: 'hERG-mitigating', position: 4, substitution: 'para-fluoro' },
    output: { new_smiles: 'CC1=C(...)F', confidence: 0.82, novelty_score: 0.71 },
    reasoning: 'Applied para-fluoro substitution at position 4 per ADMET Skeptic critique. Predicted 3-5x hERG affinity reduction while preserving BRD4 BD2 selectivity. Confidence reflects literature precedent from 42-analog SAR dataset.',
    tokensIn: 420,
    tokensOut: 1847,
  },
  {
    id: 't3',
    agent: 'admet_skeptic',
    timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
    action: 'CRITIQUE',
    tool: 'hERG_liability_screener',
    hypothesis: 'c-Myc / MYC',
    input: { compound: 'JQ1-triazole-v1', assay: 'patch_clamp_prediction' },
    output: { IC50_hERG: '4.2uM', liability: 'MODERATE', recommendation: 'para-fluoro substitution at position 4' },
    reasoning: 'IC50 of 4.2uM approaches cardiotoxicity threshold. Red-teaming biosynthesis output — flagging before simulation dispatch. Structural fix available without compromising bromodomain potency.',
    tokensIn: 310,
    tokensOut: 1203,
  },
  {
    id: 't4',
    agent: 'code_architect',
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
    action: 'TOOL_CALL',
    tool: 'AutoDock_Vina_1.2.3',
    hypothesis: 'c-Myc / MYC',
    input: { receptor_pdb: '6Y7R', grid_center: [12.4, -8.7, 22.1], exhaustiveness: 16, num_modes: 9, cpu: 8 },
    output: { best_pose_affinity: '-8.4 kcal/mol', RMSD: '1.2A', status: 'EXCEEDS_THRESHOLD' },
    reasoning: 'Configured Vina pipeline with RDKit conformer generation and pose filtering. Grid centered on BRD4 BD2 acetyl-lysine binding pocket. Exhaustiveness=16 chosen for balance of accuracy and Fargate compute cost.',
    tokensIn: 580,
    tokensOut: 2341,
  },
  {
    id: 't5',
    agent: 'biosynthesis',
    timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
    action: 'GENERATION',
    tool: 'hypergraph_traversal',
    hypothesis: 'BRAF V600E',
    input: { start_node: 'BRAF_V600E', traversal_depth: 3, target_type: 'type_II_kinase_conformation' },
    output: { scaffold: 'sorafenib_core', modification: 'modified_hinge_binder', nodes_traversed: 14 },
    reasoning: 'Type II kinase conformation identified as druggable state for V600E mutant. Sorafenib core selected as validated scaffold — modifying hinge binder region to improve selectivity over wild-type BRAF.',
    tokensIn: 390,
    tokensOut: 1654,
  },
  {
    id: 't6',
    agent: 'simulation_dispatcher',
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    action: 'TOOL_CALL',
    tool: 'AWS_Fargate_job_queue',
    hypothesis: 'c-Fos / FOS',
    input: { job_type: 'molecular_docking', compound: 'leucine-zipper-disruptor-v3', priority: 'HIGH', instance: 'c5.4xlarge' },
    output: { job_id: 'fargate-docking-0089', status: 'QUEUED', estimated_runtime: '18min' },
    reasoning: 'Dispatching allosteric modulator to Fargate queue. High priority assigned due to c-Fos convergence proximity (91% confidence threshold reached).',
    tokensIn: 215,
    tokensOut: 445,
  },
  {
    id: 't7',
    agent: 'admet_skeptic',
    timestamp: new Date(Date.now() - 34 * 60000).toISOString(),
    action: 'CRITIQUE',
    tool: 'BBB_penetration_predictor',
    hypothesis: 'KRAS G12C',
    input: { compound: 'sotorasib-covalent-v2', target: 'CNS', model: 'SwissADME_logBB' },
    output: { logBB: '-1.3', BBB_penetration: 'POOR', CNS_viability: false },
    reasoning: 'KRAS G12C hypothesis targets brain metastases — CNS penetration is non-negotiable. logBB of -1.3 disqualifies current scaffold. Recommending Memory Broker write before generating alternatives.',
    tokensIn: 290,
    tokensOut: 987,
  },
  {
    id: 't8',
    agent: 'memory_broker',
    timestamp: new Date(Date.now() - 41 * 60000).toISOString(),
    action: 'MEMORY_WRITE',
    tool: 'supabase_insert',
    hypothesis: 'All',
    input: { event: 'pipeline_start', active_hypotheses: 4, timestamp: '2026-05-20T10:14:00Z' },
    output: { session_id: 'axiom-session-0023', status: 'initialized' },
    reasoning: 'Session context initialized. Negative data vault loaded — 127 prior failed compounds excluded from generation space.',
    tokensIn: 180,
    tokensOut: 312,
  },
];

const agentFilters: { id: AgentType | 'all'; label: string }[] = [
  { id: 'all', label: 'All Agents' },
  { id: 'biosynthesis', label: 'Biosynthesis' },
  { id: 'admet_skeptic', label: 'ADMET Skeptic' },
  { id: 'code_architect', label: 'Code-Architect' },
  { id: 'memory_broker', label: 'Memory Broker' },
  { id: 'simulation_dispatcher', label: 'Simulation Dispatcher' },
];

const actionFilters: { id: TraceAction | 'all'; label: string }[] = [
  { id: 'all', label: 'All Events' },
  { id: 'TOOL_CALL', label: 'Tool Calls' },
  { id: 'CRITIQUE', label: 'Critiques' },
  { id: 'GENERATION', label: 'Generations' },
  { id: 'MEMORY_WRITE', label: 'Memory Writes' },
];

function TraceEntryCard({ entry }: { entry: TraceEntry }) {
  const [expanded, setExpanded] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  const AgentIcon = AGENT_ICONS[entry.agent] || Shield;
  const agentHex = getAgentHexColor(entry.agent);

  return (
    <div className="glass-panel glass-panel-hover rounded-xl overflow-hidden animate-slide-in">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-axiom-bg-tertiary/30 transition-colors"
      >
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg border"
          style={{ background: agentHex + '15', borderColor: agentHex + '30' }}
        >
          <AgentIcon className="w-4 h-4" style={{ color: agentHex }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('text-xs font-semibold', getAgentColor(entry.agent))}>
              {getAgentLabel(entry.agent)}
            </span>
            <span
              className={cn(
                'px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border',
                getActionColor(entry.action),
                getActionBgColor(entry.action),
                getActionBorderColor(entry.action)
              )}
            >
              {entry.action.replace('_', ' ')}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-axiom-bg-tertiary text-axiom-border-secondary border border-axiom-border">
              {entry.tool}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-axiom-cyan/5 text-axiom-cyan/70 border border-axiom-cyan/10">
              {entry.hypothesis}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-1 text-[10px] text-axiom-border-secondary">
            <Hash className="w-3 h-3" />
            <span className="font-mono">{entry.tokensIn}</span>
            <span className="text-axiom-border">/</span>
            <span className="font-mono">{entry.tokensOut}</span>
          </div>
          <span
            className="text-[10px] text-axiom-border-secondary"
            title={new Date(entry.timestamp).toLocaleString()}
          >
            {formatRelativeTime(entry.timestamp)}
          </span>
          {expanded ? <ChevronDown className="w-4 h-4 text-axiom-border-secondary" /> : <ChevronRight className="w-4 h-4 text-axiom-border-secondary" />}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 animate-fade-in border-t border-axiom-border/50">
          {/* Input */}
          <div className="pt-3">
            <button
              onClick={() => setShowInput(!showInput)}
              className="flex items-center gap-1.5 text-[10px] font-semibold text-axiom-border-secondary uppercase tracking-wider hover:text-white transition-colors"
            >
              {showInput ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              Input Parameters
            </button>
            {showInput && (
              <pre className="mt-2 p-3 rounded-lg bg-axiom-bg-tertiary text-[10px] text-axiom-border-secondary font-mono leading-relaxed overflow-x-auto animate-fade-in">
                {JSON.stringify(entry.input, null, 2)}
              </pre>
            )}
          </div>

          {/* Output */}
          <div>
            <button
              onClick={() => setShowOutput(!showOutput)}
              className="flex items-center gap-1.5 text-[10px] font-semibold text-axiom-border-secondary uppercase tracking-wider hover:text-white transition-colors"
            >
              {showOutput ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              Output / Result
            </button>
            {showOutput && (
              <pre className="mt-2 p-3 rounded-lg bg-axiom-bg-tertiary text-[10px] text-axiom-border-secondary font-mono leading-relaxed overflow-x-auto animate-fade-in">
                {JSON.stringify(entry.output, null, 2)}
              </pre>
            )}
          </div>

          {/* Reasoning */}
          <div>
            <div className="text-[10px] font-semibold text-axiom-border-secondary uppercase tracking-wider mb-1.5">
              Chain of Thought
            </div>
            <div className="p-3 rounded-lg bg-axiom-bg-tertiary border-l-2" style={{ borderColor: agentHex + '40' }}>
              <p className="text-xs text-axiom-border-secondary leading-relaxed">{entry.reasoning}</p>
            </div>
          </div>

          {/* Token Usage */}
          <div className="flex items-center gap-4 pt-1">
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="text-axiom-border-secondary">Input tokens:</span>
              <span className="text-white font-mono font-semibold">{entry.tokensIn}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="text-axiom-border-secondary">Output tokens:</span>
              <span className="text-white font-mono font-semibold">{entry.tokensOut}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="text-axiom-border-secondary">Total:</span>
              <span className="text-axiom-cyan font-mono font-semibold">{entry.tokensIn + entry.tokensOut}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="glass-panel rounded-xl p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-axiom-bg-tertiary" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 rounded bg-axiom-bg-tertiary" />
          <div className="h-2 w-48 rounded bg-axiom-bg-tertiary" />
        </div>
        <div className="h-3 w-16 rounded bg-axiom-bg-tertiary" />
      </div>
    </div>
  );
}

export default function AgentTracePage() {
  const [agentFilter, setAgentFilter] = useState<AgentType | 'all'>('all');
  const [actionFilter, setActionFilter] = useState<TraceAction | 'all'>('all');
  const [isLoading] = useState(false);

  const filtered = traceEntries.filter((entry) => {
    if (agentFilter !== 'all' && entry.agent !== agentFilter) return false;
    if (actionFilter !== 'all' && entry.action !== actionFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Stats */}
      <ErrorBoundary name="TraceSummaryStats">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total Events', value: '847', icon: Activity, color: 'text-axiom-cyan' },
            { label: 'Tool Calls', value: '312', icon: Cpu, color: 'text-cyan-400' },
            { label: 'Critiques', value: '156', icon: AlertTriangle, color: 'text-red-400' },
            { label: 'Memory Writes', value: '89', icon: Database, color: 'text-amber-400' },
            { label: 'Total Tokens', value: '2.4M', icon: Zap, color: 'text-emerald-400' },
            { label: 'Active Agents', value: '4', icon: Brain, color: 'text-violet-400' },
          ].map((stat) => (
            <div key={stat.label} className="glass-panel rounded-xl p-4 text-center">
              <stat.icon className={cn('w-4 h-4 mx-auto mb-2', stat.color)} />
              <div className="text-lg font-bold text-white stat-value">{stat.value}</div>
              <div className="text-[10px] text-axiom-border-secondary mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </ErrorBoundary>

      {/* Agent Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Shield className="w-3.5 h-3.5 text-axiom-border-secondary" />
        {agentFilters.map((f) => (
          <button
            key={f.id}
            onClick={() => setAgentFilter(f.id)}
            className={cn(
              'px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all',
              agentFilter === f.id
                ? 'bg-axiom-cyan/10 text-axiom-cyan border border-axiom-cyan/20'
                : 'text-axiom-border-secondary hover:text-white border border-transparent'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Action Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <BookOpen className="w-3.5 h-3.5 text-axiom-border-secondary" />
        {actionFilters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActionFilter(f.id)}
            className={cn(
              'px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all',
              actionFilter === f.id
                ? 'bg-axiom-cyan/10 text-axiom-cyan border border-axiom-cyan/20'
                : 'text-axiom-border-secondary hover:text-white border border-transparent'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline Feed */}
      <ErrorBoundary name="TraceTimeline">
        <div className="space-y-3">
          {isLoading ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : (
            filtered.map((entry) => <TraceEntryCard key={entry.id} entry={entry} />)
          )}
          {!isLoading && filtered.length === 0 && (
            <EmptyState
              icon={Shield}
              title="No agent activity recorded"
              description="Activity will populate once your pipeline begins processing."
            />
          )}
        </div>
      </ErrorBoundary>
    </div>
  );
}
