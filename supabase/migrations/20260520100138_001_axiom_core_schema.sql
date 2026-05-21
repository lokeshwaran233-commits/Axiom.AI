/*
  # Axiom.AI Core Schema - Initial Database Setup

  1. New Tables
    - `profiles` - User profiles extending auth.users with institution, role, and tier info
    - `workspaces` - Research workspaces for organizing hypothesis sessions
    - `hypotheses` - Core hypothesis records with target gene/protein, objective, and state
    - `hypothesis_versions` - Versioned snapshots of each hypothesis iteration with scores
    - `simulation_jobs` - Molecular simulation job records (GROMACS, AutoDock Vina, OpenMM)
    - `literature_chunks` - Embedded literature segments for RAG retrieval
    - `agent_activity_log` - Real-time agent reasoning and tool call audit trail
    - `audit_logs` - System-wide audit trail for compliance and security

  2. Security
    - Enable RLS on all tables
    - Users can only access their own profile data
    - Workspace members can access workspace data based on membership
    - All policies require authentication

  3. Important Notes
    - All tables use UUID primary keys via gen_random_uuid()
    - Timestamps use timestamptz with DEFAULT now()
    - JSONB columns store flexible structured data (agent traces, metadata)
    - Hypothesis versions enable full iteration history and rollback
*/

-- ============================================
-- PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  institution text DEFAULT '',
  role text DEFAULT 'researcher' CHECK (role IN ('researcher', 'pi', 'admin')),
  tier text DEFAULT 'academic' CHECK (tier IN ('academic', 'biotech_pro', 'pharma_enterprise')),
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- WORKSPACES
-- ============================================
CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  indication_focus text DEFAULT '',
  neptune_partition_id text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace owners can read own workspaces"
  ON workspaces FOR SELECT
  TO authenticated
  USING (owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Workspace owners can update own workspaces"
  ON workspaces FOR UPDATE
  TO authenticated
  USING (owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Workspace owners can insert workspaces"
  ON workspaces FOR INSERT
  TO authenticated
  WITH CHECK (owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Workspace owners can delete own workspaces"
  ON workspaces FOR DELETE
  TO authenticated
  USING (owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ============================================
-- HYPOTHESES
-- ============================================
CREATE TABLE IF NOT EXISTS hypotheses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  target_gene text NOT NULL,
  target_protein text DEFAULT '',
  objective_text text NOT NULL,
  current_state_json jsonb DEFAULT '{}'::jsonb,
  iteration_count integer DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'critiquing', 'coding', 'simulating', 'refining', 'converged', 'failed', 'archived')),
  convergence_score numeric DEFAULT 0,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hypotheses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can read hypotheses"
  ON hypotheses FOR SELECT
  TO authenticated
  USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

CREATE POLICY "Workspace members can insert hypotheses"
  ON hypotheses FOR INSERT
  TO authenticated
  WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

CREATE POLICY "Workspace members can update hypotheses"
  ON hypotheses FOR UPDATE
  TO authenticated
  USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())))
  WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

CREATE POLICY "Workspace members can delete hypotheses"
  ON hypotheses FOR DELETE
  TO authenticated
  USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

-- ============================================
-- HYPOTHESIS VERSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS hypothesis_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hypothesis_id uuid NOT NULL REFERENCES hypotheses(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  proposed_smiles text DEFAULT '',
  mechanism_text text DEFAULT '',
  admet_score numeric DEFAULT 0,
  docking_score numeric DEFAULT 0,
  binding_affinity_kcal numeric DEFAULT 0,
  confidence_score numeric DEFAULT 0,
  novelty_score numeric DEFAULT 0,
  literature_grounding_score numeric DEFAULT 0,
  agent_reasoning_trace jsonb DEFAULT '[]'::jsonb,
  neptune_edge_ids text[] DEFAULT '{}',
  biosecurity_clearance boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hypothesis_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can read hypothesis versions"
  ON hypothesis_versions FOR SELECT
  TO authenticated
  USING (hypothesis_id IN (SELECT id FROM hypotheses WHERE workspace_id IN (SELECT id FROM workspaces WHERE owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))));

CREATE POLICY "Workspace members can insert hypothesis versions"
  ON hypothesis_versions FOR INSERT
  TO authenticated
  WITH CHECK (hypothesis_id IN (SELECT id FROM hypotheses WHERE workspace_id IN (SELECT id FROM workspaces WHERE owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))));

CREATE POLICY "Workspace members can update hypothesis versions"
  ON hypothesis_versions FOR UPDATE
  TO authenticated
  USING (hypothesis_id IN (SELECT id FROM hypotheses WHERE workspace_id IN (SELECT id FROM workspaces WHERE owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))))
  WITH CHECK (hypothesis_id IN (SELECT id FROM hypotheses WHERE workspace_id IN (SELECT id FROM workspaces WHERE owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))));

-- ============================================
-- SIMULATION JOBS
-- ============================================
CREATE TABLE IF NOT EXISTS simulation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hypothesis_version_id uuid NOT NULL REFERENCES hypothesis_versions(id) ON DELETE CASCADE,
  engine text NOT NULL CHECK (engine IN ('autodock_vina', 'gromacs', 'openmm')),
  status text DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
  fargate_task_arn text DEFAULT '',
  s3_input_path text DEFAULT '',
  s3_output_path text DEFAULT '',
  docking_score numeric DEFAULT 0,
  binding_affinity_kcal numeric DEFAULT 0,
  rmsd numeric DEFAULT 0,
  rmsf numeric DEFAULT 0,
  simulation_log text DEFAULT '',
  error_message text DEFAULT '',
  compute_seconds integer DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE simulation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can read simulation jobs"
  ON simulation_jobs FOR SELECT
  TO authenticated
  USING (hypothesis_version_id IN (SELECT id FROM hypothesis_versions WHERE hypothesis_id IN (SELECT id FROM hypotheses WHERE workspace_id IN (SELECT id FROM workspaces WHERE owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())))));

CREATE POLICY "Workspace members can insert simulation jobs"
  ON simulation_jobs FOR INSERT
  TO authenticated
  WITH CHECK (hypothesis_version_id IN (SELECT id FROM hypothesis_versions WHERE hypothesis_id IN (SELECT id FROM hypotheses WHERE workspace_id IN (SELECT id FROM workspaces WHERE owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())))));

CREATE POLICY "Workspace members can update simulation jobs"
  ON simulation_jobs FOR UPDATE
  TO authenticated
  USING (hypothesis_version_id IN (SELECT id FROM hypothesis_versions WHERE hypothesis_id IN (SELECT id FROM hypotheses WHERE workspace_id IN (SELECT id FROM workspaces WHERE owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())))))
  WITH CHECK (hypothesis_version_id IN (SELECT id FROM hypothesis_versions WHERE hypothesis_id IN (SELECT id FROM hypotheses WHERE workspace_id IN (SELECT id FROM workspaces WHERE owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())))));

-- ============================================
-- LITERATURE CHUNKS (RAG)
-- ============================================
CREATE TABLE IF NOT EXISTS literature_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id text NOT NULL,
  chunk_index integer NOT NULL,
  content text NOT NULL,
  paper_title text DEFAULT '',
  paper_journal text DEFAULT '',
  paper_year integer,
  paper_doi text DEFAULT '',
  entity_mentions jsonb DEFAULT '[]'::jsonb,
  paper_metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE literature_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read literature"
  ON literature_chunks FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- AGENT ACTIVITY LOG
-- ============================================
CREATE TABLE IF NOT EXISTS agent_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hypothesis_id uuid REFERENCES hypotheses(id) ON DELETE SET NULL,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE SET NULL,
  agent_type text NOT NULL CHECK (agent_type IN ('biosynthesis', 'admet_skeptic', 'code_architect', 'memory_broker', 'orchestrator')),
  action text NOT NULL,
  input_summary text DEFAULT '',
  output_summary text DEFAULT '',
  tool_calls jsonb DEFAULT '[]'::jsonb,
  reasoning_steps jsonb DEFAULT '[]'::jsonb,
  duration_ms integer DEFAULT 0,
  token_count integer DEFAULT 0,
  status text DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  error_message text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE agent_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can read agent activity"
  ON agent_activity_log FOR SELECT
  TO authenticated
  USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

CREATE POLICY "Workspace members can insert agent activity"
  ON agent_activity_log FOR INSERT
  TO authenticated
  WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

CREATE POLICY "Workspace members can update agent activity"
  ON agent_activity_log FOR UPDATE
  TO authenticated
  USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id IN (SELECT id FROM workspaces WHERE owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))))
  WITH CHECK (workspace_id IN (SELECT id FROM workspaces WHERE owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

-- ============================================
-- AUDIT LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text DEFAULT '',
  user_agent text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_hypotheses_workspace ON hypotheses(workspace_id);
CREATE INDEX IF NOT EXISTS idx_hypotheses_status ON hypotheses(status);
CREATE INDEX IF NOT EXISTS idx_hypothesis_versions_hypothesis ON hypothesis_versions(hypothesis_id);
CREATE INDEX IF NOT EXISTS idx_simulation_jobs_version ON simulation_jobs(hypothesis_version_id);
CREATE INDEX IF NOT EXISTS idx_simulation_jobs_status ON simulation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_literature_chunks_paper ON literature_chunks(paper_id);
CREATE INDEX IF NOT EXISTS idx_agent_activity_hypothesis ON agent_activity_log(hypothesis_id);
CREATE INDEX IF NOT EXISTS idx_agent_activity_workspace ON agent_activity_log(workspace_id);
CREATE INDEX IF NOT EXISTS idx_agent_activity_created ON agent_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================
-- ENABLE VECTOR EXTENSION FOR RAG
-- ============================================
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to literature_chunks for vector similarity search
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'literature_chunks' AND column_name = 'embedding'
  ) THEN
    ALTER TABLE literature_chunks ADD COLUMN embedding vector(1536);
  END IF;
END $$;

-- Create IVFFlat index for approximate nearest neighbor search
CREATE INDEX IF NOT EXISTS idx_literature_chunks_embedding ON literature_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
