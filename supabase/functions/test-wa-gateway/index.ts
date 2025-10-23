import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ success: false, message: "Nomor telepon diperlukan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get WA Gateway config
    const { data: gateway, error: configError } = await supabase
      .from("wa_gateway")
      .select("*")
      .single();

    if (configError || !gateway) {
      return new Response(
        JSON.stringify({ success: false, message: "Konfigurasi WhatsApp Gateway tidak ditemukan" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Fonnte API
    const fonnte_url = "https://api.fonnte.com/send";
    const response = await fetch(fonnte_url, {
      method: "POST",
      headers: {
        "Authorization": gateway.api_key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: phone,
        message: `🔔 *Test Koneksi WhatsApp Gateway*\n\nIni adalah pesan test dari Sistem Manajemen SPM BKAD.\n\nWaktu: ${new Date().toLocaleString("id-ID")}\n\n✅ Koneksi berhasil!`,
        countryCode: "62",
      }),
    });

    const result = await response.json();
    
    console.log("Fonnte API Response:", result);

    const isSuccess = result.status === true || response.ok;

    // Update test status in database
    await supabase
      .from("wa_gateway")
      .update({
        last_test_at: new Date().toISOString(),
        test_status: isSuccess ? "success" : "failed",
      })
      .eq("id", gateway.id);

    if (isSuccess) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Test koneksi berhasil! Pesan telah dikirim.",
          data: result 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: result.reason || "Test koneksi gagal",
          data: result 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: any) {
    console.error("Error in test-wa-gateway:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
