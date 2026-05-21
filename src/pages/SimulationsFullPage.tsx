import { useState, useMemo } from 'react';
import {
  Cpu,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  AlertTriangle,
  ExternalLink,
  DollarSign,
  BarChart3,
} from 'lucide-react';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { EmptyState } from '../components/common/Skeleton';
import StatusBadge from '../components/common/StatusBadge';
import { cn, formatRelativeTime } from '../lib/utils';
import type { SimulationRow } from '../types';

const simulationRows: SimulationRow[] = [
  {
    id: 'fargate-0094', hypothesis: 'c-Myc/MYC', target: 'BRD4 BD2', compoundId: 'JQ1-PF-v4',
    type: 'Molecular Docking', status: 'RUNNING', dockingScore: null, rmsd: null,
    runtime: '4m elapsed', compute: 'c5.4xlarge', timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    action: 'View Logs', receptorPdb: '6Y7R', gridCenter: [12.4, -8.7, 22.1], exhaustiveness: 16, numModes: 9, cpu: 8,
    s3InputPath: 's3://axiom-sim/fargate-0094/input/',
    poses: [],
  },
  {
    id: 'fargate-0093', hypothesis: 'KRAS G12C', target: 'KRAS G12C', compoundId: 'AMG-510-deriv-v3',
    type: 'Molecular Docking', status: 'RUNNING', dockingScore: null, rmsd: null,
    runtime: '11m elapsed', compute: 'c5.4xlarge', timestamp: new Date(Date.now() - 11 * 60000).toISOString(),
    action: 'View Logs', receptorPdb: '7G21', gridCenter: [14.2, 3.1, -6.8], exhaustiveness: 32, numModes: 9, cpu: 8,
    s3InputPath: 's3://axiom-sim/fargate-0093/input/',
    poses: [],
  },
  {
    id: 'fargate-0092', hypothesis: 'c-Fos/FOS', target: 'c-Fos/c-Jun LZ', compoundId: 'LZD-allosteric-v3',
    type: 'Molecular Docking', status: 'COMPLETED', dockingScore: '-8.1 kcal/mol', rmsd: '0.9A',
    runtime: '16m', compute: 'c5.4xlarge', timestamp: new Date(Date.now() - 28 * 60000).toISOString(),
    action: 'View Report', receptorPdb: '1FOS', gridCenter: [5.3, -12.1, 8.7], exhaustiveness: 16, numModes: 9, cpu: 8,
    s3InputPath: 's3://axiom-sim/fargate-0092/input/', s3OutputPath: 's3://axiom-sim/fargate-0092/output/',
    poses: [
      { mode: 1, affinity: -8.1, rmsdLb: 0.0, rmsdUb: 0.9 },
      { mode: 2, affinity: -7.6, rmsdLb: 1.2, rmsdUb: 2.1 },
      { mode: 3, affinity: -7.3, rmsdLb: 1.8, rmsdUb: 2.9 },
      { mode: 4, affinity: -7.0, rmsdLb: 2.4, rmsdUb: 3.5 },
      { mode: 5, affinity: -6.8, rmsdLb: 3.1, rmsdUb: 4.2 },
      { mode: 6, affinity: -6.5, rmsdLb: 4.0, rmsdUb: 5.1 },
      { mode: 7, affinity: -6.2, rmsdLb: 4.8, rmsdUb: 5.9 },
      { mode: 8, affinity: -5.9, rmsdLb: 5.5, rmsdUb: 6.7 },
      { mode: 9, affinity: -5.6, rmsdLb: 6.2, rmsdUb: 7.4 },
    ],
  },
  {
    id: 'fargate-0091', hypothesis: 'c-Myc/MYC', target: 'BRD4 BD2', compoundId: 'JQ1-triazole-v1',
    type: 'Molecular Docking', status: 'COMPLETED', dockingScore: '-8.4 kcal/mol', rmsd: '1.2A',
    runtime: '18m', compute: 'c5.4xlarge', timestamp: new Date(Date.now() - 47 * 60000).toISOString(),
    action: 'View Report', receptorPdb: '6Y7R', gridCenter: [12.4, -8.7, 22.1], exhaustiveness: 16, numModes: 9, cpu: 8,
    s3InputPath: 's3://axiom-sim/fargate-0091/input/', s3OutputPath: 's3://axiom-sim/fargate-0091/output/',
    poses: [
      { mode: 1, affinity: -8.4, rmsdLb: 0.0, rmsdUb: 1.2 },
      { mode: 2, affinity: -7.9, rmsdLb: 1.5, rmsdUb: 2.3 },
      { mode: 3, affinity: -7.5, rmsdLb: 2.1, rmsdUb: 3.2 },
      { mode: 4, affinity: -7.2, rmsdLb: 2.8, rmsdUb: 3.9 },
      { mode: 5, affinity: -6.9, rmsdLb: 3.5, rmsdUb: 4.6 },
      { mode: 6, affinity: -6.6, rmsdLb: 4.2, rmsdUb: 5.3 },
      { mode: 7, affinity: -6.3, rmsdLb: 5.0, rmsdUb: 6.1 },
      { mode: 8, affinity: -6.0, rmsdLb: 5.7, rmsdUb: 6.8 },
      { mode: 9, affinity: -5.7, rmsdLb: 6.4, rmsdUb: 7.6 },
    ],
  },
  {
    id: 'fargate-0090', hypothesis: 'BRAF V600E', target: 'BRAF kinase', compoundId: 'sorafenib-HB-v2',
    type: 'Molecular Docking', status: 'COMPLETED', dockingScore: '-7.4 kcal/mol', rmsd: '1.8A',
    runtime: '21m', compute: 'c5.4xlarge', timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
    action: 'View Report', receptorPdb: '3OG7', gridCenter: [-8.1, 2.3, 15.6], exhaustiveness: 16, numModes: 9, cpu: 8,
    s3InputPath: 's3://axiom-sim/fargate-0090/input/', s3OutputPath: 's3://axiom-sim/fargate-0090/output/',
    poses: [
      { mode: 1, affinity: -7.4, rmsdLb: 0.0, rmsdUb: 1.8 },
      { mode: 2, affinity: -7.0, rmsdLb: 2.0, rmsdUb: 3.1 },
      { mode: 3, affinity: -6.7, rmsdLb: 2.8, rmsdUb: 3.9 },
      { mode: 4, affinity: -6.4, rmsdLb: 3.5, rmsdUb: 4.6 },
      { mode: 5, affinity: -6.1, rmsdLb: 4.2, rmsdUb: 5.3 },
      { mode: 6, affinity: -5.8, rmsdLb: 5.0, rmsdUb: 6.1 },
      { mode: 7, affinity: -5.5, rmsdLb: 5.7, rmsdUb: 6.8 },
      { mode: 8, affinity: -5.2, rmsdLb: 6.4, rmsdUb: 7.5 },
      { mode: 9, affinity: -4.9, rmsdLb: 7.1, rmsdUb: 8.2 },
    ],
  },
  {
    id: 'fargate-0089', hypothesis: 'c-Fos/FOS', target: 'c-Fos/c-Jun LZ', compoundId: 'LZD-allosteric-v2',
    type: 'Molecular Docking', status: 'COMPLETED', dockingScore: '-7.8 kcal/mol', rmsd: '1.4A',
    runtime: '19m', compute: 'c5.4xlarge', timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
    action: 'View Report', receptorPdb: '1FOS', gridCenter: [5.3, -12.1, 8.7], exhaustiveness: 16, numModes: 9, cpu: 8,
    s3InputPath: 's3://axiom-sim/fargate-0089/input/', s3OutputPath: 's3://axiom-sim/fargate-0089/output/',
    poses: [
      { mode: 1, affinity: -7.8, rmsdLb: 0.0, rmsdUb: 1.4 },
      { mode: 2, affinity: -7.3, rmsdLb: 1.7, rmsdUb: 2.6 },
      { mode: 3, affinity: -6.9, rmsdLb: 2.4, rmsdUb: 3.5 },
      { mode: 4, affinity: -6.6, rmsdLb: 3.1, rmsdUb: 4.2 },
      { mode: 5, affinity: -6.3, rmsdLb: 3.8, rmsdUb: 4.9 },
      { mode: 6, affinity: -6.0, rmsdLb: 4.5, rmsdUb: 5.6 },
      { mode: 7, affinity: -5.7, rmsdLb: 5.2, rmsdUb: 6.3 },
      { mode: 8, affinity: -5.4, rmsdLb: 5.9, rmsdUb: 7.0 },
      { mode: 9, affinity: -5.1, rmsdLb: 6.6, rmsdUb: 7.7 },
    ],
  },
  {
    id: 'fargate-0088', hypothesis: 'KRAS G12C', target: 'KRAS G12C', compoundId: 'sotorasib-deriv-v2',
    type: 'Molecular Docking', status: 'FAILED', dockingScore: null, rmsd: null,
    runtime: '8m', compute: 'c5.4xlarge', timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    action: 'View Error', receptorPdb: '7G21', gridCenter: [14.2, 3.1, -6.8], exhaustiveness: 16, numModes: 9, cpu: 8,
    s3InputPath: 's3://axiom-sim/fargate-0088/input/',
    errorMessage: 'Fargate task exited with code 137 (OOM). Ligand PDBQT contained 42 rotatable bonds exceeding Vina limit.',
  },
  {
    id: 'fargate-0087', hypothesis: 'c-Myc/MYC', target: 'BRD4 BD1', compoundId: 'JQ1-base',
    type: 'Molecular Docking', status: 'COMPLETED', dockingScore: '-6.9 kcal/mol', rmsd: '2.1A',
    runtime: '14m', compute: 'c5.2xlarge', timestamp: new Date(Date.now() - 150 * 60000).toISOString(),
    action: 'View Report', receptorPdb: '6Y7R', gridCenter: [12.4, -8.7, 22.1], exhaustiveness: 8, numModes: 9, cpu: 4,
    s3InputPath: 's3://axiom-sim/fargate-0087/input/', s3OutputPath: 's3://axiom-sim/fargate-0087/output/',
    poses: [
      { mode: 1, affinity: -6.9, rmsdLb: 0.0, rmsdUb: 2.1 },
      { mode: 2, affinity: -6.5, rmsdLb: 2.3, rmsdUb: 3.4 },
      { mode: 3, affinity: -6.2, rmsdLb: 3.0, rmsdUb: 4.1 },
      { mode: 4, affinity: -5.9, rmsdLb: 3.7, rmsdUb: 4.8 },
      { mode: 5, affinity: -5.6, rmsdLb: 4.4, rmsdUb: 5.5 },
      { mode: 6, affinity: -5.3, rmsdLb: 5.1, rmsdUb: 6.2 },
      { mode: 7, affinity: -5.0, rmsdLb: 5.8, rmsdUb: 6.9 },
      { mode: 8, affinity: -4.7, rmsdLb: 6.5, rmsdUb: 7.6 },
      { mode: 9, affinity: -4.4, rmsdLb: 7.2, rmsdUb: 8.3 },
    ],
  },
  {
    id: 'fargate-0086', hypothesis: 'BRAF V600E', target: 'BRAF kinase', compoundId: 'vemurafenib-v1',
    type: 'Molecular Docking', status: 'COMPLETED', dockingScore: '-9.2 kcal/mol', rmsd: '0.7A',
    runtime: '17m', compute: 'c5.4xlarge', timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
    action: 'View Report', receptorPdb: '3OG7', gridCenter: [-8.1, 2.3, 15.6], exhaustiveness: 32, numModes: 9, cpu: 8,
    s3InputPath: 's3://axiom-sim/fargate-0086/input/', s3OutputPath: 's3://axiom-sim/fargate-0086/output/',
    poses: [
      { mode: 1, affinity: -9.2, rmsdLb: 0.0, rmsdUb: 0.7 },
      { mode: 2, affinity: -8.7, rmsdLb: 0.9, rmsdUb: 1.8 },
      { mode: 3, affinity: -8.3, rmsdLb: 1.6, rmsdUb: 2.7 },
      { mode: 4, affinity: -7.9, rmsdLb: 2.3, rmsdUb: 3.4 },
      { mode: 5, affinity: -7.5, rmsdLb: 3.0, rmsdUb: 4.1 },
      { mode: 6, affinity: -7.1, rmsdLb: 3.7, rmsdUb: 4.8 },
      { mode: 7, affinity: -6.7, rmsdLb: 4.4, rmsdUb: 5.5 },
      { mode: 8, affinity: -6.3, rmsdLb: 5.1, rmsdUb: 6.2 },
      { mode: 9, affinity: -5.9, rmsdLb: 5.8, rmsdUb: 6.9 },
    ],
  },
  {
    id: 'fargate-0085', hypothesis: 'c-Fos/FOS', target: 'AP-1 complex', compoundId: 'AP1-pep-disruptor-v1',
    type: 'MD Simulation', status: 'COMPLETED', dockingScore: '-7.1 kcal/mol', rmsd: '1.1A',
    runtime: '2h 14m', compute: 'r5.2xlarge', timestamp: new Date(Date.now() - 300 * 60000).toISOString(),
    action: 'View Report', receptorPdb: '1FOS', gridCenter: [5.3, -12.1, 8.7], exhaustiveness: 16, numModes: 9, cpu: 8,
    s3InputPath: 's3://axiom-sim/fargate-0085/input/', s3OutputPath: 's3://axiom-sim/fargate-0085/output/',
    poses: [
      { mode: 1, affinity: -7.1, rmsdLb: 0.0, rmsdUb: 1.1 },
      { mode: 2, affinity: -6.7, rmsdLb: 1.3, rmsdUb: 2.4 },
      { mode: 3, affinity: -6.3, rmsdLb: 2.0, rmsdUb: 3.1 },
      { mode: 4, affinity: -6.0, rmsdLb: 2.7, rmsdUb: 3.8 },
      { mode: 5, affinity: -5.7, rmsdLb: 3.4, rmsdUb: 4.5 },
      { mode: 6, affinity: -5.4, rmsdLb: 4.1, rmsdUb: 5.2 },
      { mode: 7, affinity: -5.1, rmsdLb: 4.8, rmsdUb: 5.9 },
      { mode: 8, affinity: -4.8, rmsdLb: 5.5, rmsdUb: 6.6 },
      { mode: 9, affinity: -4.5, rmsdLb: 6.2, rmsdUb: 7.3 },
    ],
  },
  {
    id: 'fargate-0084', hypothesis: 'KRAS G12C', target: 'KRAS G12C', compoundId: 'AMG-510-base',
    type: 'Molecular Docking', status: 'FAILED', dockingScore: null, rmsd: null,
    runtime: '3m', compute: 'c5.4xlarge', timestamp: new Date(Date.now() - 360 * 60000).toISOString(),
    action: 'View Error', receptorPdb: '6OIM', gridCenter: [14.2, 3.1, -6.8], exhaustiveness: 16, numModes: 9, cpu: 8,
    s3InputPath: 's3://axiom-sim/fargate-0084/input/',
    errorMessage: 'Invalid PDB format: missing ATOM records in receptor file. Expected 6OIM.pdb but received truncated file (0 bytes).',
  },
  {
    id: 'fargate-0083', hypothesis: 'c-Myc/MYC', target: 'c-Myc/Max PPI', compoundId: 'MRTX-analog-v1',
    type: 'MD Simulation', status: 'COMPLETED', dockingScore: '-9.6 kcal/mol', rmsd: '0.6A',
    runtime: '3h 42m', compute: 'r5.4xlarge', timestamp: new Date(Date.now() - 480 * 60000).toISOString(),
    action: 'View Report', receptorPdb: '6Y7R', gridCenter: [12.4, -8.7, 22.1], exhaustiveness: 32, numModes: 9, cpu: 16,
    s3InputPath: 's3://axiom-sim/fargate-0083/input/', s3OutputPath: 's3://axiom-sim/fargate-0083/output/',
    poses: [
      { mode: 1, affinity: -9.6, rmsdLb: 0.0, rmsdUb: 0.6 },
      { mode: 2, affinity: -9.1, rmsdLb: 0.8, rmsdUb: 1.7 },
      { mode: 3, affinity: -8.6, rmsdLb: 1.5, rmsdUb: 2.6 },
      { mode: 4, affinity: -8.1, rmsdLb: 2.2, rmsdUb: 3.3 },
      { mode: 5, affinity: -7.6, rmsdLb: 2.9, rmsdUb: 4.0 },
      { mode: 6, affinity: -7.1, rmsdLb: 3.6, rmsdUb: 4.7 },
      { mode: 7, affinity: -6.6, rmsdLb: 4.3, rmsdUb: 5.4 },
      { mode: 8, affinity: -6.1, rmsdLb: 5.0, rmsdUb: 6.1 },
      { mode: 9, affinity: -5.6, rmsdLb: 5.7, rmsdUb: 6.8 },
    ],
  },
];

type SortKey = 'id' | 'hypothesis' | 'target' | 'compoundId' | 'type' | 'status' | 'dockingScore' | 'rmsd' | 'runtime' | 'compute' | 'timestamp';
type SortDir = 'asc' | 'desc';

function PoseChart({ poses }: { poses: { mode: number; affinity: number }[] }) {
  if (!poses.length) return null;
  const maxAffinity = Math.max(...poses.map((p) => Math.abs(p.affinity)));
  return (
    <div className="space-y-1.5">
      <div className="text-[10px] font-semibold text-axiom-border-secondary uppercase tracking-wider">Binding Affinity per Pose</div>
      {poses.map((pose) => (
        <div key={pose.mode} className="flex items-center gap-2">
          <span className="text-[10px] text-axiom-border-secondary font-mono w-8">M{pose.mode}</span>
          <div className="flex-1 h-3 bg-axiom-bg-tertiary rounded-sm overflow-hidden">
            <div
              className="h-full rounded-sm transition-all"
              style={{
                width: `${(Math.abs(pose.affinity) / maxAffinity) * 100}%`,
                background: pose.mode === 1 ? '#22d3ee' : '#22d3ee40',
              }}
            />
          </div>
          <span className="text-[10px] text-white font-mono w-16 text-right">{pose.affinity.toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
}

function DetailPanel({ job, onClose }: { job: SimulationRow; onClose: () => void }) {
  const computeCostPerHour: Record<string, number> = {
    'c5.4xlarge': 0.68,
    'c5.2xlarge': 0.34,
    'r5.2xlarge': 0.504,
    'r5.4xlarge': 1.008,
  };

  const runtimeMinutes = parseInt(job.runtime) || 0;
  const estimatedCost = ((computeCostPerHour[job.compute] || 0.5) * runtimeMinutes / 60).toFixed(2);

  return (
    <div className="glass-panel rounded-xl p-5 space-y-5 animate-slide-in h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{job.id}</h3>
        <button onClick={onClose} className="text-axiom-border-secondary hover:text-white text-xs transition-colors">
          Close
        </button>
      </div>

      <StatusBadge status={job.status} />

      {/* Job Parameters */}
      <div>
        <div className="text-[10px] font-semibold text-axiom-border-secondary uppercase tracking-wider mb-2">Job Parameters</div>
        <div className="space-y-1.5">
          {job.receptorPdb && (
            <div className="flex items-center justify-between py-1 border-b border-axiom-border/30">
              <span className="text-[10px] text-axiom-border-secondary">Receptor PDB</span>
              <span className="text-[10px] text-white font-mono">{job.receptorPdb}</span>
            </div>
          )}
          {job.gridCenter && (
            <div className="flex items-center justify-between py-1 border-b border-axiom-border/30">
              <span className="text-[10px] text-axiom-border-secondary">Grid Center</span>
              <span className="text-[10px] text-white font-mono">[{job.gridCenter.join(', ')}]</span>
            </div>
          )}
          {job.exhaustiveness && (
            <div className="flex items-center justify-between py-1 border-b border-axiom-border/30">
              <span className="text-[10px] text-axiom-border-secondary">Exhaustiveness</span>
              <span className="text-[10px] text-white font-mono">{job.exhaustiveness}</span>
            </div>
          )}
          {job.numModes && (
            <div className="flex items-center justify-between py-1 border-b border-axiom-border/30">
              <span className="text-[10px] text-axiom-border-secondary">Num Modes</span>
              <span className="text-[10px] text-white font-mono">{job.numModes}</span>
            </div>
          )}
          {job.cpu && (
            <div className="flex items-center justify-between py-1 border-b border-axiom-border/30">
              <span className="text-[10px] text-axiom-border-secondary">CPU</span>
              <span className="text-[10px] text-white font-mono">{job.cpu}</span>
            </div>
          )}
        </div>
      </div>

      {/* Score Breakdown */}
      {job.poses && job.poses.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <BarChart3 className="w-3 h-3 text-axiom-cyan" />
            <div className="text-[10px] font-semibold text-axiom-border-secondary uppercase tracking-wider">Score Breakdown</div>
          </div>
          <PoseChart poses={job.poses} />
        </div>
      )}

      {/* Infrastructure Cost */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <DollarSign className="w-3 h-3 text-axiom-emerald" />
          <div className="text-[10px] font-semibold text-axiom-border-secondary uppercase tracking-wider">Infrastructure Cost</div>
        </div>
        <div className="p-3 rounded-lg bg-axiom-bg-tertiary">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-axiom-border-secondary">Instance Type</span>
            <span className="text-[10px] text-white font-mono">{job.compute}</span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-axiom-border-secondary">Rate</span>
            <span className="text-[10px] text-white font-mono">${computeCostPerHour[job.compute] || 0.5}/hr</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-axiom-border-secondary">Estimated Cost</span>
            <span className="text-xs text-axiom-emerald font-bold">${estimatedCost}</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {job.errorMessage && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-3 h-3 text-axiom-red" />
            <div className="text-[10px] font-semibold text-axiom-border-secondary uppercase tracking-wider">Error</div>
          </div>
          <div className="p-3 rounded-lg bg-axiom-red/5 border border-axiom-red/20">
            <p className="text-[10px] text-axiom-red font-mono leading-relaxed">{job.errorMessage}</p>
          </div>
        </div>
      )}

      {/* Parent Hypothesis Link */}
      <div>
        <div className="text-[10px] font-semibold text-axiom-border-secondary uppercase tracking-wider mb-2">Parent Hypothesis</div>
        <button className="flex items-center gap-1.5 text-xs text-axiom-cyan hover:text-axiom-cyan/80 transition-colors">
          <ExternalLink className="w-3 h-3" />
          {job.hypothesis}
        </button>
      </div>

      {/* S3 Paths */}
      <div>
        <div className="text-[10px] font-semibold text-axiom-border-secondary uppercase tracking-wider mb-2">Storage</div>
        <div className="space-y-1">
          {job.s3InputPath && (
            <div className="text-[10px] text-axiom-border-secondary font-mono truncate">{job.s3InputPath}</div>
          )}
          {job.s3OutputPath && (
            <div className="text-[10px] text-axiom-border-secondary font-mono truncate">{job.s3OutputPath}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SimulationsFullPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('timestamp');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedJob, setSelectedJob] = useState<SimulationRow | null>(null);

  const filtered = useMemo(() => {
    let rows = simulationRows;
    if (statusFilter !== 'all') {
      rows = rows.filter((r) => r.status === statusFilter);
    }
    return [...rows].sort((a, b) => {
      const aVal = a[sortKey] || '';
      const bVal = b[sortKey] || '';
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [statusFilter, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return sortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-axiom-cyan" /> : <ArrowDown className="w-3 h-3 text-axiom-cyan" />;
  };

  const statusCounts = {
    total: simulationRows.length,
    running: simulationRows.filter((r) => r.status === 'RUNNING').length,
    completed: simulationRows.filter((r) => r.status === 'COMPLETED').length,
    failed: simulationRows.filter((r) => r.status === 'FAILED').length,
  };

  const columns: { key: SortKey; label: string; width: string }[] = [
    { key: 'id', label: 'Job ID', width: 'w-28' },
    { key: 'hypothesis', label: 'Hypothesis', width: 'w-28' },
    { key: 'target', label: 'Target', width: 'w-28' },
    { key: 'compoundId', label: 'Compound ID', width: 'w-32' },
    { key: 'type', label: 'Type', width: 'w-32' },
    { key: 'status', label: 'Status', width: 'w-24' },
    { key: 'dockingScore', label: 'Docking Score', width: 'w-28' },
    { key: 'rmsd', label: 'RMSD', width: 'w-16' },
    { key: 'runtime', label: 'Runtime', width: 'w-20' },
    { key: 'compute', label: 'Compute', width: 'w-24' },
    { key: 'timestamp', label: 'Timestamp', width: 'w-20' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Row */}
      <ErrorBoundary name="SimulationStats">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: 'Total Jobs', value: 24, icon: Cpu, color: 'text-axiom-cyan' },
            { label: 'Running', value: statusCounts.running, icon: Clock, color: 'text-cyan-400' },
            { label: 'Completed', value: 19, icon: CheckCircle2, color: 'text-emerald-400' },
            { label: 'Failed', value: statusCounts.failed, icon: XCircle, color: 'text-red-400' },
            { label: 'Avg Docking Score', value: '-7.9 kcal/mol', icon: BarChart3, color: 'text-amber-400' },
          ].map((stat) => (
            <div key={stat.label} className="glass-panel rounded-xl p-4 text-center">
              <stat.icon className={cn('w-4 h-4 mx-auto mb-2', stat.color)} />
              <div className="text-lg font-bold text-white stat-value">{stat.value}</div>
              <div className="text-[10px] text-axiom-border-secondary mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </ErrorBoundary>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['all', 'RUNNING', 'COMPLETED', 'FAILED', 'QUEUED'].map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all',
              statusFilter === f
                ? 'bg-axiom-cyan/10 text-axiom-cyan border border-axiom-cyan/20'
                : 'text-axiom-border-secondary hover:text-white border border-transparent'
            )}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {/* Table + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Table */}
        <ErrorBoundary name="SimulationsTable">
          <div className={cn('lg:col-span-3', selectedJob ? 'xl:col-span-2' : 'xl:col-span-3')}>
            <div className="glass-panel rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-axiom-border">
                      {columns.map((col) => (
                        <th
                          key={col.key}
                          onClick={() => handleSort(col.key)}
                          className="px-3 py-3 text-left text-[10px] font-semibold text-axiom-border-secondary uppercase tracking-wider cursor-pointer hover:text-white transition-colors whitespace-nowrap"
                        >
                          <div className="flex items-center gap-1">
                            {col.label}
                            <SortIcon col={col.key} />
                          </div>
                        </th>
                      ))}
                      <th className="px-3 py-3 text-left text-[10px] font-semibold text-axiom-border-secondary uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={12}>
                          <EmptyState
                            icon={Cpu}
                            title="No simulations dispatched yet"
                            description="Simulations will appear here once an agent dispatches a docking job."
                          />
                        </td>
                      </tr>
                    ) : (
                    filtered.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedJob(selectedJob?.id === row.id ? null : row)}
                        className={cn(
                          'border-b border-axiom-border/30 cursor-pointer transition-colors',
                          selectedJob?.id === row.id ? 'bg-axiom-cyan/5' : 'hover:bg-axiom-bg-tertiary/30'
                        )}
                      >
                        <td className="px-3 py-2.5 text-[11px] text-white font-mono">{row.id}</td>
                        <td className="px-3 py-2.5 text-[11px] text-axiom-border-secondary">{row.hypothesis}</td>
                        <td className="px-3 py-2.5 text-[11px] text-axiom-border-secondary">{row.target}</td>
                        <td className="px-3 py-2.5 text-[11px] text-white font-mono">{row.compoundId}</td>
                        <td className="px-3 py-2.5 text-[11px] text-axiom-border-secondary">{row.type}</td>
                        <td className="px-3 py-2.5"><StatusBadge status={row.status} /></td>
                        <td className="px-3 py-2.5 text-[11px] text-white font-mono">{row.dockingScore || '—'}</td>
                        <td className="px-3 py-2.5 text-[11px] text-axiom-border-secondary font-mono">{row.rmsd || '—'}</td>
                        <td className="px-3 py-2.5 text-[11px] text-axiom-border-secondary">{row.runtime}</td>
                        <td className="px-3 py-2.5 text-[11px] text-axiom-border-secondary font-mono">{row.compute}</td>
                        <td className="px-3 py-2.5 text-[11px] text-axiom-border-secondary" title={new Date(row.timestamp).toLocaleString()}>
                          {formatRelativeTime(row.timestamp)}
                        </td>
                        <td className="px-3 py-2.5">
                          <button className={cn(
                            'flex items-center gap-1 text-[10px] font-semibold transition-colors',
                            row.status === 'FAILED' ? 'text-red-400 hover:text-red-300' : 'text-axiom-cyan hover:text-axiom-cyan/80'
                          )}>
                            {row.status === 'FAILED' ? <AlertTriangle className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                            {row.action}
                          </button>
                        </td>
                      </tr>
                    ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </ErrorBoundary>

        {/* Detail Panel */}
        {selectedJob && (
          <div className="xl:col-span-1 animate-slide-in">
            <DetailPanel job={selectedJob} onClose={() => setSelectedJob(null)} />
          </div>
        )}
      </div>
    </div>
  );
}
