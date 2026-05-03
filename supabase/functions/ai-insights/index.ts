import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 24 * 60 * 60 * 1000;
const STREAM_TIMEOUT_MS = 10_000;
const RETRY_DELAY_MS = 2_000;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const startTime = Date.now();
  let userId = "";
  let tokenCount = 0;

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const logCall = async (error?: string, cached = false) => {
    try {
      await adminClient.from("ai_insights_logs").insert({
        user_id: userId,
        duration_ms: Date.now() - startTime,
        token_count: tokenCount,
        error: error ?? null,
        cached,
      });
    } catch (e) {
      console.error("log failed:", e);
    }
  };

  try {
    // 1. Verify JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: CORS });
    }

    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: CORS });
    }
    userId = user.id;

    // 2. Parse body
    const body = await req.json().catch(() => null);
    if (!body?.planHash || !body?.prompt) {
      return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400, headers: CORS });
    }
    const { planHash, prompt } = body;

    // 3. Rate limit check
    const windowStart = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
    const { data: usageRows, error: usageError } = await adminClient
      .from("ai_insights_usage")
      .select("id, used_at, plan_hash, response")
      .eq("user_id", userId)
      .gte("used_at", windowStart)
      .order("used_at", { ascending: true });

    if (usageError) {
      await logCall("rate limit DB error");
      return new Response(JSON.stringify({ error: "Service unavailable" }), { status: 503, headers: CORS });
    }

    if (usageRows.length >= RATE_LIMIT) {
      const resetAt = new Date(new Date(usageRows[0].used_at).getTime() + RATE_WINDOW_MS).toISOString();
      return new Response(
        JSON.stringify({ error: "rate_limited", remaining: 0, reset_at: resetAt }),
        { status: 429, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // 4. Cache check
    const cached = usageRows.find((r) => r.plan_hash === planHash && r.response);
    if (cached) {
      await logCall(undefined, true);
      return new Response(
        JSON.stringify({ cached: true, response: cached.response, remaining: RATE_LIMIT - usageRows.length }),
        { headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // 5. Insert usage row before streaming
    const { data: usageRow, error: insertError } = await adminClient
      .from("ai_insights_usage")
      .insert({ user_id: userId, plan_hash: planHash })
      .select("id")
      .single();

    if (insertError || !usageRow) {
      await logCall("insert failed");
      return new Response(JSON.stringify({ error: "Service unavailable" }), { status: 503, headers: CORS });
    }

    const remaining = RATE_LIMIT - usageRows.length - 1;

    // 6. Call Anthropic — retry once on 529
    const callAnthropic = async (): Promise<Response> => {
      const payload = {
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        stream: true,
        system: "You are CorpusCalc Insights, an India-specific retirement planning assistant. Generate personalised investment roadmaps. Use Indian context: ₹, lakhs, crores, Indian instruments only. Never recalculate numbers given to you — only interpret and advise. Be specific and warm.",
        messages: [{ role: "user", content: prompt }],
      };

      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(payload),
      });

      if (r.status === 529) {
        await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
        return fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify(payload),
        });
      }
      return r;
    };

    let anthropicResp: Response;
    try {
      anthropicResp = await callAnthropic();
    } catch (e) {
      await logCall(`anthropic fetch failed: ${e}`);
      return new Response(JSON.stringify({ error: "AI unavailable" }), { status: 503, headers: CORS });
    }

    if (!anthropicResp.ok || !anthropicResp.body) {
      await logCall(`anthropic error: ${anthropicResp.status}`);
      return new Response(JSON.stringify({ error: "AI error" }), { status: 502, headers: CORS });
    }

    // 7. Stream with timeout guard — never leave open silently
    let fullResponse = "";
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = anthropicResp.body!.getReader();
        let lastTokenAt = Date.now();
        let closed = false;

        const safeClose = () => {
          if (!closed) { closed = true; controller.close(); }
        };

        const timeoutId = setInterval(() => {
          if (Date.now() - lastTokenAt > STREAM_TIMEOUT_MS) {
            clearInterval(timeoutId);
            controller.enqueue(encoder.encode(`data: {"type":"error","error":"stream_timeout"}\n\n`));
            safeClose();
            reader.cancel();
          }
        }, 1000);

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            lastTokenAt = Date.now();

            controller.enqueue(value);

            const chunk = decoder.decode(value, { stream: true });
            for (const line of chunk.split("\n")) {
              if (!line.startsWith("data: ")) continue;
              try {
                const evt = JSON.parse(line.slice(6));
                if (evt.type === "content_block_delta" && evt.delta?.text) {
                  fullResponse += evt.delta.text;
                  tokenCount++;
                }
              } catch { /* non-JSON SSE */ }
            }
          }

          clearInterval(timeoutId);
          controller.enqueue(encoder.encode(`data: {"type":"meta","remaining":${remaining}}\n\n`));
          safeClose();

          if (fullResponse) {
            await adminClient.from("ai_insights_usage").update({ response: fullResponse }).eq("id", usageRow.id);
          }
          await logCall();
        } catch (e) {
          clearInterval(timeoutId);
          controller.enqueue(encoder.encode(`data: {"type":"error","error":"stream_read_failed"}\n\n`));
          safeClose();
          await logCall(`stream error: ${e}`);
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...CORS,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Remaining-Insights": String(remaining),
      },
    });
  } catch (e) {
    await logCall(`unhandled: ${e}`);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: CORS });
  }
});
