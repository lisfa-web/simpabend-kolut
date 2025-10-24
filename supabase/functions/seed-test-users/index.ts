// Seed test users for acceptance testing
// WARNING: This endpoint is intended for one-time use in testing environments.
// It uses the service role key inside the function (server-side) and does not
// require client authentication. Remove or disable after running.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type AppRole =
  | "administrator"
  | "bendahara_opd"
  | "resepsionis"
  | "pbmd"
  | "akuntansi"
  | "perbendaharaan"
  | "kepala_bkad"
  | "kuasa_bud"
  | "publik";

interface SeedUser {
  email: string;
  full_name: string;
  phone: string;
  role: AppRole;
}

const USERS: SeedUser[] = [
  { email: "admin@bkad.test", full_name: "Admin Sistem", phone: "081234567801", role: "administrator" },
  { email: "kepalabkad@bkad.test", full_name: "Kepala BKAD", phone: "081234567802", role: "kepala_bkad" },
  { email: "kuasabud@bkad.test", full_name: "Kuasa BUD", phone: "081234567803", role: "kuasa_bud" },
  { email: "perbendaharaan@bkad.test", full_name: "Staff Perbendaharaan", phone: "081234567804", role: "perbendaharaan" },
  { email: "akuntansi@bkad.test", full_name: "Staff Akuntansi", phone: "081234567805", role: "akuntansi" },
  { email: "pbmd@bkad.test", full_name: "Staff PBMD", phone: "081234567806", role: "pbmd" },
  { email: "resepsionis@bkad.test", full_name: "Staff Resepsionis", phone: "081234567807", role: "resepsionis" },
  { email: "bendahara@bkad.test", full_name: "Bendahara OPD", phone: "081234567808", role: "bendahara_opd" },
];

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ ok: false, error: "Missing backend configuration" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const results: any[] = [];

  for (const u of USERS) {
    try {
      // Check existing by profile email first
      const { data: existingProfile } = await admin
        .from("profiles")
        .select("id")
        .eq("email", u.email)
        .maybeSingle();

      let userId: string | null = existingProfile?.id ?? null;

      if (!userId) {
        // Create auth user
        const { data: authData, error: authError } = await admin.auth.admin.createUser({
          email: u.email,
          password: "654321",
          email_confirm: true,
          user_metadata: { full_name: u.full_name },
        });
        if (authError) throw authError;
        userId = authData.user?.id ?? null;
      }

      if (!userId) throw new Error("Failed to obtain user id");

      // Upsert profile
      const { error: upsertProfileErr } = await admin.from("profiles").upsert(
        {
          id: userId,
          email: u.email,
          full_name: u.full_name,
          phone: u.phone,
          is_active: true,
        },
        { onConflict: "id" }
      );
      if (upsertProfileErr) throw upsertProfileErr;

      // Ensure role exists
      const { data: existingRole } = await admin
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .eq("role", u.role)
        .maybeSingle();

      if (!existingRole) {
        const { error: insertRoleErr } = await admin.from("user_roles").insert({
          user_id: userId,
          role: u.role,
        });
        if (insertRoleErr) throw insertRoleErr;
      }

      results.push({ email: u.email, status: "ok", user_id: userId });
    } catch (err: any) {
      results.push({ email: u.email, status: "error", error: err?.message || String(err) });
    }
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
