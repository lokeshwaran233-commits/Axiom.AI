import { useState } from 'react';
import { FlaskConical, Plus, X } from 'lucide-react';
import HypothesisForm from '../components/hypothesis/HypothesisForm';
import HypothesisCard from '../components/hypothesis/HypothesisCard';
import { EmptyState } from '../components/common/Skeleton';
import type { Hypothesis, HypothesisVersion, SimulationJob, HypothesisFormData } from '../types';

const mockVersions: Record<string, HypothesisVersion> = {
  h1: {
    id: 'v1',
    hypothesis_id: 'h1',
    version_number: 4,
    proposed_smiles: 'CCC1=NN(C)C2=C1C=CC(=C2)C(=O)NCC3=CC=C(C=C3)OCC4=CC(=CC=C4)S(=O)(=O)N',
    mechanism_text: 'Inhibits BRD4-c-Myc transcriptional axis by competitive binding to BD1/BD2 bromodomains, reducing c-Myc transcription. Para-fluoro substitution at position 4 mitigates hERG liability while maintaining BD2 selectivity.',
    admet_score: 0.78,
    docking_score: -8.4,
    binding_affinity_kcal: -9.2,
    confidence_score: 0.82,
    novelty_score: 0.71,
    literature_grounding_score: 0.88,
    agent_reasoning_trace: [],
    neptune_edge_ids: ['e7', 'e8'],
    biosecurity_clearance: true,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  h2: {
    id: 'v2',
    hypothesis_id: 'h2',
    version_number: 6,
    proposed_smiles: 'CC1=C(C2=C(C=C1)N(N=C2)C)C(=O)NC3=CC=C(C=C3)Cl',
    mechanism_text: 'Allosteric modulation of AP-1 complex via c-Fos/c-Jun dimerization interface disruption. Compound binds to leucine zipper domain, preventing DNA binding.',
    admet_score: 0.85,
    docking_score: -7.8,
    binding_affinity_kcal: -8.1,
    confidence_score: 0.91,
    novelty_score: 0.64,
    literature_grounding_score: 0.92,
    agent_reasoning_trace: [],
    neptune_edge_ids: ['e5', 'e6'],
    biosecurity_clearance: true,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  h3: {
    id: 'v3',
    hypothesis_id: 'h3',
    version_number: 2,
    proposed_smiles: 'C1=CC=C(C=C1)C2=NC3=C(C=CC(=C3)N)C(=N2)N4CCN(CC4)CC5=CC=CC=C5',
    mechanism_text: 'Type II kinase conformation stabilizer targeting BRAF V600E inactive state. Designed to minimize paradoxical MAPK activation in wild-type BRAF cells.',
    admet_score: 0.62,
    docking_score: -6.9,
    binding_affinity_kcal: -7.4,
    confidence_score: 0.45,
    novelty_score: 0.83,
    literature_grounding_score: 0.71,
    agent_reasoning_trace: [],
    neptune_edge_ids: [],
    biosecurity_clearance: false,
    created_at: new Date(Date.now() - 10800000).toISOString(),
  },
};

const mockSimJobs: Record<string, SimulationJob[]> = {
  h1: [
    {
      id: 'sj1',
      hypothesis_version_id: 'v1',
      engine: 'autodock_vina',
      status: 'completed',
      fargate_task_arn: 'arn:aws:ecs:us-east-1:123:task/axiom-sim-abc',
      s3_input_path: 's3://axiom-sim-artifacts/h1/v4/input/',
      s3_output_path: 's3://axiom-sim-artifacts/h1/v4/output/',
      docking_score: -8.4,
      binding_affinity_kcal: -9.2,
      rmsd: 1.2,
      rmsf: 0.8,
      simulation_log: 'Docking completed successfully. Best pose: mode 1, affinity -8.4 kcal/mol',
      error_message: '',
      compute_seconds: 342,
      started_at: new Date(Date.now() - 7200000).toISOString(),
      completed_at: new Date(Date.now() - 6800000).toISOString(),
      created_at: new Date(Date.now() - 7300000).toISOString(),
    },
  ],
  h2: [
    {
      id: 'sj2',
      hypothesis_version_id: 'v2',
      engine: 'gromacs',
      status: 'completed',
      fargate_task_arn: 'arn:aws:ecs:us-east-1:123:task/axiom-sim-def',
      s3_input_path: 's3://axiom-sim-artifacts/h2/v6/input/',
      s3_output_path: 's3://axiom-sim-artifacts/h2/v6/output/',
      docking_score: -7.8,
      binding_affinity_kcal: -8.1,
      rmsd: 1.8,
      rmsf: 1.1,
      simulation_log: '100ns MD simulation completed. RMSD stable after 20ns. Binding free energy via MM-PBSA: -8.1 kcal/mol',
      error_message: '',
      compute_seconds: 14400,
      started_at: new Date(Date.now() - 86400000).toISOString(),
      completed_at: new Date(Date.now() - 72000000).toISOString(),
      created_at: new Date(Date.now() - 87000000).toISOString(),
    },
  ],
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
];

export default function HypothesisWorkspacePage() {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hypotheses, setHypotheses] = useState(mockHypotheses);

  const handleSubmit = async (data: HypothesisFormData) => {
    setIsSubmitting(true);
    // Simulate pipeline launch
    await new Promise((r) => setTimeout(r, 2000));
    const newHypothesis: Hypothesis = {
      id: `h${Date.now()}`,
      workspace_id: 'w1',
      target_gene: data.targetGene,
      target_protein: data.targetProtein,
      objective_text: data.objective,
      current_state_json: {},
      iteration_count: 0,
      status: 'generating',
      convergence_score: 0,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setHypotheses([newHypothesis, ...hypotheses]);
    setIsSubmitting(false);
    setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-axiom-border-secondary">
            {hypotheses.length} hypotheses across all workspaces
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-axiom-cyan/10 text-axiom-cyan border border-axiom-cyan/20 hover:bg-axiom-cyan/20 transition-all"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Hypothesis'}
        </button>
      </div>

      {/* New Hypothesis Form */}
      {showForm && (
        <div className="glass-panel rounded-xl p-6 animate-slide-in glow-cyan">
          <div className="flex items-center gap-2 mb-5">
            <FlaskConical className="w-4 h-4 text-axiom-cyan" />
            <h2 className="text-sm font-semibold text-white">New Hypothesis</h2>
          </div>
          <HypothesisForm onSubmit={handleSubmit} isLoading={isSubmitting} />
        </div>
      )}

      {/* Hypothesis Cards */}
      <div className="space-y-4">
        {hypotheses.length === 0 ? (
          <EmptyState
            icon={FlaskConical}
            title="No active hypotheses"
            description="Start by adding a new hypothesis to begin your research pipeline."
            action={{ label: 'New Hypothesis', onClick: () => setShowForm(true) }}
          />
        ) : (
          hypotheses.map((h) => (
            <HypothesisCard
              key={h.id}
              hypothesis={h}
              latestVersion={mockVersions[h.id] || null}
              simulationJobs={mockSimJobs[h.id] || []}
            />
          ))
        )}
      </div>
    </div>
  );
}
