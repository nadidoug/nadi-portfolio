import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getServiceKey() {
  const legacyKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacyKey) return legacyKey;

  const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (!secretKeys) return null;

  try {
    const parsed = JSON.parse(secretKeys);
    return parsed.default || Object.values(parsed)[0] || null;
  } catch (_error) {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const key = getServiceKey();
  if (!url || !key) return json({ error: "Server is missing configuration" }, 500);

  const supabase = createClient(url, key);

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch (_error) {
    return json({ error: "Invalid request" }, 400);
  }

  const type = String(body.type || "").trim();

  if (type === "newsletter") {
    const email = String(body.email || "").trim().toLowerCase();
    const name = body.name ? String(body.name).trim().slice(0, 100) : null;

    if (!validEmail(email)) return json({ error: "Enter a valid email." }, 400);

    const { data: subscriber, error: subscriberError } = await supabase
      .from("email_subscribers")
      .upsert(
        { email, name, source: "portfolio", consent: true, status: "subscribed" },
        { onConflict: "email" },
      )
      .select("id")
      .single();

    if (subscriberError) return json({ error: subscriberError.message }, 500);

    const { error: queueError } = await supabase.from("email_queue").insert({
      template_slug: "welcome",
      subscriber_id: subscriber?.id || null,
      to_email: email,
      to_name: name,
      subject: "Welcome to Nadidoug",
      body: `Hi ${name || "there"},

Thanks for joining Nadidoug.

You are on the preview list. I’ll send project notes, useful systems, and build updates here first.

— Nadi`,
      status: "queued",
      priority: 1,
      attempts: 0,
      max_attempts: 3,
      scheduled_for: new Date().toISOString(),
      metadata: { name, source: "portfolio", type: "welcome" },
    });

    if (queueError) return json({ error: queueError.message }, 500);

    return json({ success: true, message: "Subscribed and welcome email queued" });
  }

  if (type === "contact") {
    const name = body.name ? String(body.name).trim().slice(0, 120) : null;
    const email = body.email ? String(body.email).trim().toLowerCase() : null;
    const message = String(body.message || "").trim();

    if (!message) return json({ error: "Message is required." }, 400);
    if (email && !validEmail(email)) return json({ error: "Enter a valid email." }, 400);

    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      subject: "Portfolio contact form",
      message,
      source: "portfolio",
    });

    if (error) return json({ error: error.message }, 500);
    return json({ success: true, message: "Message saved" });
  }

  return json({ error: "Unknown submission type" }, 400);
});
