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
    console.log("Test Email - Email:", email);

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

    // Get Email config (get the latest one)
    console.log("Fetching email config...");
    const { data: config, error: configError } = await supabase
      .from("email_config")
      .select("*")
      .order("updated_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log("Email config:", config);
    console.log("Config error:", configError);

    if (configError || !config) {
      console.error("Email config not found:", configError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Konfigurasi email tidak ditemukan. Silakan simpan konfigurasi terlebih dahulu.",
          error: configError?.message
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!config.smtp_user || !config.smtp_password) {
      console.error("Email config incomplete:", config);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Konfigurasi tidak lengkap. Email dan App Password wajib diisi." 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Creating SMTP client...");
    console.log("SMTP Host:", config.smtp_host);
    console.log("SMTP Port:", config.smtp_port);
    console.log("SMTP User:", config.smtp_user);

    // Validate Gmail App Password format (should be 16 characters)
    if (config.smtp_host === "smtp.gmail.com") {
      const cleanPassword = config.smtp_password.replace(/\s/g, '');
      if (cleanPassword.length !== 16) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: "Gmail App Password harus 16 karakter. Pastikan Anda menggunakan App Password dari Google Account, bukan password Gmail biasa. Generate di: https://myaccount.google.com/apppasswords"
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Create SMTP client with proper TLS/STARTTLS handling
    const port = Number(config.smtp_port);
    const useImplicitTLS = port === 465; // SMTPS over implicit TLS
    console.log("Computed TLS mode -> useImplicitTLS:", useImplicitTLS, "port:", port);

    const client = new SMTPClient({
      connection: {
        hostname: config.smtp_host,
        port,
        tls: useImplicitTLS, // Only use implicit TLS for 465. For 587 we allow STARTTLS.
        auth: {
          username: config.smtp_user,
          password: config.smtp_password,
        },
      },
      debug: {
        log: true,
        allowUnsecure: false,
        noStartTLS: false, // ensure STARTTLS is allowed on ports like 587
      },
    });

    // Send test email
    console.log("Sending test email...");
    const fromHeader = config.smtp_host === "smtp.gmail.com"
      ? `${config.from_name} <${config.smtp_user}>`
      : `${config.from_name} <${config.from_email}>`;

    await client.send({
      from: fromHeader,
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

    console.log("Email sent successfully");
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
        message: `Test email berhasil dikirim ke ${email}!`,
        email: email 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in test-email:", error);
    console.error("Error stack:", error.stack);

    // Try to update test status to failed
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: config } = await supabase
        .from("email_config")
        .select("id")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

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

    let errorMessage = error.message || "Gagal mengirim email test. Periksa konfigurasi SMTP Anda.";
    
    // Provide more specific error messages
    if (errorMessage.includes("InvalidContentType") || errorMessage.includes("InvalidData")) {
      errorMessage = "Koneksi SMTP gagal. Pastikan Anda menggunakan Gmail App Password yang valid (16 karakter), bukan password Gmail biasa. Generate App Password di: https://myaccount.google.com/apppasswords";
    } else if (errorMessage.includes("authentication")) {
      errorMessage = "Autentikasi gagal. Pastikan email dan App Password sudah benar.";
    } else if (errorMessage.includes("connection")) {
      errorMessage = "Gagal terhubung ke server SMTP. Periksa host dan port.";
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: errorMessage,
        hint: "Gunakan Gmail App Password (16 karakter) dari https://myaccount.google.com/apppasswords"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
