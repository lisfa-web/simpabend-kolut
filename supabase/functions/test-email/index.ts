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
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, message: "Email address diperlukan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Email config
    const { data: config, error: configError } = await supabase
      .from("email_config")
      .select("*")
      .single();

    if (configError || !config) {
      return new Response(
        JSON.stringify({ success: false, message: "Konfigurasi email tidak ditemukan" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: config.smtp_host,
        port: config.smtp_port,
        tls: true,
        auth: {
          username: config.smtp_user,
          password: config.smtp_password,
        },
      },
    });

    // Send test email
    await client.send({
      from: `${config.from_name} <${config.from_email}>`,
      to: email,
      subject: "🔔 Test Email - Sistem Manajemen SPM BKAD",
      content: "auto",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .success-badge { background-color: #10b981; color: white; padding: 10px 20px; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .info { background-color: #dbeafe; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✉️ Test Email Berhasil</h1>
            </div>
            <div class="content">
              <p>Selamat! Konfigurasi email Anda telah berhasil diuji.</p>
              
              <div class="success-badge">
                ✅ Koneksi SMTP Berhasil
              </div>
              
              <div class="info">
                <strong>Detail Test:</strong><br>
                Waktu: ${new Date().toLocaleString("id-ID")}<br>
                SMTP Server: ${config.smtp_host}:${config.smtp_port}<br>
                From: ${config.from_name} &lt;${config.from_email}&gt;
              </div>
              
              <p>Email ini dikirim secara otomatis oleh sistem untuk memverifikasi bahwa konfigurasi email Anda berfungsi dengan baik.</p>
              
              <p>Jika Anda menerima email ini, berarti sistem sudah siap untuk mengirim notifikasi email kepada pengguna.</p>
            </div>
            <div class="footer">
              <p>Sistem Manajemen SPM BKAD</p>
              <p>Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    await client.close();

    // Update test status in database
    await supabase
      .from("email_config")
      .update({
        last_test_at: new Date().toISOString(),
        test_status: "success",
      })
      .eq("id", config.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Test email berhasil dikirim!",
        email: email 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in test-email:", error);

    // Try to update test status to failed
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: config } = await supabase
        .from("email_config")
        .select("id")
        .single();

      if (config) {
        await supabase
          .from("email_config")
          .update({
            last_test_at: new Date().toISOString(),
            test_status: "failed",
          })
          .eq("id", config.id);
      }
    } catch (updateError) {
      console.error("Error updating test status:", updateError);
    }

    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
