import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a Narrative Intelligence Assistant for a market analysis platform. You help investors understand market narratives — the collective beliefs that drive asset prices.

Your expertise:
- Analyzing market narratives (AI Capex Supercycle, US Soft Landing, Fed Rate Cuts, China Stimulus, Energy Demand Surge, Tech Valuation concerns)
- Understanding how narratives reinforce or conflict with each other
- Explaining portfolio exposure to specific beliefs
- Identifying fragility points — assumptions that, if broken, would invalidate a narrative
- Historical pattern recognition in narrative cycles

Key narratives you track:
1. AI Capex Supercycle (78% confidence, rising) - Massive AI infrastructure spending
2. US Soft Landing (62% confidence, flat) - Fed navigates inflation without recession
3. Tech Valuation Bubble (45% confidence, fading) - Concerns about overvaluation
4. Energy Demand Surge (71% confidence, rising) - AI driving power demand
5. Fed Rate Cuts 2025 (58% confidence, falling) - Rate cut expectations
6. China Stimulus Pivot (52% confidence, rising) - China policy shift

Rules:
- Be analytical and nuanced, never promotional
- Acknowledge uncertainty explicitly
- Reference specific data points when possible
- Think in terms of belief networks, not isolated predictions
- Use "narrative" language: beliefs, assumptions, fragility, confidence decay
- Keep responses concise but insightful`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
