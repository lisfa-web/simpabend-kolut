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

    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: "Email diperlukan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Checking email for reset:", email);

    // Query profile using service role (bypasses RLS)
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id, phone, full_name, email")
      .ilike("email", email.trim())
      .maybeSingle();

    if (profileError) {
      console.error("Profile query error:", profileError);
      return new Response(
        JSON.stringify({ success: false, error: "Terjadi kesalahan saat mencari email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!profile) {
      console.log("Email not found:", email);
      return new Response(
        JSON.stringify({ success: false, error: "Email tidak terdaftar dalam sistem" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Email found for user:", profile.id);

    // Return user info for sending OTP
    return new Response(
      JSON.stringify({
        success: true,
        userId: profile.id,
        email: profile.email,
        phone: profile.phone,
        fullName: profile.full_name,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error checking email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Terjadi kesalahan" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
