const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 1500;

interface PlanState {
  name: string;
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  monthlyExpenses: number;
  annualExpenses: number;
  salaryIncome: number;
  existingCorpus: number;
  sipAmount: number;
  sipGrowthMode: "flat" | "salary" | "fixed";
  yearsToRetirement: number;
  corpusResult: number;
  requiredCorpus: number;
  gap: number;
}

interface RequestBody {
  planState: PlanState;
  userId: string;
}

interface Diagnostic {
  severity: "critical" | "warning" | "ok";
  label: string;
  detail: string;
}

interface Suggestion {
  label: string;
  impact: string;
  stateDiff: Record<string, unknown>;
}

interface InsightOutput {
  summary: string;
  diagnostics: Diagnostic[];
  suggestions: Suggestion[];
}

async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function buildUserMessage(p: PlanState): string {
  const gapLabel = p.gap > 0 ? "SHORTFALL" : "SURPLUS";
  return `Analyse this retirement plan:

Name: ${p.name}
Current age: ${p.currentAge} | Retirement age: ${p.retirementAge} | Life expectancy: ${p.lifeExpectancy}
Years to retirement: ${p.yearsToRetirement}

Monthly expenses today: ₹${p.monthlyExpenses} | Annual one-time expenses: ₹${p.annualExpenses}
Current salary/income: ₹${p.salaryIncome}/month
Existing investments: ₹${p.existingCorpus}
Monthly SIP: ₹${p.sipAmount} (${p.sipGrowthMode} growth)

Corpus projected at retirement: ₹${p.corpusResult}
Corpus required at retirement: ₹${p.requiredCorpus}
Gap: ₹${p.gap} (${gapLabel})`;
}

const SYSTEM_PROMPT = `You are a retirement planning analyst specialising in Indian personal finance. You analyse retirement corpus plans and provide honest, specific, actionable feedback.

You understand:
- Indian inflation runs 5-7% annually (healthcare 8-10%)
- The 25x/30x/35x corpus multiplier rule based on retirement duration
- SIP compounding over long periods in Indian equity mutual funds (expected 10-12% CAGR)
- The difference between corpus required and corpus projected is the "gap" — the central diagnostic
- Indian retirement context: joint families, real estate as asset, EPF/PPF/NPS as instruments

Rules for your response:
- Always respond with valid JSON only — no preamble, no markdown, no explanation outside the JSON
- summary: 2-3 sentences, direct address, use rupee numbers.
- diagnostics: 3-5 items. Be specific — mention actual numbers from the plan, not generic advice.
- EPF rule: For any salaried user (salaryIncome > 0), check whether existingInvestments seems low relative to their age and salary. A 42-year-old earning ₹1.2L/month should have accumulated significant EPF by now. If existingInvestments appears to exclude EPF, flag it explicitly — many Indians forget to count EPF in their corpus. Always mention EPF by name.
- suggestions: 2-3 items. Each must be concrete and specific to this plan. stateDiff must contain only valid PlannerState fields that would improve the plan.
- Optimisation rule: If the user has investable surplus (sipAmount is less than 20% of salaryIncome), always include at least one tax-optimisation suggestion. Candidates in order of priority: NPS 80CCD(1B) — additional ₹50,000 deduction beyond 80C; step-up SIP — increasing SIP by 10% annually; ELSS for 80C if not already maximised. Name the specific section (80CCD, 80C) and the rupee benefit.
- Never use the word "robust". Never say "it's important to". Never use corporate jargon.
- Write like a smart friend who knows finance, not like a financial advisor covering liability.

You must return valid JSON matching this exact schema — no other field names are acceptable:
{
  "summary": "string — 2-3 sentences, direct address, rupee numbers",
  "diagnostics": [
    {
      "type": "critical | warning | positive | info",
      "title": "short label, max 8 words",
      "detail": "1-2 sentences with specific rupee numbers where possible"
    }
  ],
  "suggestions": [
    {
      "title": "action-oriented label, max 8 words",
      "detail": "1-2 sentences explaining what to do and why",
      "stateDiff": {}
    }
  ]
}
Use ONLY these field names: type, title, detail, stateDiff. Never use message, label, rationale, impact, description, body, or any other variant.`;

async function callAnthropic(userMessage: string): Promise<InsightOutput> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const body = {
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  };

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const content: string = data.content?.[0]?.text ?? "";

  const cleaned = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/,'').trim();
  return JSON.parse(cleaned) as InsightOutput;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { planState, userId } = body;
  if (!planState || !userId) {
    return new Response(JSON.stringify({ error: "missing_fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Supabase env vars not set");
    return new Response(JSON.stringify({ error: "server_misconfigured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const sbHeaders = {
    "Content-Type": "application/json",
    "apikey": supabaseServiceKey,
    "Authorization": `Bearer ${supabaseServiceKey}`,
  };

  // Rate limiting: hash the planState and check for recent identical request
  const planHash = await generateHash(JSON.stringify(planState));

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const rateRes = await fetch(
    `${supabaseUrl}/rest/v1/plan_insights?plan_hash=eq.${encodeURIComponent(planHash)}&created_at=gt.${encodeURIComponent(since)}&limit=1`,
    { headers: sbHeaders }
  ).catch((e) => { console.error("Rate limit check failed:", e); return null; });

  if (rateRes && rateRes.ok) {
    const rows = await rateRes.json();
    if (Array.isArray(rows) && rows.length > 0) {
      return new Response(
        JSON.stringify({ error: "rate_limited", retryAfter: "24h" }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  const userMessage = buildUserMessage(planState);

  let output: InsightOutput;
  try {
    output = await callAnthropic(userMessage);
  } catch (err) {
    console.error("Anthropic call failed (attempt 1):", err);
    try {
      output = await callAnthropic(userMessage);
    } catch (retryErr) {
      console.error("Anthropic call failed (attempt 2):", retryErr);
      return new Response(JSON.stringify({ error: "ai_unavailable" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Persist to plan_insights
  const insertRes = await fetch(`${supabaseUrl}/rest/v1/plan_insights`, {
    method: "POST",
    headers: { ...sbHeaders, "Prefer": "return=minimal" },
    body: JSON.stringify({
      user_id: userId,
      plan_hash: planHash,
      input_summary: planState,
      output,
    }),
  }).catch((e) => { console.error("Failed to persist insight:", e); return null; });

  if (insertRes && !insertRes.ok) {
    const errBody = await insertRes.text();
    console.error("Insert failed:", insertRes.status, errBody);
  }

  return new Response(JSON.stringify(output), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
});
