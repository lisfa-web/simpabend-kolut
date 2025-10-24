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
    const { spmId, action, role } = await req.json();
    console.log("Send Approval Notification - SPM ID:", spmId, "Action:", action, "Role:", role);

    if (!spmId || !action || !role) {
      return new Response(
        JSON.stringify({ success: false, message: "SPM ID, action, dan role diperlukan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get SPM data with bendahara profile
    console.log("Fetching SPM data...");
    const { data: spmData, error: spmError } = await supabase
      .from("spm")
      .select(`
        *,
        opd:opd_id(nama_opd),
        bendahara:bendahara_id(
          id,
          email,
          full_name,
          phone
        )
      `)
      .eq("id", spmId)
      .single();

    if (spmError || !spmData) {
      console.error("SPM not found:", spmError);
      return new Response(
        JSON.stringify({ success: false, message: "SPM tidak ditemukan" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("SPM Data:", spmData);
    console.log("Bendahara:", spmData.bendahara);

    const bendahara = spmData.bendahara as any;
    if (!bendahara || !bendahara.email) {
      console.error("Bendahara email not found");
      return new Response(
        JSON.stringify({ success: false, message: "Email bendahara tidak ditemukan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const notifications: { email?: string; whatsapp?: string } = {};

    // Determine message based on action
    let statusText = "";
    let subject = "";
    let bgColor = "#10b981";
    if (action === "approve") {
      statusText = "DISETUJUI";
      subject = "SPM Anda Telah Disetujui";
    } else if (action === "reject") {
      statusText = "DITOLAK";
      subject = "SPM Anda Ditolak";
      bgColor = "#ef4444";
    } else if (action === "revise") {
      statusText = "PERLU REVISI";
      subject = "SPM Anda Perlu Revisi";
      bgColor = "#f59e0b";
    }

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

      if (emailConfig) {
        console.log("Email config found, sending email...");
        
        const fromHeader = emailConfig.smtp_host === "smtp.gmail.com"
          ? `${emailConfig.from_name} <${emailConfig.smtp_user}>`
          : `${emailConfig.from_name} <${emailConfig.from_email}>`;

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: ${bgColor}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .status-badge { background-color: ${bgColor}; color: white; padding: 10px 20px; border-radius: 6px; display: inline-block; margin: 20px 0; }
              .info { background-color: #dbeafe; padding: 15px; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📋 Notifikasi SPM</h1>
              </div>
              <div class="content">
                <p>Yth. ${bendahara.full_name || "Bendahara"},</p>
                <p>SPM Anda telah diproses oleh ${role.toUpperCase()}.</p>
                <div class="status-badge">${statusText}</div>
                <div class="info">
                  <strong>Detail SPM:</strong><br>
                  Nomor SPM: ${spmData.nomor_spm || "-"}<br>
                  OPD: ${spmData.opd?.nama_opd || "-"}<br>
                  Nilai: Rp ${new Intl.NumberFormat("id-ID").format(spmData.nilai_spm || 0)}<br>
                  Waktu: ${new Date().toLocaleString("id-ID")}
                </div>
                ${action === "revise" ? `<p><strong>Catatan:</strong> ${spmData[`catatan_${role}`] || "Silakan perbaiki SPM sesuai catatan verifikator"}</p>` : ""}
                <p>Silakan login ke sistem untuk melihat detail lebih lanjut.</p>
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

        try {
          await client.send({
            from: fromHeader,
            to: bendahara.email,
            subject: `🔔 ${subject} - SPM ${spmData.nomor_spm || ""}`,
            content: "auto",
            html: emailHtml,
          });
          console.log("Email sent successfully");
          notifications.email = "success";
          await client.close();
        } catch (emailErr: any) {
          console.error("Email send error:", emailErr);
          notifications.email = emailErr.message;
        }
      } else {
        console.log("Email config not found or not active");
        notifications.email = "config_not_found";
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

      if (waConfig && bendahara.phone) {
        console.log("WA Gateway config found, sending WhatsApp...");
        
        const waMessage = `🔔 *Notifikasi SPM*

Yth. ${bendahara.full_name || "Bendahara"},

SPM Anda telah diproses oleh *${role.toUpperCase()}*.

*Status:* ${statusText}

*Detail SPM:*
Nomor: ${spmData.nomor_spm || "-"}
OPD: ${spmData.opd?.nama_opd || "-"}
Nilai: Rp ${new Intl.NumberFormat("id-ID").format(spmData.nilai_spm || 0)}
Waktu: ${new Date().toLocaleString("id-ID")}

${action === "revise" ? `*Catatan:* ${spmData[`catatan_${role}`] || "Silakan perbaiki SPM sesuai catatan verifikator"}` : ""}

Silakan login ke sistem untuk melihat detail lebih lanjut.

---
Sistem Manajemen SPM BKAD`;

        const cleanPhone = bendahara.phone.trim();
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
          console.log("WhatsApp sent successfully");
          notifications.whatsapp = "success";
        } else {
          console.error("WhatsApp send failed:", result);
          notifications.whatsapp = result.reason || result.message || "failed";
        }
      } else {
        console.log("WA Gateway config not found or bendahara phone not available");
        notifications.whatsapp = bendahara.phone ? "config_not_found" : "phone_not_found";
      }
    } catch (waError: any) {
      console.error("WhatsApp error:", waError);
      notifications.whatsapp = waError.message;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notifikasi berhasil dikirim",
        notifications 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-approval-notification:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
