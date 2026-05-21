import { useState } from 'react';
import {
  FlaskConical,
  Shield,
  Cpu,
  BookOpen,
  Brain,
  ChevronRight,
  ChevronDown,
  Wrench,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { cn, getAgentColor, getAgentBgColor, getAgentLabel, formatRelativeTime } from '../../lib/utils';
import type { AgentActivityLog } from '../../types';

interface AgentReasoningTraceProps {
  activities: AgentActivityLog[];
}

const agentIcons: Record<string, React.ReactNode> = {
  biosynthesis: <FlaskConical className="w-4 h-4" />,
  admet_skeptic: <Shield className="w-4 h-4" />,
  code_architect: <Cpu className="w-4 h-4" />,
  memory_broker: <BookOpen className="w-4 h-4" />,
  orchestrator: <Brain className="w-4 h-4" />,
};

// DEMO ONLY — all agent activity data is mocked for demonstration purposes
const mockActivities: AgentActivityLog[] = [
  {
    id: 'a1',
    hypothesis_id: 'h1',
    workspace_id: 'w1',
    agent_type: 'orchestrator',
    action: 'Initialized hypothesis pipeline for c-Myc targeting in TNBC. Dispatching to Biosynthesis Agent with literature context from 347 relevant papers.',
    input_summary: 'Target: c-Myc | Indication: TNBC | Engine: AutoDock Vina',
    output_summary: 'Pipeline initialized. 3 agent stages queued.',
    tool_calls: [{ name: 'initialize_pipeline', arguments: { target: 'c-Myc', indication: 'TNBC' }, result: 'Pipeline session created: ps-abc123' }],
    reasoning_steps: [
      'Identified c-Myc as well-validated oncogene target with 347 relevant PubMed entries',
      'Selected AutoDock Vina as primary simulation engine for initial binding affinity screening',
      'Queued 3-stage pipeline: Biosynthesis -> ADMET Skeptic -> Code-Architect',
    ],
    duration_ms: 1200,
    token_count: 432,
    status: 'completed',
    error_message: '',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'a2',
    hypothesis_id: 'h1',
    workspace_id: 'w1',
    agent_type: 'biosynthesis',
    action: 'Traversed Neptune hypergraph from c-Myc node (depth=3). Identified BRD4-c-Myc regulatory axis as high-value target. Proposed JQ1-derived scaffold with modified triazole linker for improved BD2 selectivity over BD1.',
    input_summary: 'Query: c-Myc inhibitors | Context: 347 papers, 12 graph paths',
    output_summary: 'Proposed: JQ1-triazole-derivative | SMILES: CCC1=NN(C)...',
    tool_calls: [
      { name: 'query_neptune_hypergraph', arguments: { start_node: 'c-Myc', traversal_depth: 3, edge_filter: ['activates', 'binds_to'] }, result: '12 paths found, 8 unique entities' },
      { name: 'search_literature_rag', arguments: { query: 'c-Myc BRD4 inhibitor JQ1 derivative', limit: 20 }, result: '18 chunks retrieved, avg relevance 0.87' },
      { name: 'validate_smiles', arguments: { smiles: 'CCC1=NN(C)C2=C1C=CC(=C2)C(=O)NCC3=CC=C(C=C3)OCC4=CC(=CC=C4)S(=O)(=O)N' }, result: 'Valid SMILES, MW=423.5' },
    ],
    reasoning_steps: [
      'Hypergraph traversal revealed BRD4 as primary upstream activator of c-Myc (edge weight: 0.91, 278 evidence papers)',
      'JQ1 is the most validated BRD4 inhibitor (412 papers) but has known selectivity issues between BD1 and BD2',
      'Triazole linker modification at the terminal phenyl position has been shown to improve BD2 selectivity (3 supporting papers)',
      'Proposed scaffold maintains core benzodiazepine while introducing triazole as a conformational constraint',
      'SMILES validated by RDKit parser - molecular weight 423.5 Da, within drug-like range',
    ],
    duration_ms: 4200,
    token_count: 1847,
    status: 'completed',
    error_message: '',
    created_at: new Date(Date.now() - 6800000).toISOString(),
  },
  {
    id: 'a3',
    hypothesis_id: 'h1',
    workspace_id: 'w1',
    agent_type: 'admet_skeptic',
    action: 'Red-team critique of JQ1-triazole-derivative. Flagged moderate hERG channel liability (predicted IC50 ~4.2uM). Recommended para-fluoro substitution at position 4 to reduce off-target cardiac risk while maintaining BD2 binding.',
    input_summary: 'SMILES: CCC1=NN(C)... | Target: BRD4 BD2',
    output_summary: 'ADMET Score: 0.72 | 1 alert: hERG moderate | Recommendation: para-F substitution',
    tool_calls: [
      { name: 'screen_tox_alerts', arguments: { smiles: 'CCC1=NN(C)...', alert_types: ['hERG', 'mutagenic', 'hepatotoxic', 'carcinogenic'] }, result: '1 alert: hERG moderate risk (IC50 ~4.2uM)' },
      { name: 'predict_admet', arguments: { smiles: 'CCC1=NN(C)...', models: ['absorption', 'distribution', 'metabolism', 'excretion', 'toxicity'] }, result: 'HIA: 85%, logP: 3.2, CYP3A4 substrate: yes, hERG: moderate' },
      { name: 'check_biosecurity', arguments: { smiles: 'CCC1=NN(C)...', databases: ['select_agent', 'dual_use_research'] }, result: 'No biosecurity flags' },
    ],
    reasoning_steps: [
      'hERG liability is the primary concern - the sulfonamide moiety is a known hERG binder scaffold',
      'Para-fluoro substitution at position 4 has been shown to reduce hERG affinity by 3-5x in similar scaffolds (2 supporting papers)',
      'Absorption prediction is favorable (HIA 85%) but CYP3A4 substrate status may lead to drug-drug interactions',
      'No biosecurity concerns - compound does not match any Select Agent or DURC patterns',
      'Overall ADMET score of 0.72 is above the 0.65 threshold for proceeding to simulation',
    ],
    duration_ms: 3100,
    token_count: 1203,
    status: 'completed',
    error_message: '',
    created_at: new Date(Date.now() - 6200000).toISOString(),
  },
  {
    id: 'a4',
    hypothesis_id: 'h1',
    workspace_id: 'w1',
    agent_type: 'code_architect',
    action: 'Generated AutoDock Vina molecular docking pipeline. Receptor: PDB 6Y7R (BRD4 BD1/BD2), grid centered on acetyl-lysine binding pocket. Includes RDKit conformer generation, Vina docking with exhaustiveness=16, and pose filtering by RMSD < 2.0A.',
    input_summary: 'SMILES: CCC1=NN(C)... | Engine: AutoDock Vina | Target PDB: 6Y7R',
    output_summary: 'Pipeline generated: 47 lines Python | Fargate task dispatched',
    tool_calls: [
      { name: 'generate_simulation_code', arguments: { engine: 'autodock_vina', target_pdb: '6Y7R', ligand_smiles: 'CCC1=NN(C)...', params: { exhaustiveness: 16, num_modes: 9 } }, result: 'Pipeline code generated: 47 lines' },
      { name: 'validate_pipeline', arguments: { code_hash: 'sha256:abc123', syntax_check: true, dependency_check: true }, result: 'Pipeline validated: syntax OK, dependencies OK' },
      { name: 'launch_fargate_simulation', arguments: { container_image: 'axiom/autodock-vina:1.2.3', cpu: 4, memory: 16384, input_s3: 's3://axiom-sim-artifacts/h1/v4/input/' }, result: 'Fargate task: arn:aws:ecs:us-east-1:123:task/axiom-vina-abc123' },
    ],
    reasoning_steps: [
      'PDB 6Y7R contains BRD4 BD1/BD2 tandem bromodomains - ideal for assessing BD2 selectivity',
      'Grid center calculated from acetyl-lysine binding pocket coordinates: (12.4, -8.7, 22.1)',
      'Exhaustiveness=16 provides thorough sampling while keeping compute under 10 minutes',
      'RDKit ETKDG conformer generation ensures proper 3D geometry before docking',
      'Pose filtering at RMSD < 2.0A removes physically implausible binding modes',
    ],
    duration_ms: 5800,
    token_count: 2341,
    status: 'completed',
    error_message: '',
    created_at: new Date(Date.now() - 5600000).toISOString(),
  },
  {
    id: 'a5',
    hypothesis_id: 'h1',
    workspace_id: 'w1',
    agent_type: 'memory_broker',
    action: 'Ingested AutoDock Vina simulation results. Docking score -8.4 kcal/mol exceeds threshold (-7.0). Updated Neptune hypergraph: strengthened BRD4-JQ1-derivative edge weight from 0.81 to 0.89. Recorded negative data: modes 3-5 below threshold.',
    input_summary: 'Simulation results: -8.4 kcal/mol, RMSD 1.2A | 5 modes',
    output_summary: 'Neptune updated: 1 edge strengthened, 3 negative data nodes created',
    tool_calls: [
      { name: 'parse_simulation_output', arguments: { s3_path: 's3://axiom-sim-artifacts/h1/v4/output/', engine: 'autodock_vina' }, result: '5 modes parsed, best: -8.4 kcal/mol' },
      { name: 'update_neptune_edge', arguments: { edge_id: 'brd4-jq1-derivative', weight: 0.89, evidence: 'docking_score: -8.4 kcal/mol' }, result: 'Edge weight updated: 0.81 -> 0.89' },
      { name: 'record_negative_data', arguments: { hypothesis_id: 'h1', modes: [3, 4, 5], reason: 'below_threshold' }, result: '3 negative data nodes created' },
    ],
    reasoning_steps: [
      'Best docking mode (-8.4 kcal/mol) exceeds the -7.0 kcal/mol threshold for proceeding to refinement',
      'RMSD of 1.2A from reference pose indicates physically plausible binding mode',
      'Modes 3-5 (scores -7.6 to -6.8) are below threshold and recorded as negative data for future avoidance',
      'BRD4-JQ1-derivative edge weight increased from 0.81 to 0.89 based on strong docking evidence',
      'Convergence score updated from 0.65 to 0.72 - approaching 0.85 threshold',
    ],
    duration_ms: 2400,
    token_count: 876,
    status: 'completed',
    error_message: '',
    created_at: new Date(Date.now() - 4800000).toISOString(),
  },
];

export default function AgentReasoningTrace({ activities = mockActivities }: AgentReasoningTraceProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Agent Legend */}
      <div className="flex items-center gap-3 flex-wrap">
        {['biosynthesis', 'admet_skeptic', 'code_architect', 'memory_broker', 'orchestrator'].map((agent) => (
          <div key={agent} className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-md', getAgentBgColor(agent))}>
            <span className={getAgentColor(agent)}>{agentIcons[agent]}</span>
            <span className={cn('text-[10px] font-semibold', getAgentColor(agent))}>{getAgentLabel(agent)}</span>
          </div>
        ))}
      </div>

      {/* Activity Cards */}
      <div className="space-y-3">
        {activities.map((activity, i) => {
          const isExpanded = expandedId === activity.id;
          return (
            <div
              key={activity.id}
              className={cn('glass-panel rounded-xl overflow-hidden animate-slide-in', isExpanded && 'glow-cyan')}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : activity.id)}
                className="w-full flex items-start gap-3 p-4 text-left hover:bg-axiom-bg-tertiary/30 transition-colors"
              >
                <div className={cn('p-2 rounded-lg mt-0.5', getAgentBgColor(activity.agent_type), getAgentColor(activity.agent_type))}>
                  {agentIcons[activity.agent_type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('text-xs font-semibold', getAgentColor(activity.agent_type))}>
                      {getAgentLabel(activity.agent_type)}
                    </span>
                    <span className="text-[10px] text-axiom-border-secondary font-mono">
                      {formatRelativeTime(activity.created_at)}
                    </span>
                    {activity.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-axiom-emerald" />}
                    {activity.status === 'failed' && <XCircle className="w-3 h-3 text-axiom-red" />}
                    {activity.status === 'running' && (
                      <span className="flex items-center gap-1 text-[10px] text-axiom-cyan">
                        <span className="w-1.5 h-1.5 bg-axiom-cyan rounded-full animate-pulse" />
                        Running
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-axiom-border-secondary leading-relaxed line-clamp-2">{activity.action}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-axiom-border-secondary">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{activity.duration_ms}ms</span>
                    <span className="font-mono">{activity.token_count} tokens</span>
                  </div>
                </div>
                {isExpanded ? <ChevronDown className="w-4 h-4 text-axiom-border-secondary mt-2" /> : <ChevronRight className="w-4 h-4 text-axiom-border-secondary mt-2" />}
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-axiom-border p-4 space-y-4 animate-slide-in">
                  {/* Reasoning Steps */}
                  {activity.reasoning_steps.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Brain className="w-3 h-3 text-axiom-cyan" />
                        <span className="text-[10px] font-semibold text-axiom-cyan uppercase tracking-wider">Chain of Thought</span>
                      </div>
                      <div className="space-y-2 pl-4 border-l-2 border-axiom-cyan/20">
                        {activity.reasoning_steps.map((step, si) => (
                          <div key={si} className="relative">
                            <span className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-axiom-cyan/40 border border-axiom-cyan/60" />
                            <p className="text-xs text-axiom-border-secondary leading-relaxed">{String(step)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tool Calls */}
                  {activity.tool_calls.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Wrench className="w-3 h-3 text-axiom-amber" />
                        <span className="text-[10px] font-semibold text-axiom-amber uppercase tracking-wider">Tool Calls</span>
                      </div>
                      <div className="space-y-2">
                        {(activity.tool_calls as { name: string; arguments: Record<string, unknown>; result: string }[]).map((call, ci) => (
                          <div key={ci} className="p-3 rounded-lg bg-axiom-bg-tertiary border border-axiom-border">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-[10px] font-mono font-semibold text-axiom-amber">{call.name}</span>
                            </div>
                            <div className="text-[10px] text-axiom-border-secondary font-mono mb-1.5">
                              args: {JSON.stringify(call.arguments, null, 2)}
                            </div>
                            <div className="text-[10px] text-axiom-emerald font-mono">
                              result: {call.result}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input/Output Summary */}
                  {(activity.input_summary || activity.output_summary) && (
                    <div className="grid grid-cols-2 gap-3">
                      {activity.input_summary && (
                        <div className="p-3 rounded-lg bg-axiom-bg-tertiary">
                          <div className="text-[10px] font-semibold text-axiom-border-secondary uppercase tracking-wider mb-1">Input</div>
                          <p className="text-[10px] text-axiom-border-secondary font-mono">{activity.input_summary}</p>
                        </div>
                      )}
                      {activity.output_summary && (
                        <div className="p-3 rounded-lg bg-axiom-bg-tertiary">
                          <div className="text-[10px] font-semibold text-axiom-border-secondary uppercase tracking-wider mb-1">Output</div>
                          <p className="text-[10px] text-axiom-border-secondary font-mono">{activity.output_summary}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
