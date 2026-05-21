import { useState, useCallback, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import DemoBanner from '../common/DemoBanner';

interface AppLayoutProps {
  children: (activeView: string, onViewChange: (view: string) => void) => React.ReactNode;
}

const viewTitles: Record<string, { title: string; subtitle: string; pageTitle: string }> = {
  dashboard: { title: 'Mission Control', subtitle: 'Real-time overview of all research pipelines', pageTitle: 'Mission Control | Axiom.AI' },
  hypotheses: { title: 'Hypothesis Workspace', subtitle: 'Formulate, track, and refine molecular hypotheses', pageTitle: 'Hypothesis Workspace | Axiom.AI' },
  'knowledge-graph': { title: 'Knowledge Hypergraph', subtitle: 'Explore the biological knowledge topology', pageTitle: 'Knowledge Hypergraph | Axiom.AI' },
  simulations: { title: 'Simulation Center', subtitle: 'Monitor and analyze in-silico experiments', pageTitle: 'Simulations | Axiom.AI' },
  agents: { title: 'Agent Trace', subtitle: 'Audit trail of autonomous agent decisions', pageTitle: 'Agent Trace | Axiom.AI' },
  literature: { title: 'Literature Intelligence', subtitle: 'RAG-powered literature synthesis', pageTitle: 'Literature Intelligence | Axiom.AI' },
  reports: { title: 'Reports & Exports', subtitle: 'Generate compliance-ready documentation', pageTitle: 'Reports & Exports | Axiom.AI' },
  settings: { title: 'Settings', subtitle: 'Configure workspace and pipeline parameters', pageTitle: 'Settings | Axiom.AI' },
};

export default function AppLayout({ children }: AppLayoutProps) {
  const [activeView, setActiveView] = useState('dashboard');
  const viewMeta = viewTitles[activeView] || { title: 'Axiom.AI', subtitle: '', pageTitle: 'Axiom.AI' };

  const handleViewChange = useCallback((view: string) => {
    setActiveView(view);
  }, []);

  useEffect(() => {
    document.title = viewMeta.pageTitle;
  }, [viewMeta.pageTitle]);

  return (
    <div className="flex h-screen overflow-hidden bg-axiom-bg">
      <Sidebar activeView={activeView} onViewChange={handleViewChange} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DemoBanner />
        <Header title={viewMeta.title} subtitle={viewMeta.subtitle} />
        <main className="flex-1 overflow-y-auto p-6">
          {children(activeView, handleViewChange)}
        </main>
      </div>
    </div>
  );
}
