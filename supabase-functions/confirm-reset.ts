import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const { email, code, newPassword } = await req.json();
    if (!email || !code || !newPassword) return new Response("missing fields", { status: 400 });
    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(url, key);
    const { data, error } = await supabase.from("password_reset_codes").select("id, expires_at, used_at").eq("email", email).eq("code", code).limit(1).single();
    if (error) return new Response(error.message, { status: 400 });
    if (!data || data.used_at || new Date(data.expires_at).getTime() < Date.now()) return new Response("invalid code", { status: 400 });
    const { data: userData, error: userErr } = await supabase.from("usuarios").select("auth_id").eq("email", email).limit(1).single();
    if (userErr) return new Response(userErr.message, { status: 400 });
    const admin = createClient(url, key);
    const { error: updErr } = await admin.auth.admin.updateUserById(userData.auth_id, { password: newPassword });
    if (updErr) return new Response(updErr.message, { status: 500 });
    await supabase.from("password_reset_codes").update({ used_at: new Date().toISOString() }).eq("id", data.id);
    return new Response("ok", { status: 200 });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
});
