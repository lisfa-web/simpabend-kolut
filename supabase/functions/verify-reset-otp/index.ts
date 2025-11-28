import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      throw new Error("Missing backend configuration");
    }

    // Create admin client with service role to bypass RLS
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { email, otp } = await req.json();

    if (!email || !otp) {
      return new Response(
        JSON.stringify({ success: false, error: "Email dan OTP diperlukan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Verifying OTP for email:", email);

    // Get user profile
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id")
      .ilike("email", email.trim())
      .maybeSingle();

    if (profileError || !profile) {
      console.error("Profile not found:", profileError);
      return new Response(
        JSON.stringify({ success: false, error: "User tidak ditemukan" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify OTP
    const { data: pinData, error: pinError } = await admin
      .from("pin_otp")
      .select("*")
      .eq("user_id", profile.id)
      .eq("jenis", "reset_password")
      .eq("kode_hash", otp)
      .eq("is_used", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pinError || !pinData) {
      console.error("OTP verification failed:", pinError);
      return new Response(
        JSON.stringify({ success: false, error: "Kode verifikasi tidak valid atau sudah kadaluarsa" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark OTP as used
    const { error: updateError } = await admin
      .from("pin_otp")
      .update({ is_used: true })
      .eq("id", pinData.id);

    if (updateError) {
      console.error("Failed to mark OTP as used:", updateError);
    }

    console.log("OTP verified successfully for user:", profile.id);

    return new Response(
      JSON.stringify({ success: true, userId: profile.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Terjadi kesalahan" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
