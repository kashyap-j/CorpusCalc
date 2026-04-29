const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 1500;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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

interface InsightOutput {
  summary: string;
  diagnostics: unknown[];
  suggestions: unknown[];
}

async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Maps Zustand PlannerState fields to the PlanState shape the AI prompt expects
function derivePlanState(raw: unknown): PlanState | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;

  const age = Number(s.age ?? s.currentAge ?? 30);
  const retAge = Number(s.retAge ?? s.retirementAge ?? 60);
  const lifeE = Number(s.lifeE ?? s.lifeExpectancy ?? 85);
  const yearsToRet = retAge - age;
  const salary = Number(s.salaryMonthly ?? s.salaryIncome ?? 0);
  const sipAmt = Number(s.sipAmt ?? s.sipAmount ?? 0);
  const sipReturn = Number(s.sipReturn ?? 12);
  const inflation = Number(s.inflation ?? 6);
  const invGR = Number(s.invGR ?? 10);

  const monthlyExp = s.expMode === "quick"
    ? Number(s.expQMo ?? s.monthlyExpenses ?? 0)
    : Number(s.monthlyExpenses ?? 0);
  const annualExp = s.expMode === "quick"
    ? Number(s.expQYr ?? s.annualExpenses ?? 0)
    : Number(s.annualExpenses ?? 0);

  const existing = s.existingCorpus !== undefined
    ? Number(s.existingCorpus)
    : s.invMode === "quick"
      ? Number(s.invQuick ?? 0)
      : Number(s.invMF ?? 0) + Number(s.invEQ ?? 0) + Number(s.invPF ?? 0) + Number(s.invDT ?? 0);

  // Compute projections if not provided
  let corpusResult = s.corpusResult !== undefined ? Number(s.corpusResult) : -1;
  let requiredCorpus = s.requiredCorpus !== undefined ? Number(s.requiredCorpus) : -1;

  if (corpusResult < 0) {
    const r = sipReturn / 100 / 12;
    const n = yearsToRet * 12;
    const existingGrown = existing * Math.pow(1 + invGR / 100, yearsToRet);
    const sipCorpus = r > 0 ? sipAmt * ((Math.pow(1 + r, n) - 1) / r) : sipAmt * n;
    corpusResult = Math.round(existingGrown + sipCorpus);
  }
  if (requiredCorpus < 0) {
    const moAtRet = monthlyExp * Math.pow(1 + inflation / 100, yearsToRet);
    const retDur = lifeE - retAge;
    const mult = retDur <= 20 ? 25 : retDur <= 30 ? 30 : 35;
    requiredCorpus = Math.round(moAtRet * 12 * mult);
  }

  const sipMode = String(s.sipMode ?? s.sipGrowthMode ?? "flat") as "flat" | "salary" | "fixed";

  return {
    name: String(s.name ?? "User"),
    currentAge: age,
    retirementAge: retAge,
    lifeExpectancy: lifeE,
    monthlyExpenses: monthlyExp,
    annualExpenses: annualExp,
    salaryIncome: salary,
    existingCorpus: existing,
    sipAmount: sipAmt,
    sipGrowthMode: sipMode,
    yearsToRetirement: yearsToRet,
    corpusResult,
    requiredCorpus,
    gap: requiredCorpus - corpusResult,
  };
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
Gap: ₹${Math.abs(p.gap)} (${gapLabel})`;
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

  const reqBody = {
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
    body: JSON.stringify(reqBody),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const content: string = data.content?.[0]?.text ?? "";
  const cleaned = content.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/, "").trim();
  return JSON.parse(cleaned) as InsightOutput;
}

function jsonResp(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  if (req.method !== "POST") {
    return jsonResp({ error: "method_not_allowed" }, 405);
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = await req.json() as Record<string, unknown>;
  } catch {
    return jsonResp({ error: "invalid_json" }, 400);
  }

  // Accept plannerState (new) or planState (old) field name
  const rawPlan = parsed.plannerState ?? parsed.planState;
  const planState = derivePlanState(rawPlan);
  if (!planState) {
    return jsonResp({ error: "missing_fields" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseServiceKey) {
    return jsonResp({ error: "server_misconfigured" }, 500);
  }

  const sbHeaders = {
    "Content-Type": "application/json",
    "apikey": supabaseServiceKey,
    "Authorization": `Bearer ${supabaseServiceKey}`,
  };

  const planHash = typeof parsed.plan_hash === "string"
    ? parsed.plan_hash
    : await generateHash(JSON.stringify(planState));

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const rateRes = await fetch(
    `${supabaseUrl}/rest/v1/plan_insights?plan_hash=eq.${encodeURIComponent(planHash)}&created_at=gt.${encodeURIComponent(since)}&limit=1`,
    { headers: sbHeaders }
  ).catch(() => null);

  if (rateRes?.ok) {
    const rows = await rateRes.json();
    if (Array.isArray(rows) && rows.length > 0) {
      return jsonResp({ error: "rate_limited", retryAfter: "24h" }, 429);
    }
  }

  const userMessage = buildUserMessage(planState);
  let output: InsightOutput | undefined;

  try {
    output = await callAnthropic(userMessage);
  } catch (err) {
    console.error("Anthropic attempt 1 failed:", err);
    try {
      output = await callAnthropic(userMessage);
    } catch (err2) {
      console.error("Anthropic attempt 2 failed:", err2);
    }
  }

  if (!output) {
    return jsonResp({ error: "ai_unavailable" }, 500);
  }

  const userId = typeof parsed.userId === "string" ? parsed.userId : null;
  await fetch(`${supabaseUrl}/rest/v1/plan_insights`, {
    method: "POST",
    headers: { ...sbHeaders, "Prefer": "return=minimal" },
    body: JSON.stringify({ user_id: userId, plan_hash: planHash, input_summary: planState, output }),
  }).catch((e) => console.error("Insert failed:", e));

  return jsonResp(output);
});
