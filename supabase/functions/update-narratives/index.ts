import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing env vars");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if narratives already exist
    const { data: existing } = await supabase.from("narratives").select("id").limit(1);

    const prompt = existing && existing.length > 0
      ? `You are a market narrative analyst. Update the following existing narratives with the latest market conditions as of today. For each narrative, provide updated confidence scores, trends, and any new evidence.

Return a JSON object with two keys:
- "narratives": array of narrative objects
- "edges": array of belief edge objects

Each narrative must have: id (kebab-case slug), name, summary (2-3 sentences), confidence_score (0-100), confidence_trend ("up"/"down"/"flat"), assumptions (array of {id, text, fragilityScore}), supporting_evidence (array of {id, source, description, weight}), contradicting_evidence (same format), decay_half_life_days, related_reinforces (array of narrative ids), related_conflicts, related_overlaps, affected_assets (array of {ticker, name, exposureWeight from -1 to 1}), tags (array of strings).

Each edge must have: id, from_narrative_id, to_narrative_id, relationship ("reinforces"/"conflicts"/"depends_on"), strength (0-1).

Generate exactly 16 narratives covering these themes: AI Capex Supercycle, US Soft Landing, Tech Valuation Bubble, Energy Demand Surge, Fed Rate Cuts 2025, China Stimulus Pivot, Japan Reflation, De-dollarization, Commodity Supercycle, Defense Spending Boom, India Growth Story, Commercial Real Estate Crisis, Private Credit Boom, Onshoring/Reshoring, Crypto Institutional Adoption, Healthcare AI Revolution.

Make confidence scores and evidence reflect current real-world conditions. Include at least 15 edges connecting related narratives. Each narrative should have 3-6 affected real tickers with sensible exposure weights.

Return ONLY valid JSON, no markdown.`
      : `You are a market narrative analyst. Create an initial set of market narratives reflecting current conditions.

Return a JSON object with two keys:
- "narratives": array of narrative objects  
- "edges": array of belief edge objects

Each narrative must have: id (kebab-case slug), name, summary (2-3 sentences), confidence_score (0-100), confidence_trend ("up"/"down"/"flat"), assumptions (array of {id, text, fragilityScore 0-100}), supporting_evidence (array of {id, source, description, weight 0-1}), contradicting_evidence (same format), decay_half_life_days, related_reinforces (array of narrative ids), related_conflicts, related_overlaps, affected_assets (array of {ticker, name, exposureWeight from -1 to 1}), tags (array of strings).

Each edge must have: id, from_narrative_id, to_narrative_id, relationship ("reinforces"/"conflicts"/"depends_on"), strength (0-1).

Generate exactly 16 narratives covering: AI Capex Supercycle, US Soft Landing, Tech Valuation Bubble, Energy Demand Surge, Fed Rate Cuts 2025, China Stimulus Pivot, Japan Reflation, De-dollarization, Commodity Supercycle, Defense Spending Boom, India Growth Story, Commercial Real Estate Crisis, Private Credit Boom, Onshoring/Reshoring, Crypto Institutional Adoption, Healthcare AI Revolution.

Make confidence scores and evidence reflect current real-world conditions. Include at least 15 edges connecting related narratives. Each narrative should have 3-6 affected real tickers with sensible exposure weights.

Return ONLY valid JSON, no markdown.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI error:", aiResp.status, t);
      throw new Error(`AI error ${aiResp.status}`);
    }

    const aiData = await aiResp.json();
    let content = aiData.choices?.[0]?.message?.content || "";
    
    // Strip markdown code fences if present
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    
    const parsed = JSON.parse(content);
    const narratives = parsed.narratives || [];
    const edges = parsed.edges || [];

    console.log(`Parsed ${narratives.length} narratives and ${edges.length} edges`);

    // Upsert narratives
    for (const n of narratives) {
      const { error } = await supabase.from("narratives").upsert({
        id: n.id,
        name: n.name,
        summary: n.summary,
        confidence_score: n.confidence_score,
        confidence_trend: n.confidence_trend || "flat",
        confidence_last_updated: new Date().toISOString(),
        assumptions: n.assumptions || [],
        supporting_evidence: n.supporting_evidence || [],
        contradicting_evidence: n.contradicting_evidence || [],
        decay_half_life_days: n.decay_half_life_days || 30,
        decay_last_reinforced: new Date().toISOString(),
        related_reinforces: n.related_reinforces || [],
        related_conflicts: n.related_conflicts || [],
        related_overlaps: n.related_overlaps || [],
        affected_assets: n.affected_assets || [],
        history: n.history || [],
        tags: n.tags || [],
      }, { onConflict: "id" });
      if (error) console.error(`Upsert narrative ${n.id} error:`, error);
    }

    // Delete old edges and insert new ones
    await supabase.from("belief_edges").delete().neq("id", "");
    for (const e of edges) {
      const { error } = await supabase.from("belief_edges").upsert({
        id: e.id,
        from_narrative_id: e.from_narrative_id,
        to_narrative_id: e.to_narrative_id,
        relationship: e.relationship,
        strength: e.strength || 0.5,
      }, { onConflict: "id" });
      if (error) console.error(`Upsert edge ${e.id} error:`, error);
    }

    return new Response(JSON.stringify({ success: true, narratives: narratives.length, edges: edges.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("update-narratives error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
