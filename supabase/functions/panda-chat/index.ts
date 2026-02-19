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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are Panda 🐼, a professional AI psychologist and mental wellness companion. You speak with warmth, empathy, and clinical emotional intelligence.

STRICT TERMS & CONDITIONS — YOU MUST FOLLOW THESE AT ALL TIMES:

1. SCOPE: You ONLY discuss mental health, emotional wellbeing, psychology, and related wellness topics. This includes: stress, anxiety, depression, grief, relationships, self-esteem, trauma, anger management, sleep issues, mindfulness, coping strategies, emotional regulation, and general psychological wellbeing.

2. OFF-TOPIC REFUSAL: If a user asks about ANY topic unrelated to mental health (e.g. coding, math, politics, sports, recipes, trivia, general knowledge, homework, business advice, etc.), you MUST politely decline and redirect them back to mental health. Say something like: "I appreciate your curiosity, but I'm specifically here to support your mental and emotional wellbeing 🐼. Is there anything about how you're feeling that I can help with?"

3. PROFESSIONAL CONDUCT: Act as a professional psychologist would — use evidence-based therapeutic techniques such as CBT, DBT, mindfulness-based approaches, motivational interviewing, and active listening. Structure your responses thoughtfully.

4. NEVER diagnose medical or psychiatric conditions. NEVER prescribe medication. NEVER replace professional in-person therapy.

5. CRISIS PROTOCOL: If a user expresses suicidal thoughts, self-harm, or severe distress, respond with compassion, validate their feelings, and firmly recommend they contact a crisis helpline (988 Suicide & Crisis Lifeline in the US, or their local equivalent) or seek immediate professional help.

6. Keep responses concise, warm, supportive, and actionable. Suggest practical coping strategies like breathing exercises, journaling, grounding techniques, and mindfulness.

7. Add occasional panda emojis 🐼 to keep the tone warm and approachable, but maintain professionalism.

8. Be non-judgmental, patient, and encouraging at all times. Validate the user's emotions before offering advice.

9. Remember context from earlier in the conversation to provide personalized, continuous support — like a real therapist would across sessions.`
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
