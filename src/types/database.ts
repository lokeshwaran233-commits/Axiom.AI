export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  institution: string;
  role: 'researcher' | 'pi' | 'admin';
  tier: 'academic' | 'biotech_pro' | 'pharma_enterprise';
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  indication_focus: string;
  neptune_partition_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type HypothesisStatus =
  | 'draft'
  | 'generating'
  | 'critiquing'
  | 'coding'
  | 'simulating'
  | 'refining'
  | 'converged'
  | 'failed'
  | 'archived';

export interface Hypothesis {
  id: string;
  workspace_id: string;
  target_gene: string;
  target_protein: string;
  objective_text: string;
  current_state_json: Json;
  iteration_count: number;
  status: HypothesisStatus;
  convergence_score: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface HypothesisVersion {
  id: string;
  hypothesis_id: string;
  version_number: number;
  proposed_smiles: string;
  mechanism_text: string;
  admet_score: number;
  docking_score: number;
  binding_affinity_kcal: number;
  confidence_score: number;
  novelty_score: number;
  literature_grounding_score: number;
  agent_reasoning_trace: Json[];
  neptune_edge_ids: string[];
  biosecurity_clearance: boolean;
  created_at: string;
}

export type SimulationEngine = 'autodock_vina' | 'gromacs' | 'openmm';

export type SimulationJobStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface SimulationJob {
  id: string;
  hypothesis_version_id: string;
  engine: SimulationEngine;
  status: SimulationJobStatus;
  fargate_task_arn: string;
  s3_input_path: string;
  s3_output_path: string;
  docking_score: number;
  binding_affinity_kcal: number;
  rmsd: number;
  rmsf: number;
  simulation_log: string;
  error_message: string;
  compute_seconds: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface LiteratureChunk {
  id: string;
  paper_id: string;
  chunk_index: number;
  content: string;
  paper_title: string;
  paper_journal: string;
  paper_year: number | null;
  paper_doi: string;
  entity_mentions: Json[];
  paper_metadata: Json;
  created_at: string;
}

export type AgentType =
  | 'biosynthesis'
  | 'admet_skeptic'
  | 'code_architect'
  | 'memory_broker'
  | 'orchestrator';

export interface AgentActivityLog {
  id: string;
  hypothesis_id: string | null;
  workspace_id: string | null;
  agent_type: AgentType;
  action: string;
  input_summary: string;
  output_summary: string;
  tool_calls: Json[];
  reasoning_steps: Json[];
  duration_ms: number;
  token_count: number;
  status: 'running' | 'completed' | 'failed';
  error_message: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  workspace_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Json;
  ip_address: string;
  user_agent: string;
  created_at: string;
}
