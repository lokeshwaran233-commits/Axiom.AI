import { Cpu, Clock, HardDrive, Activity, XCircle } from 'lucide-react';
import { cn, getStatusColor, getStatusBgColor, getEngineLabel, formatScore } from '../../lib/utils';
import type { SimulationJob } from '../../types';

interface SimulationResultsPanelProps {
  jobs: SimulationJob[];
}

// DEMO ONLY — all simulation data is mocked for demonstration purposes
const mockJobs: SimulationJob[] = [
  {
    id: 'sj1',
    hypothesis_version_id: 'v1',
    engine: 'autodock_vina',
    status: 'completed',
    fargate_task_arn: 'arn:aws:ecs:us-east-1:123:task/axiom-vina-abc123',
    s3_input_path: 's3://axiom-sim-artifacts/h1/v4/input/',
    s3_output_path: 's3://axiom-sim-artifacts/h1/v4/output/',
    docking_score: -8.4,
    binding_affinity_kcal: -9.2,
    rmsd: 1.2,
    rmsf: 0.8,
    simulation_log: `AutoDock Vina 1.2.3\n\nReceptor: PDB 6Y7R (BRD4 BD1)\nLigand: JQ1-derivative-v4\nGrid center: (12.4, -8.7, 22.1)\nGrid size: (28, 28, 28)\nExhaustiveness: 16\n\nMode | Affinity | RMSD l.b. | RMSD u.b.\n  1  |   -8.4   |    1.204   |    1.523\n  2  |   -7.9   |    1.876   |    2.134\n  3  |   -7.6   |    2.341   |    2.897\n  4  |   -7.2   |    3.102   |    3.456\n  5  |   -6.8   |    4.523   |    5.012\n\nBest mode: -8.4 kcal/mol\nRMSD from reference: 1.2 A`,
    error_message: '',
    compute_seconds: 342,
    started_at: new Date(Date.now() - 7200000).toISOString(),
    completed_at: new Date(Date.now() - 6800000).toISOString(),
    created_at: new Date(Date.now() - 7300000).toISOString(),
  },
  {
    id: 'sj2',
    hypothesis_version_id: 'v2',
    engine: 'gromacs',
    status: 'completed',
    fargate_task_arn: 'arn:aws:ecs:us-east-1:123:task/axiom-gmx-def456',
    s3_input_path: 's3://axiom-sim-artifacts/h2/v6/input/',
    s3_output_path: 's3://axiom-sim-artifacts/h2/v6/output/',
    docking_score: -7.8,
    binding_affinity_kcal: -8.1,
    rmsd: 1.8,
    rmsf: 1.1,
    simulation_log: `GROMACS 2024.1\n\nSystem: c-Fos/c-Jun AP-1 complex + allosteric modulator\nForce field: CHARMM36m\nSolvent: TIP3P water, 0.15M NaCl\nBox: dodecahedron, 1.0nm buffer\n\nEquilibration:\n  NVT: 100ps, 300K, Berendsen\n  NPT: 100ps, 1bar, Parrinello-Rahman\n\nProduction MD:\n  Duration: 100ns\n  Time step: 2fs\n  Frame save: 10ps\n\nResults:\n  RMSD (protein): 1.8 A (stable after 20ns)\n  RMSF (binding site): 0.8-1.4 A\n  MM-PBSA binding free energy: -8.1 +/- 0.6 kcal/mol\n  Hydrogen bonds (avg): 4.2\n  SASA change: -45.3 A^2`,
    error_message: '',
    compute_seconds: 14400,
    started_at: new Date(Date.now() - 86400000).toISOString(),
    completed_at: new Date(Date.now() - 72000000).toISOString(),
    created_at: new Date(Date.now() - 87000000).toISOString(),
  },
  {
    id: 'sj3',
    hypothesis_version_id: 'v3',
    engine: 'openmm',
    status: 'running',
    fargate_task_arn: 'arn:aws:ecs:us-east-1:123:task/axiom-omm-ghi789',
    s3_input_path: 's3://axiom-sim-artifacts/h3/v2/input/',
    s3_output_path: '',
    docking_score: 0,
    binding_affinity_kcal: 0,
    rmsd: 0,
    rmsf: 0,
    simulation_log: 'OpenMM 8.1.1 - GPU-accelerated MD in progress...\nEstimated time remaining: 2h 14m',
    error_message: '',
    compute_seconds: 5400,
    started_at: new Date(Date.now() - 5400000).toISOString(),
    completed_at: null,
    created_at: new Date(Date.now() - 5700000).toISOString(),
  },
  {
    id: 'sj4',
    hypothesis_version_id: 'v4',
    engine: 'autodock_vina',
    status: 'failed',
    fargate_task_arn: 'arn:aws:ecs:us-east-1:123:task/axiom-vina-jkl012',
    s3_input_path: 's3://axiom-sim-artifacts/h4/v1/input/',
    s3_output_path: '',
    docking_score: 0,
    binding_affinity_kcal: 0,
    rmsd: 0,
    rmsf: 0,
    simulation_log: 'AutoDock Vina 1.2.3\nError: Invalid PDB format - missing ATOM records for chain A',
    error_message: 'Invalid PDB format: missing ATOM records for chain A. Ensure receptor file contains valid protein structure.',
    compute_seconds: 12,
    started_at: new Date(Date.now() - 3600000).toISOString(),
    completed_at: null,
    created_at: new Date(Date.now() - 3700000).toISOString(),
  },
];

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function SimulationResultsPanel({ jobs = mockJobs }: SimulationResultsPanelProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Jobs', value: jobs.length, color: 'text-white' },
          { label: 'Completed', value: jobs.filter((j) => j.status === 'completed').length, color: 'text-axiom-emerald' },
          { label: 'Running', value: jobs.filter((j) => j.status === 'running').length, color: 'text-axiom-cyan' },
          { label: 'Failed', value: jobs.filter((j) => j.status === 'failed').length, color: 'text-axiom-red' },
        ].map((stat) => (
          <div key={stat.label} className="text-center p-3 rounded-lg glass-panel">
            <div className={cn('text-xl font-bold stat-value', stat.color)}>{stat.value}</div>
            <div className="text-[10px] text-axiom-border-secondary mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Job Cards */}
      <div className="space-y-3">
        {jobs.map((job, i) => (
          <div
            key={job.id}
            className={cn('glass-panel rounded-xl overflow-hidden animate-slide-in')}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Job Header */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn('p-2 rounded-lg', job.status === 'completed' ? 'bg-axiom-emerald/10' : job.status === 'running' ? 'bg-axiom-cyan/10' : job.status === 'failed' ? 'bg-axiom-red/10' : 'bg-axiom-bg-tertiary')}>
                    <Cpu className={cn('w-4 h-4', job.status === 'completed' ? 'text-axiom-emerald' : job.status === 'running' ? 'text-axiom-cyan' : job.status === 'failed' ? 'text-axiom-red' : 'text-axiom-border-secondary')} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{getEngineLabel(job.engine)}</div>
                    <div className="text-[10px] text-axiom-border-secondary font-mono">{job.id}</div>
                  </div>
                </div>
                <div className={cn('px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider', getStatusColor(job.status), getStatusBgColor(job.status))}>
                  {job.status}
                </div>
              </div>

              {/* Metrics Grid */}
              {job.status === 'completed' && (
                <div className="grid grid-cols-5 gap-3 mb-3">
                  <div className="text-center p-2 rounded-lg bg-axiom-bg-tertiary">
                    <div className="text-sm font-bold text-white stat-value">{formatScore(job.docking_score)}</div>
                    <div className="text-[10px] text-axiom-border-secondary">Docking</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-axiom-bg-tertiary">
                    <div className="text-sm font-bold text-white stat-value">{formatScore(job.binding_affinity_kcal)}</div>
                    <div className="text-[10px] text-axiom-border-secondary">kcal/mol</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-axiom-bg-tertiary">
                    <div className="text-sm font-bold text-white stat-value">{formatScore(job.rmsd)}A</div>
                    <div className="text-[10px] text-axiom-border-secondary">RMSD</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-axiom-bg-tertiary">
                    <div className="text-sm font-bold text-white stat-value">{formatScore(job.rmsf)}A</div>
                    <div className="text-[10px] text-axiom-border-secondary">RMSF</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-axiom-bg-tertiary">
                    <div className="text-sm font-bold text-white stat-value">{formatDuration(job.compute_seconds)}</div>
                    <div className="text-[10px] text-axiom-border-secondary">Compute</div>
                  </div>
                </div>
              )}

              {/* Running Progress */}
              {job.status === 'running' && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-axiom-cyan font-medium">Simulation in progress</span>
                    <span className="text-[10px] text-axiom-border-secondary font-mono">{formatDuration(job.compute_seconds)} elapsed</span>
                  </div>
                  <div className="h-1.5 bg-axiom-bg-tertiary rounded-full overflow-hidden">
                    <div className="h-full bg-axiom-cyan rounded-full animate-pulse-slow" style={{ width: '45%' }} />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {job.status === 'failed' && job.error_message && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-axiom-red/5 border border-axiom-red/20 mb-3">
                  <XCircle className="w-3.5 h-3.5 text-axiom-red mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-axiom-red leading-relaxed">{job.error_message}</p>
                </div>
              )}

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-[10px] text-axiom-border-secondary">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{job.started_at ? new Date(job.started_at).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  <span className="font-mono truncate max-w-[200px]">{job.s3_input_path}</span>
                </div>
              </div>
            </div>

            {/* Simulation Log */}
            {job.simulation_log && (
              <div className="border-t border-axiom-border">
                <div className="p-3 bg-axiom-bg-tertiary/50">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Activity className="w-3 h-3 text-axiom-border-secondary" />
                    <span className="text-[10px] font-semibold text-axiom-border-secondary uppercase tracking-wider">Simulation Log</span>
                  </div>
                  <pre className="text-[10px] text-axiom-border-secondary font-mono leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {job.simulation_log}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
