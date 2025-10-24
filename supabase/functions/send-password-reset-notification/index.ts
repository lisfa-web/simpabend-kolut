import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      throw new Error("userId is required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, phone, email")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw profileError;
    }

    if (!profile) {
      throw new Error("User profile not found");
    }

    let waNotificationSent = false;
    let waMessage = "";

    // Send WhatsApp notification if phone exists
    if (profile.phone) {
      // Fetch active WhatsApp gateway config
      const { data: waConfig, error: waConfigError } = await supabase
        .from("wa_gateway")
        .select("api_key, sender_id")
        .eq("is_active", true)
        .single();

      if (waConfigError) {
        console.error("Error fetching WA config:", waConfigError);
        waMessage = "WA Gateway not configured";
      } else if (waConfig) {
        // Prepare WhatsApp message
        const message = `Halo ${profile.full_name},\n\nPassword Anda telah direset oleh Administrator.\n\nSilakan login dengan password baru yang telah diberikan.\n\nTerima kasih.`;

        // Send via Fonnte API
        try {
          const waResponse = await fetch("https://api.fonnte.com/send", {
            method: "POST",
            headers: {
              Authorization: waConfig.api_key,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              target: profile.phone,
              message: message,
              countryCode: "62",
            }),
          });

          const waResult = await waResponse.json();
          console.log("WhatsApp send result:", waResult);

          if (waResponse.ok && waResult.status) {
            waNotificationSent = true;
            waMessage = "WhatsApp notification sent successfully";
          } else {
            waMessage = `WhatsApp send failed: ${waResult.reason || "Unknown error"}`;
          }
        } catch (waError: any) {
          console.error("Error sending WhatsApp:", waError);
          waMessage = `WhatsApp error: ${waError.message}`;
        }
      }
    } else {
      waMessage = "User phone number not available";
    }

    return new Response(
      JSON.stringify({
        success: true,
        waNotificationSent,
        waMessage,
        userName: profile.full_name,
        userPhone: profile.phone,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-password-reset-notification:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
