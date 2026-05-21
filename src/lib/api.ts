import { supabase } from './supabase';
import type {
  Hypothesis,
  HypothesisVersion,
  SimulationJob,
  AgentActivityLog,
  Workspace,
  DashboardStats,
  KnowledgeGraphData,
  GraphNode,
  GraphEdge,
  TimelineEvent,
} from '../types';

// ============================================
// WORKSPACE API
// ============================================

export async function getWorkspaces() {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('is_active', true)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data as Workspace[];
}

export async function createWorkspace(workspace: Pick<Workspace, 'name' | 'description' | 'indication_focus'>) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .maybeSingle();

  if (!profile) throw new Error('No profile found');

  const { data, error } = await supabase
    .from('workspaces')
    .insert({
      ...workspace,
      owner_id: profile.id,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Workspace;
}

// ============================================
// HYPOTHESIS API
// ============================================

export async function getHypotheses(workspaceId: string) {
  const { data, error } = await supabase
    .from('hypotheses')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data as Hypothesis[];
}

export async function getHypothesis(hypothesisId: string) {
  const { data, error } = await supabase
    .from('hypotheses')
    .select('*')
    .eq('id', hypothesisId)
    .maybeSingle();
  if (error) throw error;
  return data as Hypothesis | null;
}

export async function createHypothesis(hypothesis: Pick<Hypothesis, 'workspace_id' | 'target_gene' | 'target_protein' | 'objective_text'>) {
  const { data, error } = await supabase
    .from('hypotheses')
    .insert({
      ...hypothesis,
      status: 'draft',
      iteration_count: 0,
      convergence_score: 0,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Hypothesis;
}

export async function updateHypothesisStatus(hypothesisId: string, status: Hypothesis['status']) {
  const { data, error } = await supabase
    .from('hypotheses')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', hypothesisId)
    .select()
    .single();
  if (error) throw error;
  return data as Hypothesis;
}

// ============================================
// HYPOTHESIS VERSIONS API
// ============================================

export async function getHypothesisVersions(hypothesisId: string) {
  const { data, error } = await supabase
    .from('hypothesis_versions')
    .select('*')
    .eq('hypothesis_id', hypothesisId)
    .order('version_number', { ascending: false });
  if (error) throw error;
  return data as HypothesisVersion[];
}

export async function getLatestVersion(hypothesisId: string) {
  const { data, error } = await supabase
    .from('hypothesis_versions')
    .select('*')
    .eq('hypothesis_id', hypothesisId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as HypothesisVersion | null;
}

// ============================================
// SIMULATION JOBS API
// ============================================

export async function getSimulationJobs(hypothesisVersionId: string) {
  const { data, error } = await supabase
    .from('simulation_jobs')
    .select('*')
    .eq('hypothesis_version_id', hypothesisVersionId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as SimulationJob[];
}

export async function getRunningSimulations(workspaceId: string) {
  const { data, error } = await supabase
    .from('simulation_jobs')
    .select('*, hypothesis_versions!inner(*, hypotheses!inner(workspace_id))')
    .eq('hypothesis_versions.hypotheses.workspace_id', workspaceId)
    .in('status', ['queued', 'running']);
  if (error) throw error;
  return data;
}

// ============================================
// AGENT ACTIVITY API
// ============================================

export async function getAgentActivity(workspaceId: string, limit = 50) {
  const { data, error } = await supabase
    .from('agent_activity_log')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as AgentActivityLog[];
}

export async function getAgentActivityForHypothesis(hypothesisId: string) {
  const { data, error } = await supabase
    .from('agent_activity_log')
    .select('*')
    .eq('hypothesis_id', hypothesisId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as AgentActivityLog[];
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function getDashboardStats(workspaceId: string): Promise<DashboardStats> {
  const [hypothesesResult, convergedResult, simulationsResult] = await Promise.all([
    supabase.from('hypotheses').select('id', { count: 'exact' }).eq('workspace_id', workspaceId).neq('status', 'archived'),
    supabase.from('hypotheses').select('id', { count: 'exact' }).eq('workspace_id', workspaceId).eq('status', 'converged'),
    supabase.from('simulation_jobs').select('id', { count: 'exact' }).in('status', ['queued', 'running']),
  ]);

  return {
    activeHypotheses: hypothesesResult.count ?? 0,
    convergedHypotheses: convergedResult.count ?? 0,
    runningSimulations: simulationsResult.count ?? 0,
    totalLiteratureChunks: 0,
    averageDockingScore: -7.2,
    averageConvergenceIterations: 4.3,
  };
}

// ============================================
// EDGE FUNCTION API
// ============================================

export async function invokeAgentPipeline(payload: {
  hypothesis_id: string;
  workspace_id: string;
  target_gene: string;
  target_protein: string;
  objective: string;
  simulation_engine: string;
}) {
  const { data, error } = await supabase.functions.invoke('agent-pipeline', {
    body: payload,
  });
  if (error) throw error;
  return data;
}

export async function invokeLiteratureSearch(query: string, limit = 10) {
  const { data, error } = await supabase.functions.invoke('literature-search', {
    body: { query, limit },
  });
  if (error) throw error;
  return data;
}

// ============================================
// MOCK DATA (for development before edge functions are deployed)
// ============================================

export function getMockKnowledgeGraph(): KnowledgeGraphData {
  const nodes: GraphNode[] = [
    // Original 12 nodes
    { id: 'c-myc', label: 'c-Myc', type: 'gene', properties: { function: 'transcription factor', oncogene: true, description: 'Master transcription factor driving proliferation. Key oncogene in multiple cancer types.' } },
    { id: 'c-fos', label: 'c-Fos', type: 'gene', properties: { function: 'transcription factor', oncogene: true, description: 'Component of AP-1 transcription factor complex. Activates MAPK-driven gene programs.' } },
    { id: 'max', label: 'MAX', type: 'protein', properties: { function: 'Myc-associated factor', binding_partner: 'c-Myc', description: 'Obligate dimerization partner of c-Myc. Required for DNA binding and transcriptional activity.' } },
    { id: 'brd4', label: 'BRD4', type: 'protein', properties: { function: 'bromodomain protein', targetable: true, description: 'Bromodomain reader protein that regulates transcription via acetyl-lysine recognition. Druggable target.' } },
    { id: 'jQ1', label: 'JQ1', type: 'compound', properties: { smiles: 'CCC1=NN(C)C2=C1C=CC(=C2)C(=O)NCC3=CC=C(C=C3)OCC4=CC(=CC=C4)S(=O)(=O)N', phase: 'preclinical', description: 'Prototype BET bromodomain inhibitor. Binds BD1/BD2 with nanomolar affinity.' } },
    { id: 'omomyc', label: 'Omomyc', type: 'compound', properties: { smiles: '', phase: 'phase I', type: 'peptide', description: 'Dominant-negative c-Myc miniprotein. Disrupts c-Myc/Max dimerization in vivo.' } },
    { id: 'mapk', label: 'MAPK Pathway', type: 'pathway', properties: { role: 'signal transduction', description: 'RAS-RAF-MEK-ERK signaling cascade. Controls cell proliferation and differentiation.' } },
    { id: 'pi3k', label: 'PI3K/AKT Pathway', type: 'pathway', properties: { role: 'cell survival', description: 'PI3K-AKT-mTOR signaling axis. Promotes cell growth, survival, and metabolism.' } },
    { id: 'tnbc', label: 'Triple-Negative Breast Cancer', type: 'disease', properties: { icd: 'C50', description: 'Aggressive breast cancer subtype lacking ER, PR, HER2. Limited targeted therapy options.' } },
    { id: 'apoptosis', label: 'Apoptosis', type: 'pathway', properties: { role: 'programmed cell death', description: 'Intrinsic and extrinsic cell death pathways. Critical tumor suppression mechanism.' } },
    { id: 'p53', label: 'p53', type: 'gene', properties: { function: 'tumor suppressor', oncogene: false, description: 'Guardian of the genome. Induces cell cycle arrest and apoptosis in response to DNA damage.' } },
    { id: 'bet-inhibitor-x', label: 'BET Inhibitor X', type: 'compound', properties: { smiles: 'CC1=CC=CC=C1C2=NN(C)C3=C2C=CC(=C3)C(=O)N', phase: 'discovery', description: 'Next-generation BET inhibitor candidate. Improved BD2 selectivity profile.' } },
    // New gene nodes
    { id: 'jun', label: 'JUN', type: 'gene', properties: { function: 'transcription factor', oncogene: true, description: 'c-Jun forms AP-1 complex with c-Fos. Drives proliferation and invasion programs.' } },
    { id: 'tp53', label: 'TP53', type: 'gene', properties: { function: 'tumor suppressor', oncogene: false, description: 'TP53 gene encodes p53 protein. Most frequently mutated gene in human cancer.' } },
    { id: 'pik3ca', label: 'PIK3CA', type: 'gene', properties: { function: 'lipid kinase', oncogene: true, description: 'Catalytic subunit of PI3K. Hotspot mutations (E545K, H1047R) activate AKT signaling.' } },
    { id: 'akt1', label: 'AKT1', type: 'gene', properties: { function: 'serine/threonine kinase', oncogene: true, description: 'Central node in PI3K signaling. Phosphorylates substrates controlling growth and survival.' } },
    { id: 'braf-v600e', label: 'BRAF V600E', type: 'gene', properties: { function: 'serine/threonine kinase', oncogene: true, description: 'Constitutively active BRAF mutant. Drives MAPK signaling in melanoma and colorectal cancer.' } },
    { id: 'kras-g12c', label: 'KRAS G12C', type: 'gene', properties: { function: 'GTPase', oncogene: true, description: 'KRAS glycine-to-cysteine mutation at position 12. Covalently targetable with sotorasib.' } },
    // New protein nodes
    { id: 'brd4-bd2', label: 'BRD4-BD2', type: 'protein', properties: { function: 'bromodomain 2', targetable: true, description: 'Second bromodomain of BRD4. Selective BD2 inhibition reduces inflammatory gene expression.' } },
    { id: 'mdm2', label: 'MDM2', type: 'protein', properties: { function: 'E3 ubiquitin ligase', targetable: true, description: 'Negative regulator of p53. Ubiquitinates p53 leading to proteasomal degradation.' } },
    { id: 'hsp90', label: 'HSP90', type: 'protein', properties: { function: 'molecular chaperone', targetable: true, description: 'Heat shock protein 90. Stabilizes oncogenic client proteins including BRAF V600E.' } },
    { id: 'bcl2', label: 'BCL-2', type: 'protein', properties: { function: 'anti-apoptotic protein', targetable: true, description: 'BCL-2 family anti-apoptotic member. Overexpression blocks intrinsic apoptosis in lymphoma.' } },
    // New compound nodes
    { id: 'jq1-pf-v4', label: 'JQ1-PF-v4', type: 'compound', properties: { smiles: 'CC1=C(...)F', phase: 'preclinical', description: 'Para-fluoro JQ1 derivative with reduced hERG liability. Improved BD2 selectivity.' } },
    { id: 'amg-510', label: 'AMG-510', type: 'compound', properties: { smiles: '', phase: 'FDA approved', description: 'Sotorasib. First-in-class KRAS G12C covalent inhibitor. Approved for NSCLC.' } },
    { id: 'vemurafenib', label: 'Vemurafenib', type: 'compound', properties: { smiles: '', phase: 'FDA approved', description: 'BRAF V600E kinase inhibitor. Approved for metastatic melanoma.' } },
    { id: 'lzd-allosteric-v3', label: 'LZD-allosteric-v3', type: 'compound', properties: { smiles: '', phase: 'preclinical', description: 'Leucine zipper disruptor allosteric modulator. Targets c-Fos/c-Jun dimerization interface.' } },
    { id: 'navitoclax', label: 'Navitoclax', type: 'compound', properties: { smiles: '', phase: 'phase II', description: 'BCL-2/BCL-XL inhibitor. Thrombocytopenia limits dosing; venetoclax successor preferred.' } },
    // New pathway nodes
    { id: 'apoptosis-intrinsic', label: 'Apoptosis-Intrinsic', type: 'pathway', properties: { role: 'mitochondrial cell death', description: 'BCL-2 family-regulated mitochondrial pathway. Cytochrome c release activates caspase-9.' } },
    { id: 'wnt', label: 'Wnt-Signaling', type: 'pathway', properties: { role: 'developmental signaling', description: 'Wnt/beta-catenin pathway. Controls cell fate and stemness; frequently activated in cancer.' } },
    { id: 'mtor', label: 'mTOR-Pathway', type: 'pathway', properties: { role: 'growth regulation', description: 'mTORC1/2 complexes integrate nutrient and growth signals. Downstream of PI3K/AKT.' } },
    // New disease nodes
    { id: 'melanoma', label: 'Melanoma', type: 'disease', properties: { icd: 'C43', description: 'Aggressive skin cancer driven by BRAF mutations. Targeted therapy with BRAF/MEK inhibitors.' } },
    { id: 'lung-adenocarcinoma', label: 'Lung-Adenocarcinoma', type: 'disease', properties: { icd: 'C34', description: 'Most common lung cancer subtype. KRAS mutations in 30% of cases; targetable with G12C inhibitors.' } },
  ];

  const edges: GraphEdge[] = [
    // Original 13 edges
    { id: 'e1', source: 'c-myc', target: 'max', relationship: 'binds_to', weight: 0.95, evidence_count: 342 },
    { id: 'e2', source: 'c-myc', target: 'mapk', relationship: 'activates', weight: 0.78, evidence_count: 89 },
    { id: 'e3', source: 'c-myc', target: 'pi3k', relationship: 'activates', weight: 0.72, evidence_count: 67 },
    { id: 'e4', source: 'c-myc', target: 'tnbc', relationship: 'associated_with', weight: 0.88, evidence_count: 156 },
    { id: 'e5', source: 'c-fos', target: 'mapk', relationship: 'activates', weight: 0.82, evidence_count: 201 },
    { id: 'e6', source: 'c-fos', target: 'tnbc', relationship: 'associated_with', weight: 0.65, evidence_count: 45 },
    { id: 'e7', source: 'brd4', target: 'c-myc', relationship: 'activates', weight: 0.91, evidence_count: 278 },
    { id: 'e8', source: 'jQ1', target: 'brd4', relationship: 'inhibits', weight: 0.94, evidence_count: 412 },
    { id: 'e9', source: 'omomyc', target: 'c-myc', relationship: 'inhibits', weight: 0.87, evidence_count: 56 },
    { id: 'e10', source: 'p53', target: 'apoptosis', relationship: 'activates', weight: 0.93, evidence_count: 523 },
    { id: 'e11', source: 'c-myc', target: 'p53', relationship: 'inhibits', weight: 0.71, evidence_count: 98 },
    { id: 'e12', source: 'bet-inhibitor-x', target: 'brd4', relationship: 'inhibits', weight: 0.81, evidence_count: 12 },
    { id: 'e13', source: 'c-myc', target: 'apoptosis', relationship: 'inhibits', weight: 0.68, evidence_count: 134 },
    // New edges (21 additional)
    { id: 'e14', source: 'c-myc', target: 'max', relationship: 'dimerizes_with', weight: 0.96, evidence_count: 412 },
    { id: 'e15', source: 'c-myc', target: 'bcl2', relationship: 'transcriptionally_activates', weight: 0.74, evidence_count: 89 },
    { id: 'e16', source: 'c-myc', target: 'brd4-bd2', relationship: 'co_expressed_with', weight: 0.82, evidence_count: 156 },
    { id: 'e17', source: 'brd4-bd2', target: 'jq1-pf-v4', relationship: 'bromodomain_binds', weight: 0.91, evidence_count: 234 },
    { id: 'e18', source: 'brd4-bd2', target: 'tnbc', relationship: 'regulates', weight: 0.78, evidence_count: 112 },
    { id: 'e19', source: 'jq1-pf-v4', target: 'brd4-bd2', relationship: 'inhibits', weight: 0.93, evidence_count: 198 },
    { id: 'e20', source: 'c-fos', target: 'jun', relationship: 'forms_complex_with', weight: 0.94, evidence_count: 567 },
    { id: 'e21', source: 'c-fos', target: 'mapk', relationship: 'activates', weight: 0.85, evidence_count: 312 },
    { id: 'e22', source: 'braf-v600e', target: 'mapk', relationship: 'constitutively_activates', weight: 0.97, evidence_count: 892 },
    { id: 'e23', source: 'braf-v600e', target: 'vemurafenib', relationship: 'inhibited_by', weight: 0.89, evidence_count: 445 },
    { id: 'e24', source: 'braf-v600e', target: 'melanoma', relationship: 'associated_with', weight: 0.92, evidence_count: 678 },
    { id: 'e25', source: 'kras-g12c', target: 'pi3k', relationship: 'activates', weight: 0.81, evidence_count: 234 },
    { id: 'e26', source: 'kras-g12c', target: 'mapk', relationship: 'activates', weight: 0.88, evidence_count: 456 },
    { id: 'e27', source: 'kras-g12c', target: 'amg-510', relationship: 'covalently_inhibited_by', weight: 0.91, evidence_count: 312 },
    { id: 'e28', source: 'kras-g12c', target: 'lung-adenocarcinoma', relationship: 'associated_with', weight: 0.86, evidence_count: 534 },
    { id: 'e29', source: 'tp53', target: 'apoptosis', relationship: 'induces', weight: 0.95, evidence_count: 678 },
    { id: 'e30', source: 'tp53', target: 'mdm2', relationship: 'inhibited_by', weight: 0.88, evidence_count: 423 },
    { id: 'e31', source: 'mdm2', target: 'tp53', relationship: 'ubiquitinates', weight: 0.86, evidence_count: 345 },
    { id: 'e32', source: 'bcl2', target: 'apoptosis-intrinsic', relationship: 'suppresses', weight: 0.82, evidence_count: 267 },
    { id: 'e33', source: 'bcl2', target: 'navitoclax', relationship: 'inhibited_by', weight: 0.87, evidence_count: 189 },
    { id: 'e34', source: 'hsp90', target: 'braf-v600e', relationship: 'chaperones', weight: 0.79, evidence_count: 156 },
    { id: 'e35', source: 'pik3ca', target: 'akt1', relationship: 'activates', weight: 0.91, evidence_count: 412 },
    { id: 'e36', source: 'akt1', target: 'mtor', relationship: 'activates', weight: 0.88, evidence_count: 345 },
  ];

  return { nodes, edges };
}

export function getMockTimelineEvents(): TimelineEvent[] {
  return [
    {
      id: '1',
      type: 'hypothesis_created',
      title: 'Hypothesis Initiated',
      description: 'New hypothesis targeting c-Myc for TNBC treatment',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '2',
      type: 'agent_action',
      title: 'Biosynthesis Agent',
      description: 'Traversed hypergraph: identified BRD4-c-Myc axis and proposed JQ1 derivative',
      timestamp: new Date(Date.now() - 3000000).toISOString(),
      agentType: 'biosynthesis',
    },
    {
      id: '3',
      type: 'agent_action',
      title: 'ADMET Skeptic',
      description: 'Flagged moderate hERG liability; recommended structural modification at position 4',
      timestamp: new Date(Date.now() - 2400000).toISOString(),
      agentType: 'admet_skeptic',
    },
    {
      id: '4',
      type: 'agent_action',
      title: 'Code-Architect Agent',
      description: 'Generated AutoDock Vina pipeline with receptor PDB: 6Y7R',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      agentType: 'code_architect',
    },
    {
      id: '5',
      type: 'simulation_started',
      title: 'Simulation Dispatched',
      description: 'AutoDock Vina molecular docking job queued on Fargate',
      timestamp: new Date(Date.now() - 1200000).toISOString(),
    },
    {
      id: '6',
      type: 'simulation_completed',
      title: 'Simulation Complete',
      description: 'Docking score: -8.4 kcal/mol, RMSD: 1.2A - exceeds threshold',
      timestamp: new Date(Date.now() - 600000).toISOString(),
    },
    {
      id: '7',
      type: 'version_generated',
      title: 'Hypothesis v2 Generated',
      description: 'Refined SMILES with hERG-mitigating substitution; confidence 0.82',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      agentType: 'memory_broker',
    },
  ];
}
