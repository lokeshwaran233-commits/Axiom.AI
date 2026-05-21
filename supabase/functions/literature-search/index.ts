import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SearchRequest {
  query: string;
  limit?: number;
}

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

    const body: SearchRequest = await req.json();

    if (!body.query) {
      return new Response(
        JSON.stringify({ error: "query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const limit = body.limit || 10;

    // In production, this would:
    // 1. Embed the query using text-embedding-3-large
    // 2. Perform pgvector cosine similarity search on literature_chunks.embedding
    // 3. Cross-encode and re-rank results
    // 4. Return matched chunks with metadata
    const searchResponse = {
      query: body.query,
      limit,
      results: [
        {
          chunk_id: "mock-1",
          paper_id: "PMC1234567",
          title: "BRD4-c-Myc transcriptional axis as a therapeutic target in triple-negative breast cancer",
          journal: "Nature Cancer",
          year: 2024,
          doi: "10.1038/s43018-024-00123-4",
          snippet: "The BRD4-c-Myc transcriptional axis represents a critical dependency in TNBC. Inhibition of BRD4 with JQ1 derivatives reduces c-Myc transcription and induces apoptosis in MYC-amplified cell lines.",
          relevance_score: 0.94,
          entity_mentions: ["BRD4", "c-Myc", "JQ1", "TNBC", "apoptosis"],
        },
        {
          chunk_id: "mock-2",
          paper_id: "PMC2345678",
          title: "Structural basis for selective inhibition of BRD4 BD2 by triazole-containing small molecules",
          journal: "Journal of Medicinal Chemistry",
          year: 2023,
          doi: "10.1021/acs.jmedchem.3b00456",
          snippet: "Crystal structures of BRD4 BD1 and BD2 in complex with triazole-modified JQ1 derivatives reveal a conformational selectivity mechanism.",
          relevance_score: 0.89,
          entity_mentions: ["BRD4", "BD2", "JQ1", "triazole", "selectivity"],
        },
      ],
      total_indexed_chunks: 2847293,
      search_method: "pgvector_cosine_similarity",
      embedding_model: "text-embedding-3-large",
      created_at: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify(searchResponse),
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
