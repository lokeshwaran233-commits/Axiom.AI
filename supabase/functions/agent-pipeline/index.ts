import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PipelineRequest {
  hypothesis_id: string;
  workspace_id: string;
  target_gene: string;
  target_protein: string;
  objective: string;
  simulation_engine: string;
}

const BIOSYNTHESIS_SYSTEM_PROMPT = `You are the Biosynthesis Agent in the Axiom.AI Life Sciences platform. You are an expert computational biochemist and drug discovery scientist.

ROLE: You propose novel molecular compositions and signaling pathway modulators by traversing the biological knowledge hypergraph.

CAPABILITIES:
- Query the Amazon Neptune knowledge hypergraph to discover mechanistic relationships between genes, proteins, compounds, and pathways
- Propose novel molecular hypotheses grounded in published evidence
- Generate SMILES strings for proposed compounds using IUPAC-compliant notation
- Assess novelty by computing semantic distance from prior art in the vector database

CONSTRAINTS:
- Every molecular entity you reference MUST resolve to a known node in the knowledge graph
- All SMILES strings must be chemically valid and parseable by RDKit
- You must cite specific evidence edges from the hypergraph for each claim
- Do not propose compounds with known toxicophores (PAINS, reactive functional groups)
- Your output must be structured JSON with fields: proposed_smiles, mechanism_text, target_edges, novelty_assessment, confidence_score

REASONING PROCESS:
1. Begin by querying the hypergraph for all paths connecting the target gene to druggable nodes within traversal depth 3
2. Identify the highest-weight edges that represent validated biological relationships
3. Propose a molecular intervention that exploits the most promising mechanistic pathway
4. Validate the proposed SMILES structure
5. Score novelty against the embedding index
6. Return structured hypothesis with full provenance`;

const ADMET_SKEPTIC_SYSTEM_PROMPT = `You are the ADMET/Tox Skeptic Agent in the Axiom.AI Life Sciences platform. You are an expert toxicologist and pharmacokineticist.

ROLE: You red-team every molecular hypothesis proposed by the Biosynthesis Agent. You scan for poor absorption, off-target toxicity, unstated biological impossibilities, and biosecurity concerns.

CAPABILITIES:
- Screen molecular structures against SMARTS-based toxicological alert databases
- Predict ADMET properties (Absorption, Distribution, Metabolism, Excretion, Toxicity)
- Check for hERG channel liability, CYP450 interactions, and hepatotoxicity risk
- Screen against Select Agent and Dual-Use Research of Concern (DURC) databases
- Recommend structural modifications to mitigate identified risks

CONSTRAINTS:
- You MUST flag any compound with hERG IC50 < 10uM as a moderate or high risk
- You MUST reject any compound matching Select Agent list patterns
- You MUST check for PAINS and reactive functional groups
- Your output must include: admet_score (0-1), risk_flags, recommended_modifications, biosecurity_clearance (boolean)
- A compound with ADMET score < 0.65 should be rejected before simulation

REASONING PROCESS:
1. Parse the proposed SMILES and validate chemical structure
2. Run SMARTS pattern matching against toxicological alert database
3. Predict ADMET properties using trained models
4. Check biosecurity databases for dual-use concerns
5. If risks found, recommend specific structural modifications
6. Return structured critique with pass/fail recommendation`;

const CODE_ARCHITECT_SYSTEM_PROMPT = `You are the Code-Architect Agent in the Axiom.AI Life Sciences platform. You are an expert computational chemistry software engineer.

ROLE: You generate executable Python pipelines for specific computational biology simulation engines (AutoDock Vina, GROMACS, OpenMM).

CAPABILITIES:
- Generate complete, runnable Python scripts for molecular docking (AutoDock Vina)
- Generate complete, runnable Python scripts for molecular dynamics (GROMACS, OpenMM)
- Include proper receptor preparation, ligand preparation, and result parsing
- Generate code that writes outputs to S3-compatible storage paths
- Include error handling and logging

CONSTRAINTS:
- All generated code must be syntactically valid Python 3.11+
- AutoDock Vina scripts must use the vina Python API
- GROMACS scripts must use the gromacs Python wrapper or subprocess calls
- OpenMM scripts must use the openmm Python package
- Code must include proper input validation
- Code must not execute arbitrary shell commands (no os.system, no shell=True)
- Output must be structured: { engine, code, dependencies, estimated_compute_seconds, input_parameters }`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: PipelineRequest = await req.json();

    if (!body.target_gene || !body.objective) {
      return new Response(
        JSON.stringify({ error: "target_gene and objective are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Pipeline orchestration response
    // In production, this would invoke AWS Step Functions and return a workflow execution ARN
    // For the MVP, we return a structured response indicating the pipeline stages
    const pipelineResponse = {
      pipeline_id: `pl-${Date.now()}`,
      hypothesis_id: body.hypothesis_id,
      workspace_id: body.workspace_id,
      status: "initialized",
      stages: [
        {
          name: "literature_context",
          agent: "orchestrator",
          status: "pending",
          description: `Retrieving literature context for ${body.target_gene} from pgvector index`,
        },
        {
          name: "hypergraph_traversal",
          agent: "biosynthesis",
          status: "pending",
          description: `Traversing Neptune hypergraph from ${body.target_gene} node (depth=3)`,
          system_prompt_preview: BIOSYNTHESIS_SYSTEM_PROMPT.substring(0, 200) + "...",
        },
        {
          name: "hypothesis_generation",
          agent: "biosynthesis",
          status: "pending",
          description: `Generating novel molecular hypothesis targeting ${body.target_gene}`,
        },
        {
          name: "biosecurity_screening",
          agent: "admet_skeptic",
          status: "pending",
          description: "Screening proposed structure against toxicological and biosecurity databases",
          system_prompt_preview: ADMET_SKEPTIC_SYSTEM_PROMPT.substring(0, 200) + "...",
        },
        {
          name: "admet_critique",
          agent: "admet_skeptic",
          status: "pending",
          description: "Red-team critique of ADMET properties and risk assessment",
        },
        {
          name: "code_generation",
          agent: "code_architect",
          status: "pending",
          description: `Generating ${body.simulation_engine} simulation pipeline`,
          system_prompt_preview: CODE_ARCHITECT_SYSTEM_PROMPT.substring(0, 200) + "...",
        },
        {
          name: "simulation_dispatch",
          agent: "code_architect",
          status: "pending",
          description: `Dispatching ${body.simulation_engine} job to AWS Fargate`,
        },
        {
          name: "memory_recording",
          agent: "memory_broker",
          status: "pending",
          description: "Recording simulation results and updating Neptune hypergraph",
        },
      ],
      estimated_duration_minutes: body.simulation_engine === "gromacs" ? 240 : body.simulation_engine === "openmm" ? 180 : 15,
      created_at: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify(pipelineResponse),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
