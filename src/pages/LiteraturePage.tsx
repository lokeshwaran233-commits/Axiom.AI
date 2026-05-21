import { BookOpen, Search, ExternalLink, Tag } from 'lucide-react';
import { useState } from 'react';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { EmptyState } from '../components/common/Skeleton';

interface LiteratureResult {
  id: string;
  title: string;
  journal: string;
  year: number;
  doi: string;
  snippet: string;
  entityMentions: string[];
  relevanceScore: number;
}

const mockResults: LiteratureResult[] = [
  {
    id: '1',
    title: 'BRD4-c-Myc transcriptional axis as a therapeutic target in triple-negative breast cancer',
    journal: 'Nature Cancer',
    year: 2024,
    doi: '10.1038/s43018-024-00123-4',
    snippet: 'The BRD4-c-Myc transcriptional axis represents a critical dependency in TNBC. Inhibition of BRD4 with JQ1 derivatives reduces c-Myc transcription and induces apoptosis in MYC-amplified cell lines...',
    entityMentions: ['BRD4', 'c-Myc', 'JQ1', 'TNBC', 'apoptosis'],
    relevanceScore: 0.94,
  },
  {
    id: '2',
    title: 'Structural basis for selective inhibition of BRD4 BD2 by triazole-containing small molecules',
    journal: 'Journal of Medicinal Chemistry',
    year: 2023,
    doi: '10.1021/acs.jmedchem.3b00456',
    snippet: 'Crystal structures of BRD4 BD1 and BD2 in complex with triazole-modified JQ1 derivatives reveal a conformational selectivity mechanism. The triazole linker engages a BD2-specific pocket...',
    entityMentions: ['BRD4', 'BD2', 'JQ1', 'triazole', 'selectivity'],
    relevanceScore: 0.89,
  },
  {
    id: '3',
    title: 'hERG liability mitigation strategies for bromodomain inhibitors: a medicinal chemistry perspective',
    journal: 'Bioorganic & Medicinal Chemistry Letters',
    year: 2023,
    doi: '10.1016/j.bmcl.2023.129234',
    snippet: 'Para-fluoro substitution at the terminal phenyl ring of BET inhibitors reduces hERG channel affinity by 3-5 fold while maintaining bromodomain binding potency. Structure-activity relationships across 42 analogs...',
    entityMentions: ['hERG', 'BET', 'bromodomain', 'fluoro', 'SAR'],
    relevanceScore: 0.82,
  },
  {
    id: '4',
    title: 'AutoDock Vina 1.2.3: improved docking and scoring functions for drug discovery applications',
    journal: 'Journal of Cheminformatics',
    year: 2024,
    doi: '10.1186/s13321-024-00789-0',
    snippet: 'AutoDock Vina 1.2.3 introduces improved scoring functions with better correlation to experimental binding affinities (R2=0.72). Exhaustiveness parameter optimization for reproducible results...',
    entityMentions: ['AutoDock Vina', 'docking', 'scoring', 'binding affinity'],
    relevanceScore: 0.76,
  },
  {
    id: '5',
    title: 'c-Fos/c-Jun AP-1 complex as a target for allosteric modulation in inflammatory breast cancer',
    journal: 'Cancer Research',
    year: 2024,
    doi: '10.1158/0008-5472.CAN-23-4567',
    snippet: 'The AP-1 transcription factor complex, composed of c-Fos and c-Jun, drives metastatic gene expression programs in inflammatory breast cancer. Allosteric disruption of the leucine zipper dimerization interface...',
    entityMentions: ['c-Fos', 'c-Jun', 'AP-1', 'leucine zipper', 'allosteric'],
    relevanceScore: 0.71,
  },
];

export default function LiteraturePage() {
  const [query, setQuery] = useState('');
  const [results] = useState(mockResults);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-axiom-border-secondary" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search across 2.8M PubMed records, 142K bioRxiv papers, 38K patent filings..."
          className="w-full h-12 pl-11 pr-4 text-sm bg-axiom-bg-secondary border border-axiom-border rounded-xl text-white placeholder:text-axiom-border-secondary focus:outline-none focus:border-axiom-cyan/50 focus:ring-1 focus:ring-axiom-cyan/20 transition-all"
        />
      </form>

      {/* Stats */}
      <div className="flex items-center gap-6 text-[10px] text-axiom-border-secondary">
        <span className="flex items-center gap-1.5"><BookOpen className="w-3 h-3" />2.8M PubMed chunks indexed</span>
        <span>pgvector cosine similarity search</span>
        <span>BioBERT NER entity extraction</span>
      </div>

      {/* Results */}
      <ErrorBoundary name="LiteratureResults">
        <div className="space-y-3">
          {isSearching && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-axiom-cyan">
                <span className="w-5 h-5 border-2 border-axiom-cyan/30 border-t-axiom-cyan rounded-full animate-spin" />
                <span className="text-sm">Searching knowledge base...</span>
              </div>
            </div>
          )}

          {!isSearching && results.length === 0 && query && !isSearching && (
            <EmptyState
              icon={BookOpen}
              title="No results found"
              description="Try broadening your search terms or check spelling."
            />
          )}
          {!isSearching && results.length > 0 && results.map((result, i) => (
            <div
              key={result.id}
              className="glass-panel glass-panel-hover rounded-xl p-5 animate-slide-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-white leading-snug">{result.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-axiom-cyan font-medium">{result.journal}</span>
                    <span className="text-[10px] text-axiom-border-secondary">({result.year})</span>
                    <a
                      href={`https://doi.org/${result.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-axiom-border-secondary hover:text-axiom-cyan transition-colors flex items-center gap-0.5"
                    >
                      DOI <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-axiom-cyan/10 border border-axiom-cyan/20">
                  <span className="text-[10px] font-bold text-axiom-cyan stat-value">{(result.relevanceScore * 100).toFixed(0)}%</span>
                  <span className="text-[10px] text-axiom-cyan/70">match</span>
                </div>
              </div>

              <p className="text-xs text-axiom-border-secondary leading-relaxed mb-3">{result.snippet}</p>

              <div className="flex items-center gap-1.5 flex-wrap">
                <Tag className="w-3 h-3 text-axiom-border-secondary" />
                {result.entityMentions.map((entity) => (
                  <span
                    key={entity}
                    className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-axiom-bg-tertiary text-axiom-border-secondary border border-axiom-border"
                  >
                    {entity}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ErrorBoundary>
    </div>
  );
}
