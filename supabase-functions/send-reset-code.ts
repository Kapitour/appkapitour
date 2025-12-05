import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const { email } = await req.json();
    if (!email) return new Response("missing email", { status: 400 });
    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resend = Deno.env.get("RESEND_API_KEY")!;
    const supabase = createClient(url, key);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { error } = await supabase.from("password_reset_codes").insert({ email, code, expires_at: expires });
    if (error) return new Response(error.message, { status: 500 });
    const body = { from: "Kapitour <no-reply@kapitour.app>", to: [email], subject: "Seu código de recuperação", html: `<p>Seu código: <b>${code}</b></p><p>Ele expira em 10 minutos.</p>` };
    const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { "Authorization": `Bearer ${resend}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!r.ok) return new Response(await r.text(), { status: 500 });
    return new Response("ok", { status: 200 });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
});
