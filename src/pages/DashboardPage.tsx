import { useState } from 'react';
import {
  FlaskConical,
  Cpu,
  CheckCircle2,
  BookOpen,
  TrendingUp,
  Activity,
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import HypothesisOverview from '../components/dashboard/HypothesisOverview';
import AgentActivityFeed from '../components/dashboard/AgentActivityFeed';
import TimelineView from '../components/dashboard/TimelineView';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { getMockTimelineEvents } from '../lib/api';
import type { Hypothesis, AgentActivityLog, DashboardStats } from '../types';

const mockStats: DashboardStats = {
  activeHypotheses: 7,
  convergedHypotheses: 3,
  runningSimulations: 2,
  totalLiteratureChunks: 2847293,
  averageDockingScore: -7.2,
  averageConvergenceIterations: 4.3,
};

const mockHypotheses: Hypothesis[] = [
  {
    id: 'h1',
    workspace_id: 'w1',
    target_gene: 'c-Myc',
    target_protein: 'MYC',
    objective_text: 'Identify novel small-molecule inhibitors of c-Myc/Max dimerization for triple-negative breast cancer',
    current_state_json: {},
    iteration_count: 4,
    status: 'simulating',
    convergence_score: 0.72,
    created_by: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'h2',
    workspace_id: 'w1',
    target_gene: 'c-Fos',
    target_protein: 'FOS',
    objective_text: 'Model AP-1 transcription factor complex disruption via allosteric modulation of c-Fos/c-Jun',
    current_state_json: {},
    iteration_count: 6,
    status: 'converged',
    convergence_score: 0.91,
    created_by: null,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'h3',
    workspace_id: 'w1',
    target_gene: 'BRAF',
    target_protein: 'BRAF V600E',
    objective_text: 'Design selective BRAF V600E inhibitors with reduced paradoxical MAPK activation',
    current_state_json: {},
    iteration_count: 2,
    status: 'critiquing',
    convergence_score: 0.34,
    created_by: null,
    created_at: new Date(Date.now() - 43200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'h4',
    workspace_id: 'w1',
    target_gene: 'KRAS',
    target_protein: 'KRAS G12C',
    objective_text: 'Explore covalent KRAS G12C inhibitors with improved CNS penetration for brain metastases',
    current_state_json: {},
    iteration_count: 1,
    status: 'generating',
    convergence_score: 0.12,
    created_by: null,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString(),
  },
];

const mockActivities: AgentActivityLog[] = [
  {
    id: 'a1',
    hypothesis_id: 'h1',
    workspace_id: 'w1',
    agent_type: 'biosynthesis',
    action: 'Traversed hypergraph from c-Myc node: identified BRD4-c-Myc regulatory axis. Proposed JQ1-derived scaffold with modified triazole linker for improved selectivity.',
    input_summary: '',
    output_summary: '',
    tool_calls: [{ name: 'query_neptune_hypergraph', arguments: { start_node: 'c-Myc', traversal_depth: 3 }, result: '12 paths found' }],
    reasoning_steps: [],
    duration_ms: 4200,
    token_count: 1847,
    status: 'completed',
    error_message: '',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'a2',
    hypothesis_id: 'h1',
    workspace_id: 'w1',
    agent_type: 'admet_skeptic',
    action: 'Red-team critique: flagged moderate hERG channel liability (IC50 ~4.2uM). Recommended para-fluoro substitution at position 4 to reduce off-target cardiac risk.',
    input_summary: '',
    output_summary: '',
    tool_calls: [{ name: 'screen_tox_alerts', arguments: { smiles: 'CC1=NN(C)...' }, result: '1 alert: hERG moderate' }],
    reasoning_steps: [],
    duration_ms: 3100,
    token_count: 1203,
    status: 'completed',
    error_message: '',
    created_at: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: 'a3',
    hypothesis_id: 'h1',
    workspace_id: 'w1',
    agent_type: 'code_architect',
    action: 'Generated AutoDock Vina pipeline: receptor PDB 6Y7R, grid center (12.4, -8.7, 22.1), exhaustiveness=16. Includes RDKit conformer generation and pose filtering.',
    input_summary: '',
    output_summary: '',
    tool_calls: [{ name: 'generate_simulation_code', arguments: { engine: 'autodock_vina', target_pdb: '6Y7R' }, result: 'Pipeline generated' }],
    reasoning_steps: [],
    duration_ms: 5800,
    token_count: 2341,
    status: 'completed',
    error_message: '',
    created_at: new Date(Date.now() - 2400000).toISOString(),
  },
  {
    id: 'a4',
    hypothesis_id: 'h3',
    workspace_id: 'w1',
    agent_type: 'biosynthesis',
    action: 'Initiated hypergraph traversal from BRAF V600E. Identified type II kinase conformation as targetable state. Proposed scaffold based on sorafenib core with modified hinge binder.',
    input_summary: '',
    output_summary: '',
    tool_calls: [{ name: 'query_neptune_hypergraph', arguments: { start_node: 'BRAF', traversal_depth: 2 }, result: '8 paths found' }],
    reasoning_steps: [],
    duration_ms: 3900,
    token_count: 1654,
    status: 'completed',
    error_message: '',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'a5',
    hypothesis_id: 'h4',
    workspace_id: 'w1',
    agent_type: 'memory_broker',
    action: 'Recorded negative data: previous KRAS G12C covalent inhibitor (sotorasib-derivative) failed CNS penetration threshold (logBB < -1). Updated Neptune edge weight to 0.15.',
    input_summary: '',
    output_summary: '',
    tool_calls: [{ name: 'update_neptune_edge', arguments: { edge_id: 'kras-sotorasib', weight: 0.15, evidence: 'failed_cns_penetration' }, result: 'Edge updated' }],
    reasoning_steps: [],
    duration_ms: 1200,
    token_count: 432,
    status: 'completed',
    error_message: '',
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
];

export default function DashboardPage() {
  const [, setSelectedHypothesis] = useState<string | null>(null);
  const timelineEvents = getMockTimelineEvents();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Hypotheses"
          value={mockStats.activeHypotheses}
          icon={<FlaskConical className="w-4 h-4 text-axiom-cyan" />}
          accentColor="bg-axiom-cyan/10"
          trend={{ value: 12, direction: 'up' }}
        />
        <StatCard
          label="Converged"
          value={mockStats.convergedHypotheses}
          icon={<CheckCircle2 className="w-4 h-4 text-axiom-emerald" />}
          accentColor="bg-axiom-emerald/10"
          trend={{ value: 8, direction: 'up' }}
        />
        <StatCard
          label="Running Simulations"
          value={mockStats.runningSimulations}
          icon={<Cpu className="w-4 h-4 text-axiom-blue" />}
          accentColor="bg-axiom-blue/10"
        />
        <StatCard
          label="Avg Docking Score"
          value={mockStats.averageDockingScore}
          unit="kcal/mol"
          icon={<TrendingUp className="w-4 h-4 text-axiom-amber" />}
          accentColor="bg-axiom-amber/10"
          trend={{ value: 15, direction: 'up' }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hypothesis Overview - Left Column */}
        <div className="lg:col-span-1">
          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Active Hypotheses</h2>
              <span className="text-[10px] text-axiom-border-secondary font-mono">{mockHypotheses.length} total</span>
            </div>
            <ErrorBoundary name="HypothesisOverview">
              <HypothesisOverview hypotheses={mockHypotheses} onSelect={setSelectedHypothesis} />
            </ErrorBoundary>
          </div>
        </div>

        {/* Timeline - Center Column */}
        <div className="lg:col-span-1">
          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Pipeline Timeline</h2>
              <div className="flex items-center gap-1.5 text-[10px] text-axiom-emerald">
                <Activity className="w-3 h-3" />
                <span>Live</span>
              </div>
            </div>
            <ErrorBoundary name="TimelineView">
              <TimelineView events={timelineEvents} />
            </ErrorBoundary>
          </div>
        </div>

        {/* Agent Activity - Right Column */}
        <div className="lg:col-span-1">
          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Agent Activity</h2>
              <span className="text-[10px] text-axiom-border-secondary font-mono">{mockActivities.length} events</span>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              <ErrorBoundary name="AgentActivityFeed">
                <AgentActivityFeed activities={mockActivities} />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row - Literature & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Literature Stats */}
        <ErrorBoundary name="LiteratureStats">
          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Literature Intelligence</h2>
              <BookOpen className="w-4 h-4 text-axiom-border-secondary" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-axiom-bg-tertiary">
                <div className="text-xl font-bold text-white stat-value">2.8M</div>
                <div className="text-[10px] text-axiom-border-secondary mt-1">PubMed Chunks</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-axiom-bg-tertiary">
                <div className="text-xl font-bold text-white stat-value">142K</div>
                <div className="text-[10px] text-axiom-border-secondary mt-1">bioRxiv Papers</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-axiom-bg-tertiary">
                <div className="text-xl font-bold text-white stat-value">38K</div>
                <div className="text-[10px] text-axiom-border-secondary mt-1">Patent Filings</div>
              </div>
            </div>
          </div>
        </ErrorBoundary>

        {/* System Architecture Status */}
        <ErrorBoundary name="InfrastructureStatus">
          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Infrastructure Status</h2>
              <div className="flex items-center gap-1.5 text-[10px] text-axiom-emerald font-medium">
                <span className="w-1.5 h-1.5 bg-axiom-emerald rounded-full" />
                All Systems Operational
              </div>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Amazon Neptune', status: 'Active', detail: '2.4M nodes, 8.1M edges' },
                { name: 'AWS Step Functions', status: 'Active', detail: '3 running executions' },
                { name: 'AWS Fargate', status: 'Idle', detail: '0 active tasks, 2 queued' },
                { name: 'Claude API', status: 'Connected', detail: 'Sonnet 4.6, 4 agents' },
                { name: 'Supabase', status: 'Active', detail: 'pgvector enabled' },
              ].map((service) => (
                <div key={service.name} className="flex items-center justify-between py-2 border-b border-axiom-border/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-axiom-emerald rounded-full" />
                    <span className="text-xs text-white font-medium">{service.name}</span>
                  </div>
                  <span className="text-[10px] text-axiom-border-secondary font-mono">{service.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
}
