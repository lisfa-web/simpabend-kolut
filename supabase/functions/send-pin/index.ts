import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, spmId, jenis = "approval_pin" } = await req.json();
    console.log("Send PIN - User ID:", userId, "SPM ID:", spmId, "Jenis:", jenis);

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, message: "User ID diperlukan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate jenis
    const validJenis = ["approval_pin", "reset_password", "verification"];
    const pinJenis = validJenis.includes(jenis) ? jenis : "approval_pin";

    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user profile
    console.log("Fetching user profile...");
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.error("Profile not found:", profileError);
      return new Response(
        JSON.stringify({ success: false, message: "Profil pengguna tidak ditemukan" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated PIN:", pin);

    // Store PIN in database (valid for 15 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const { error: pinError } = await supabase
      .from("pin_otp")
      .insert({
        user_id: userId,
        spm_id: spmId || null,
        jenis: pinJenis,
        kode_hash: pin, // In production, should hash this
        expires_at: expiresAt.toISOString(),
        is_used: false,
      });

    if (pinError) {
      console.error("Error storing PIN:", pinError);
      return new Response(
        JSON.stringify({ success: false, message: "Gagal menyimpan PIN" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const notifications: { email?: string; whatsapp?: string } = {};

    // ============ SEND EMAIL ============
    try {
      console.log("Fetching email config...");
      const { data: emailConfig } = await supabase
        .from("email_config")
        .select("*")
        .eq("is_active", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (emailConfig && profile.email) {
        console.log("Email config found, sending PIN email...");
        
        const fromHeader = emailConfig.smtp_host === "smtp.gmail.com"
          ? `${emailConfig.from_name} <${emailConfig.smtp_user}>`
          : `${emailConfig.from_name} <${emailConfig.from_email}>`;

        // Dynamic content based on jenis
        const isResetPassword = pinJenis === "reset_password";
        const emailTitle = isResetPassword ? "🔑 Kode Reset Password" : "🔐 PIN Approval SPM";
        const emailPurpose = isResetPassword ? "reset password akun Anda" : "approval SPM";
        const emailAction = isResetPassword ? "Gunakan kode ini untuk reset password di sistem." : "Gunakan PIN ini untuk menyetujui SPM di sistem.";

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .pin-box { background-color: #fff; border: 2px dashed #2563eb; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
              .pin-code { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px; }
              .info { background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${emailTitle}</h1>
              </div>
              <div class="content">
                <p>Yth. ${profile.full_name || "Pengguna"},</p>
                <p>Berikut adalah kode verifikasi untuk ${emailPurpose}:</p>
                <div class="pin-box">
                  <div class="pin-code">${pin}</div>
                </div>
                <div class="info">
                  <strong>⚠️ Penting:</strong><br>
                  • Kode ini berlaku selama 15 menit<br>
                  • Jangan bagikan kode kepada siapapun<br>
                  • Kode hanya dapat digunakan sekali<br>
                  • Waktu dikirim: ${new Date().toLocaleString("id-ID")}
                </div>
                <p>${emailAction}</p>
              </div>
              <div class="footer">
                <p>Sistem Manajemen SPM BKAD</p>
                <p>Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        const port = Number(emailConfig.smtp_port);
        const useImplicitTLS = port === 465;

        const client = new SMTPClient({
          connection: {
            hostname: emailConfig.smtp_host,
            port,
            tls: useImplicitTLS,
            auth: {
              username: emailConfig.smtp_user,
              password: emailConfig.smtp_password,
            },
          },
          debug: {
            log: true,
            allowUnsecure: false,
            noStartTLS: !useImplicitTLS ? false : true,
          },
        });

        const emailSubject = isResetPassword ? `🔑 Kode Reset Password - ${pin}` : `🔐 PIN Approval SPM - ${pin}`;
        
        try {
          await client.send({
            from: fromHeader,
            to: profile.email,
            subject: emailSubject,
            content: "auto",
            html: emailHtml,
          });
          console.log("PIN email sent successfully");
          notifications.email = "success";
          await client.close();
        } catch (emailErr: any) {
          console.error("Email send error:", emailErr);
          notifications.email = emailErr.message;
        }
      } else {
        console.log("Email config not found or email not available");
        notifications.email = profile.email ? "config_not_found" : "email_not_found";
      }
    } catch (emailError: any) {
      console.error("Email error:", emailError);
      notifications.email = emailError.message;
    }

    // ============ SEND WHATSAPP ============
    try {
      console.log("Fetching WA Gateway config...");
      const { data: waConfig } = await supabase
        .from("wa_gateway")
        .select("*")
        .eq("is_active", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (waConfig && profile.phone) {
        console.log("WA Gateway config found, sending PIN WhatsApp...");
        
        // Dynamic content based on jenis
        const isResetPassword = pinJenis === "reset_password";
        const waTitle = isResetPassword ? "🔑 *Kode Reset Password*" : "🔐 *PIN Approval SPM*";
        const waPurpose = isResetPassword ? "reset password akun Anda" : "approval SPM";
        const waAction = isResetPassword ? "Gunakan kode ini untuk reset password di sistem." : "Gunakan PIN ini untuk menyetujui SPM di sistem.";
        
        const waMessage = `${waTitle}

Yth. ${profile.full_name || "Pengguna"},

Berikut adalah kode verifikasi untuk ${waPurpose}:

*${pin}*

⚠️ *Penting:*
• Kode berlaku selama 15 menit
• Jangan bagikan kode kepada siapapun
• Kode hanya dapat digunakan sekali
• Waktu: ${new Date().toLocaleString("id-ID")}

${waAction}

---
Sistem Manajemen SPM BKAD`;

        const cleanPhone = profile.phone.trim();
        const requestBody: Record<string, any> = {
          target: cleanPhone,
          message: waMessage,
        };
        if (!cleanPhone.startsWith("62") && !cleanPhone.startsWith("+62")) {
          requestBody.countryCode = "62";
        }

        const response = await fetch("https://api.fonnte.com/send", {
          method: "POST",
          headers: {
            "Authorization": waConfig.api_key,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        const result = await response.json();
        console.log("WhatsApp API response:", result);

        if (result.status === true || response.ok) {
          console.log("PIN WhatsApp sent successfully");
          notifications.whatsapp = "success";
        } else {
          console.error("WhatsApp send failed:", result);
          notifications.whatsapp = result.reason || result.message || "failed";
        }
      } else {
        console.log("WA Gateway config not found or phone not available");
        notifications.whatsapp = profile.phone ? "config_not_found" : "phone_not_found";
      }
    } catch (waError: any) {
      console.error("WhatsApp error:", waError);
      notifications.whatsapp = waError.message;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "PIN berhasil dikirim",
        pin: pin, // For development/testing - remove in production
        notifications 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-pin:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
