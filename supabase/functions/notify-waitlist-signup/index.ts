const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: CORS });
  }

  let name: string, email: string, plan_hash: string, timestamp: string;
  try {
    ({ name, email, plan_hash, timestamp } = await req.json());
  } catch {
    return new Response("Invalid JSON", { status: 400, headers: CORS });
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    return new Response("Missing RESEND_API_KEY", { status: 500, headers: CORS });
  }

  const body = `Name: ${name}\nEmail: ${email}\nSigned up at: ${timestamp}\nPlan hash: ${plan_hash}`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "CorpusCalc <noreply@corpuscalc.com>",
        to: ["kashyap@corpuscalc.com"],
        subject: `New RIA Waitlist Signup — ${email}`,
        text: body,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("Resend error:", res.status, errText);
      return new Response("Email send failed", { status: 500, headers: CORS });
    }

    return new Response("OK", { status: 200, headers: CORS });
  } catch (err) {
    console.error("notify-waitlist-signup error:", err);
    return new Response("Internal error", { status: 500, headers: CORS });
  }
});
