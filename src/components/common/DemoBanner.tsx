import { AlertTriangle } from 'lucide-react';

export default function DemoBanner() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-axiom-amber/5 border-b border-axiom-amber/20" role="status">
      <AlertTriangle className="w-3.5 h-3.5 text-axiom-amber flex-shrink-0" />
      <span className="text-xs text-axiom-amber font-medium">
        Running in demo mode — all data is simulated. Connect to a live pipeline for real results.
      </span>
    </div>
  );
}
