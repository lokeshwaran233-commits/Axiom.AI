# Axiom.AI — Autonomous Drug Discovery Platform

## Overview

Axiom.AI is a multi-agent AI research platform designed for medicinal chemists and computational biology research leads working in oncology drug discovery. The platform orchestrates a pipeline of specialized AI agents — Biosynthesis, ADMET Skeptic, Code-Architect, Simulation Dispatcher, and Memory Broker — that collaboratively generate, critique, refine, and validate molecular hypotheses against real biological targets.

The platform provides full observability into every agent decision through an audit-grade trace log, interactive knowledge hypergraph exploration of biological relationships, RAG-powered literature intelligence across millions of PubMed records, and centralized simulation monitoring for molecular docking and dynamics jobs dispatched to cloud compute infrastructure.

## Live Demo

[https://axiom-ai.vercel.app](https://axiom-ai-rouge.vercel.app)

## Key Features

- **Mission Control Dashboard** — Real-time pipeline monitoring with active hypotheses, agent activity feed, and timeline
- **Multi-Hypothesis Workspace** — Formulate, track, and refine molecular hypotheses with ADMET, docking, confidence, and novelty scoring
- **Interactive Knowledge Hypergraph** — 28 nodes and 34 labeled biological relationships with force-directed visualization, edge styling by relationship type, and deep-link to literature search
- **Agent Trace** — Full observability log for every AI agent decision with collapsible input/output, chain-of-thought reasoning, and token usage tracking
- **Simulation Center** — Molecular docking and MD simulation monitor with sortable table, pose affinity charts, infrastructure cost estimates, and Fargate job tracking
- **Literature Intelligence** — RAG-powered search across 2.8M PubMed chunks with pgvector similarity and BioBERT named entity recognition
- **Reports & Exports** — Compliance-ready report generation (Audit Trail, Convergence Summary, Simulation Export)

## Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS
- **Visualization:** Canvas 2D (Knowledge Graph force-directed layout)
- **AI Layer:** Claude API (claude-sonnet-4-20250514) — multi-agent orchestration
- **Vector Search:** pgvector + BioBERT NER (Literature Intelligence)
- **Compute:** AWS Fargate (Simulation dispatch)
- **Database:** Supabase (hypothesis storage + negative data vault)
- **Graph DB:** Amazon Neptune (knowledge hypergraph)
- **Infrastructure:** AWS Step Functions (pipeline orchestration)
- **Deployment:** Vercel

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL for database and auth |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key (public, safe for client-side) |
| `VITE_ANTHROPIC_API_KEY` | Claude API key for agent orchestration |
| `VITE_AWS_REGION` | AWS region for Fargate simulation dispatch |

## Architecture Overview

The multi-agent pipeline follows a sequential orchestration pattern: the **Biosynthesis** agent traverses the knowledge hypergraph and literature to propose molecular scaffolds; the **ADMET Skeptic** red-teams the output for toxicity, bioavailability, and biosecurity concerns; the **Code-Architect** generates validated simulation pipelines (AutoDock Vina, GROMACS, OpenMM); the **Simulation Dispatcher** submits jobs to AWS Fargate; and the **Memory Broker** ingests results, updates the knowledge graph, and records negative data to prevent redundant exploration. Each step is logged with full chain-of-thought reasoning in the Agent Trace.

## Portfolio Context

Built as a portfolio project demonstrating AI product design, life sciences domain knowledge, and multi-agent system architecture. All simulation data is mocked for demonstration purposes — no real Claude API calls, Fargate jobs, or Neptune queries are executed in the current build. The platform showcases how a production drug discovery tool would integrate these services with full observability and regulatory audit trails.

## License

MIT
