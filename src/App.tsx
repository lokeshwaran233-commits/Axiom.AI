import AppLayout from './components/layout/AppLayout';
import { RouteErrorBoundary } from './components/common/RouteErrorBoundary';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import DashboardPage from './pages/DashboardPage';
import HypothesisWorkspacePage from './pages/HypothesisWorkspacePage';
import KnowledgeGraphPage from './pages/KnowledgeGraphPage';
import SimulationsFullPage from './pages/SimulationsFullPage';
import AgentTracePage from './pages/AgentTracePage';
import LiteraturePage from './pages/LiteraturePage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

const routeNames: Record<string, string> = {
  dashboard: 'Dashboard',
  hypotheses: 'Hypothesis Workspace',
  'knowledge-graph': 'Knowledge Graph',
  simulations: 'Simulations',
  agents: 'Agent Trace',
  literature: 'Literature',
  reports: 'Reports',
  settings: 'Settings',
};

function App() {
  return (
    <ErrorBoundary name="AppRoot">
      <AppLayout>
        {(activeView, onViewChange) => {
          const routeName = routeNames[activeView] || 'Unknown';
          const wrapped = (
            <RouteErrorBoundary routeName={routeName}>
              {activeView === 'dashboard' && <DashboardPage />}
              {activeView === 'hypotheses' && <HypothesisWorkspacePage />}
              {activeView === 'knowledge-graph' && <KnowledgeGraphPage onViewChange={onViewChange} />}
              {activeView === 'simulations' && <SimulationsFullPage />}
              {activeView === 'agents' && <AgentTracePage />}
              {activeView === 'literature' && <LiteraturePage />}
              {activeView === 'reports' && <ReportsPage />}
              {activeView === 'settings' && <SettingsPage />}
            </RouteErrorBoundary>
          );
          return wrapped;
        }}
      </AppLayout>
    </ErrorBoundary>
  );
}

export default App;
