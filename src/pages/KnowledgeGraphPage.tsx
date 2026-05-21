import KnowledgeGraphExplorer from '../components/knowledge-graph/KnowledgeGraphExplorer';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

interface KnowledgeGraphPageProps {
  onViewChange?: (view: string) => void;
}

export default function KnowledgeGraphPage({ onViewChange }: KnowledgeGraphPageProps) {
  const handleNavigateToLiterature = (query: string) => {
    void query;
    onViewChange?.('literature');
  };

  return (
    <ErrorBoundary name="KnowledgeGraphExplorer">
      <KnowledgeGraphExplorer onNavigateToLiterature={handleNavigateToLiterature} />
    </ErrorBoundary>
  );
}
