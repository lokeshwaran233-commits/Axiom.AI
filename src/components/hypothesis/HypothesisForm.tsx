import { useState } from 'react';
import { Send, Cpu, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { HypothesisFormData, SimulationEngine } from '../../types';

interface HypothesisFormProps {
  onSubmit: (data: HypothesisFormData) => void;
  isLoading?: boolean;
}

const targetGenes = [
  'c-Myc', 'c-Fos', 'BRAF V600E', 'KRAS G12C', 'EGFR', 'ALK', 'PI3KCA', 'TP53', 'BRD4', 'CDK4/6',
];

const simulationEngines: { value: SimulationEngine; label: string; description: string }[] = [
  { value: 'autodock_vina', label: 'AutoDock Vina', description: 'Molecular docking - fast binding affinity prediction' },
  { value: 'gromacs', label: 'GROMACS', description: 'Molecular dynamics - full trajectory simulation' },
  { value: 'openmm', label: 'OpenMM', description: 'GPU-accelerated MD with custom force fields' },
];

export default function HypothesisForm({ onSubmit, isLoading }: HypothesisFormProps) {
  const [formData, setFormData] = useState<HypothesisFormData>({
    targetGene: '',
    targetProtein: '',
    objective: '',
    indication: '',
    simulationEngine: 'autodock_vina',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isValid = formData.targetGene.trim() && formData.objective.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Target Gene */}
      <div>
        <label className="block text-xs font-semibold text-white mb-2">Target Gene</label>
        <div className="relative">
          <input
            type="text"
            value={formData.targetGene}
            onChange={(e) => setFormData({ ...formData, targetGene: e.target.value })}
            placeholder="e.g., c-Myc, KRAS G12C"
            list="target-genes"
            className="w-full h-10 px-3 text-sm bg-axiom-bg-tertiary border border-axiom-border rounded-lg text-white placeholder:text-axiom-border-secondary focus:outline-none focus:border-axiom-cyan/50 focus:ring-1 focus:ring-axiom-cyan/20 transition-all"
          />
          <datalist id="target-genes">
            {targetGenes.map((gene) => (
              <option key={gene} value={gene} />
            ))}
          </datalist>
        </div>
      </div>

      {/* Target Protein */}
      <div>
        <label className="block text-xs font-semibold text-white mb-2">Target Protein <span className="text-axiom-border-secondary font-normal">(optional)</span></label>
        <input
          type="text"
          value={formData.targetProtein}
          onChange={(e) => setFormData({ ...formData, targetProtein: e.target.value })}
          placeholder="e.g., MYC, BRAF, PDB: 6Y7R"
          className="w-full h-10 px-3 text-sm bg-axiom-bg-tertiary border border-axiom-border rounded-lg text-white placeholder:text-axiom-border-secondary focus:outline-none focus:border-axiom-cyan/50 focus:ring-1 focus:ring-axiom-cyan/20 transition-all"
        />
      </div>

      {/* Objective */}
      <div>
        <label className="block text-xs font-semibold text-white mb-2">Research Objective</label>
        <textarea
          value={formData.objective}
          onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
          placeholder="Describe the hypothesis you want to explore. Be specific about mechanism, indication, and desired molecular properties."
          rows={4}
          className="w-full px-3 py-2.5 text-sm bg-axiom-bg-tertiary border border-axiom-border rounded-lg text-white placeholder:text-axiom-border-secondary focus:outline-none focus:border-axiom-cyan/50 focus:ring-1 focus:ring-axiom-cyan/20 transition-all resize-none"
        />
      </div>

      {/* Indication */}
      <div>
        <label className="block text-xs font-semibold text-white mb-2">Disease Indication</label>
        <input
          type="text"
          value={formData.indication}
          onChange={(e) => setFormData({ ...formData, indication: e.target.value })}
          placeholder="e.g., Triple-Negative Breast Cancer, NSCLC"
          className="w-full h-10 px-3 text-sm bg-axiom-bg-tertiary border border-axiom-border rounded-lg text-white placeholder:text-axiom-border-secondary focus:outline-none focus:border-axiom-cyan/50 focus:ring-1 focus:ring-axiom-cyan/20 transition-all"
        />
      </div>

      {/* Simulation Engine */}
      <div>
        <label className="block text-xs font-semibold text-white mb-2">Simulation Engine</label>
        <div className="grid grid-cols-1 gap-2">
          {simulationEngines.map((engine) => (
            <button
              key={engine.value}
              type="button"
              onClick={() => setFormData({ ...formData, simulationEngine: engine.value })}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border text-left transition-all',
                formData.simulationEngine === engine.value
                  ? 'border-axiom-cyan/40 bg-axiom-cyan/5'
                  : 'border-axiom-border bg-axiom-bg-tertiary hover:border-axiom-border-secondary'
              )}
            >
              <Cpu className={cn(
                'w-4 h-4 mt-0.5 flex-shrink-0',
                formData.simulationEngine === engine.value ? 'text-axiom-cyan' : 'text-axiom-border-secondary'
              )} />
              <div>
                <div className={cn(
                  'text-xs font-semibold',
                  formData.simulationEngine === engine.value ? 'text-axiom-cyan' : 'text-white'
                )}>
                  {engine.label}
                </div>
                <div className="text-[10px] text-axiom-border-secondary mt-0.5">{engine.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Options Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-[11px] text-axiom-border-secondary hover:text-white transition-colors"
      >
        {showAdvanced ? 'Hide' : 'Show'} advanced options
      </button>

      {showAdvanced && (
        <div className="space-y-4 p-4 rounded-lg bg-axiom-bg-tertiary border border-axiom-border animate-slide-in">
          <div className="flex items-center gap-2 text-xs text-axiom-amber">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Advanced parameters override agent defaults</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-axiom-border-secondary mb-1.5">Max Iterations</label>
              <input
                type="number"
                defaultValue={10}
                min={1}
                max={50}
                className="w-full h-8 px-2 text-xs bg-axiom-bg-elevated border border-axiom-border rounded-md text-white focus:outline-none focus:border-axiom-cyan/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-axiom-border-secondary mb-1.5">Convergence Threshold</label>
              <input
                type="number"
                defaultValue={0.85}
                min={0}
                max={1}
                step={0.05}
                className="w-full h-8 px-2 text-xs bg-axiom-bg-elevated border border-axiom-border rounded-md text-white focus:outline-none focus:border-axiom-cyan/50"
              />
            </div>
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!isValid || isLoading}
        className={cn(
          'w-full flex items-center justify-center gap-2 h-11 rounded-lg text-sm font-semibold transition-all',
          isValid && !isLoading
            ? 'bg-axiom-cyan/20 text-axiom-cyan border border-axiom-cyan/30 hover:bg-axiom-cyan/30 hover:shadow-lg hover:shadow-axiom-cyan/10'
            : 'bg-axiom-bg-tertiary text-axiom-border-secondary border border-axiom-border cursor-not-allowed'
        )}
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-axiom-cyan/30 border-t-axiom-cyan rounded-full animate-spin" />
            Initializing Pipeline...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Launch Hypothesis Pipeline
          </>
        )}
      </button>
    </form>
  );
}
