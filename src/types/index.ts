export type {
  Profile,
  Workspace,
  Hypothesis,
  HypothesisStatus,
  HypothesisVersion,
  SimulationJobStatus,
  SimulationJob,
  LiteratureChunk,
  AgentActivityLog,
  AuditLog,
  Json,
} from './database';

export type SimulationEngine = 'autodock_vina' | 'gromacs' | 'openmm';

export type AgentType = 'biosynthesis' | 'admet_skeptic' | 'code_architect' | 'memory_broker' | 'orchestrator' | 'simulation_dispatcher';

export type TraceAction = 'TOOL_CALL' | 'CRITIQUE' | 'GENERATION' | 'MEMORY_WRITE';

export interface TraceEntry {
  id: string;
  agent: AgentType;
  timestamp: string;
  action: TraceAction;
  tool: string;
  hypothesis: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  reasoning: string;
  tokensIn: number;
  tokensOut: number;
}

export interface SimulationRow {
  id: string;
  hypothesis: string;
  target: string;
  compoundId: string;
  type: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'QUEUED';
  dockingScore: string | null;
  rmsd: string | null;
  runtime: string;
  compute: string;
  timestamp: string;
  action: string;
  receptorPdb?: string;
  gridCenter?: number[];
  exhaustiveness?: number;
  numModes?: number;
  cpu?: number;
  s3InputPath?: string;
  s3OutputPath?: string;
  errorMessage?: string;
  poses?: { mode: number; affinity: number; rmsdLb: number; rmsdUb: number }[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'protein' | 'compound' | 'gene' | 'pathway' | 'disease';
  properties: Record<string, unknown>;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: 'inhibits' | 'inhibited_by' | 'activates' | 'transcriptionally_activates' | 'binds_to' | 'bromodomain_binds' | 'expresses' | 'associated_with' | 'metabolizes' | 'dimerizes_with' | 'co_expressed_with' | 'forms_complex_with' | 'constitutively_activates' | 'covalently_inhibited_by' | 'induces' | 'ubiquitinates' | 'chaperones' | 'suppresses' | 'regulates';
  weight: number;
  evidence_count: number;
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface AgentStep {
  id: string;
  agent: AgentType;
  action: string;
  timestamp: string;
  input: string;
  output: string;
  toolCalls: { name: string; arguments: Record<string, unknown>; result: string }[];
  reasoning: string[];
  durationMs: number;
  status: 'running' | 'completed' | 'failed';
}

export interface HypothesisFormData {
  targetGene: string;
  targetProtein: string;
  objective: string;
  indication: string;
  simulationEngine: SimulationEngine;
}

export interface DashboardStats {
  activeHypotheses: number;
  convergedHypotheses: number;
  runningSimulations: number;
  totalLiteratureChunks: number;
  averageDockingScore: number;
  averageConvergenceIterations: number;
}

export interface TimelineEvent {
  id: string;
  type: 'hypothesis_created' | 'agent_action' | 'simulation_started' | 'simulation_completed' | 'version_generated' | 'convergence_reached';
  title: string;
  description: string;
  timestamp: string;
  agentType?: AgentType;
  metadata?: Record<string, unknown>;
}
