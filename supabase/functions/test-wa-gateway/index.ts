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
    console.log("Test WA Gateway - Phone:", phone);

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
    console.log("Fetching WA Gateway config...");
    const { data: gateway, error: configError } = await supabase
      .from("wa_gateway")
      .select("*")
      .order("updated_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log("Gateway config:", gateway);
    console.log("Config error:", configError);

    if (configError || !gateway) {
      console.error("Gateway config not found:", configError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Konfigurasi WhatsApp Gateway tidak ditemukan. Silakan simpan konfigurasi terlebih dahulu.",
          error: configError?.message 
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!gateway.api_key || !gateway.sender_id) {
      console.error("Gateway config incomplete:", gateway);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Konfigurasi tidak lengkap. API Key dan Sender ID wajib diisi." 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean sender_id and phone (remove spaces)
    const cleanSenderId = gateway.sender_id.trim();
    const cleanPhone = phone.trim();

    console.log("Calling Fonnte API...");
    console.log("API Key (first 10 chars):", gateway.api_key.substring(0, 10) + "...");
    console.log("Sender ID:", cleanSenderId);
    console.log("Target Phone:", cleanPhone);

    // Call Fonnte API
    const fonnte_url = "https://api.fonnte.com/send";
    const requestBody: Record<string, any> = {
      target: cleanPhone,
      message: `🔔 *Test Koneksi WhatsApp Gateway*\n\nIni adalah pesan test dari Sistem Manajemen SPM BKAD.\n\nWaktu: ${new Date().toLocaleString("id-ID")}\n\n✅ Koneksi berhasil!`,
    };
    if (!cleanPhone.startsWith("62") && !cleanPhone.startsWith("+62")) {
      requestBody.countryCode = "62";
    }

    console.log("Request body:", requestBody);

    const response = await fetch(fonnte_url, {
      method: "POST",
      headers: {
        "Authorization": gateway.api_key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Fonnte response status:", response.status);
    const result = await response.json();
    console.log("Fonnte API Response:", result);

    const isSuccess = result.status === true || response.ok;
    console.log("Is success:", isSuccess);

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
          message: "Test koneksi berhasil! Pesan telah dikirim ke " + cleanPhone,
          data: result 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      const errorMessage = result.reason || result.message || "Test koneksi gagal. Periksa API Key dan Sender ID Anda.";
      console.error("Fonnte API Error:", errorMessage);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: errorMessage,
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
