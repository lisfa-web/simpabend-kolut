import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'spm' | 'sp2d';
  documentId: string;
  action: 'created' | 'submitted' | 'verified' | 'approved' | 'rejected' | 'revised';
  stage?: string;
  verifiedBy?: string;
  notes?: string;
}

// Helper function to format jenis SPM
function formatJenisSpm(jenisSpm: string): string {
  if (!jenisSpm) return '-';
  return jenisSpm
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { type, documentId, action, stage, verifiedBy, notes }: NotificationRequest = await req.json();

    console.log("Processing workflow notification:", { type, documentId, action, stage });

    // Get document details
    let documentData: any = null;
    let recipientIds: string[] = [];
    let messageTemplate = "";

    if (type === 'spm') {
      const { data: spm, error: spmError } = await supabase
        .from("spm")
        .select(`
          *,
          opd:opd_id(nama_opd),
          program:program_id(nama_program),
          kegiatan:kegiatan_id(nama_kegiatan),
          subkegiatan:subkegiatan_id(nama_subkegiatan),
          bendahara:bendahara_id(full_name, phone, email),
          potongan:potongan_pajak_spm(jumlah_pajak)
        `)
        .eq("id", documentId)
        .single();

      if (spmError) throw spmError;
      documentData = spm;

      // Safely derive bendahara display name (fallback from email)
      const getDisplayName = (name?: string | null, email?: string | null) => {
        const capitalize = (word: string) => word ? word.charAt(0).toUpperCase() + word.slice(1) : '';
        if (name && name.trim() && !name.includes('@')) return name.trim();
        if (email && email.includes('@')) {
          const local = email.split('@')[0].replace(/[._-]+/g, ' ').trim();
          return local.split(' ').filter(Boolean).map(capitalize).join(' ');
        }
        return '-';
      };
      const bendaharaName = getDisplayName(spm.bendahara?.full_name, spm.bendahara?.email);

      // Determine recipients based on action and stage
      if (action === 'created' || action === 'submitted') {
        // Notify Resepsionis when SPM is submitted
        const { data: resepsionis, error: resepsionisError } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "resepsionis");
        
        if (resepsionisError) {
          console.error("Error fetching resepsionis:", resepsionisError);
        } else {
          console.log("Found resepsionis users:", resepsionis);
        }
        
        recipientIds = resepsionis?.map((r: any) => r.user_id) || [];
        
        // Build message with potongan/netto if available
        messageTemplate = `📋 *SPM Baru*\n\nNomor: ${spm.nomor_spm || 'Draft'}\nOPD: ${spm.opd?.nama_opd}\nJenis: ${formatJenisSpm(spm.jenis_spm)}\n\nNilai SPM: ${formatCurrency(spm.nilai_spm)}`;
        
        if (spm.total_potongan && spm.total_potongan > 0) {
          const nilaiNetto = spm.nilai_bersih || (spm.nilai_spm - spm.total_potongan);
          messageTemplate += `\nPotongan: ${formatCurrency(spm.total_potongan)}\n💰 Nilai Netto: ${formatCurrency(nilaiNetto)}`;
        }
        
        messageTemplate += `\n\nBendahara: ${bendaharaName}\n\nSilakan proses verifikasi di sistem.\n\nSent via\nSIMPA BEND BKAD KOLUT`;
      
      } else if (action === 'verified') {
        // Notify next stage based on current status
        let nextRole = '';
        
        // Build base message info
        const nilaiNetto = spm.nilai_bersih || (spm.nilai_spm - (spm.total_potongan || 0));
        let baseInfo = `Nomor: ${spm.nomor_spm}\nJenis: ${formatJenisSpm(spm.jenis_spm)}\nOPD: ${spm.opd?.nama_opd}\n\nNilai SPM: ${formatCurrency(spm.nilai_spm)}`;
        
        if (spm.total_potongan && spm.total_potongan > 0) {
          baseInfo += `\nPotongan: ${formatCurrency(spm.total_potongan)}\n💰 Nilai Netto: ${formatCurrency(nilaiNetto)}`;
        }
        
        if (spm.status === 'resepsionis_verifikasi') {
          nextRole = 'pbmd';
          messageTemplate = `✅ *SPM Diverifikasi Resepsionis*\n\n${baseInfo}\n\nNomor Berkas: ${spm.nomor_berkas}\nNomor Antrian: ${spm.nomor_antrian}\n\nSilakan lanjutkan verifikasi PBMD.\n\nSent via\nSIMPA BEND BKAD KOLUT`;
        } else if (spm.status === 'pbmd_verifikasi') {
          nextRole = 'akuntansi';
          messageTemplate = `✅ *SPM Diverifikasi PBMD*\n\n${baseInfo}\nNomor Berkas: ${spm.nomor_berkas}\n\nSilakan lanjutkan verifikasi Akuntansi.\n\nSent via\nSIMPA BEND BKAD KOLUT`;
        } else if (spm.status === 'akuntansi_validasi') {
          nextRole = 'perbendaharaan';
          messageTemplate = `✅ *SPM Divalidasi Akuntansi*\n\n${baseInfo}\nNomor Berkas: ${spm.nomor_berkas}\n\nSilakan lanjutkan verifikasi Perbendaharaan.\n\nSent via\nSIMPA BEND BKAD KOLUT`;
        } else if (spm.status === 'perbendaharaan_verifikasi') {
          nextRole = 'kepala_bkad';
          messageTemplate = `✅ *SPM Diverifikasi Perbendaharaan*\n\n${baseInfo}\nNomor Berkas: ${spm.nomor_berkas}\n\nMenunggu review Kepala BKAD.\n\nSent via\nSIMPA BEND BKAD KOLUT`;
        }

        if (nextRole) {
          const { data: nextUsers } = await supabase
            .from("user_roles")
            .select("user_id")
            .eq("role", nextRole);
          
          recipientIds = nextUsers?.map((u: any) => u.user_id) || [];
        }

        // Also notify bendahara about progress
        recipientIds.push(spm.bendahara_id);
      
      } else if (action === 'approved') {
        // SPM approved by Kepala BKAD - notify bendahara and Kuasa BUD
        recipientIds = [spm.bendahara_id];
        
        // Also notify Kuasa BUD for SP2D creation
        const { data: kuasaBud } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "kuasa_bud");
        
        if (kuasaBud && kuasaBud.length > 0) {
          recipientIds.push(...kuasaBud.map((k: any) => k.user_id));
        }
        
        const nilaiNetto = spm.nilai_bersih || (spm.nilai_spm - (spm.total_potongan || 0));
        let approvalInfo = `Nomor: ${spm.nomor_spm}\nJenis: ${formatJenisSpm(spm.jenis_spm)}\nOPD: ${spm.opd?.nama_opd}\n\nNilai SPM: ${formatCurrency(spm.nilai_spm)}`;
        
        if (spm.total_potongan && spm.total_potongan > 0) {
          approvalInfo += `\nPotongan: ${formatCurrency(spm.total_potongan)}\n💰 Nilai Netto: ${formatCurrency(nilaiNetto)}`;
        }
        
        approvalInfo += `\nNomor Berkas: ${spm.nomor_berkas}`;
        
        messageTemplate = `🎉 *SPM Disetujui Kepala BKAD*\n\n${approvalInfo}\n\nSPM telah disetujui dan siap diproses SP2D.\n\nSent via\nSIMPA BEND BKAD KOLUT`;
      
      } else if (action === 'rejected') {
        // SPM rejected - notify bendahara
        recipientIds = [spm.bendahara_id];
        
        const nilaiNetto = spm.nilai_bersih || (spm.nilai_spm - (spm.total_potongan || 0));
        let rejectionInfo = `Nomor: ${spm.nomor_spm || 'Draft'}\nJenis: ${formatJenisSpm(spm.jenis_spm)}\n\nNilai SPM: ${formatCurrency(spm.nilai_spm)}`;
        
        if (spm.total_potongan && spm.total_potongan > 0) {
          rejectionInfo += `\nPotongan: ${formatCurrency(spm.total_potongan)}\n💰 Nilai Netto: ${formatCurrency(nilaiNetto)}`;
        }
        
        messageTemplate = `❌ *SPM Ditolak*\n\n${rejectionInfo}\n\nTahap: ${stage}\nCatatan: ${notes || '-'}\n\nSilakan perbaiki dan ajukan kembali.\n\nSent via\nSIMPA BEND BKAD KOLUT`;
      
      } else if (action === 'revised') {
        // Notify bendahara about revision
        recipientIds = [spm.bendahara_id];
        
        const nilaiNetto = spm.nilai_bersih || (spm.nilai_spm - (spm.total_potongan || 0));
        let revisionInfo = `Nomor: ${spm.nomor_spm || 'Draft'}\nJenis: ${formatJenisSpm(spm.jenis_spm)}\n\nNilai SPM: ${formatCurrency(spm.nilai_spm)}`;
        
        if (spm.total_potongan && spm.total_potongan > 0) {
          revisionInfo += `\nPotongan: ${formatCurrency(spm.total_potongan)}\n💰 Nilai Netto: ${formatCurrency(nilaiNetto)}`;
        }
        
        messageTemplate = `⚠️ *SPM Perlu Revisi*\n\n${revisionInfo}\n\nTahap: ${stage}\nCatatan: ${notes || '-'}\n\nSilakan perbaiki dan ajukan kembali.\n\nSent via\nSIMPA BEND BKAD KOLUT`;
      }

    } else if (type === 'sp2d') {
      const { data: sp2d, error: sp2dError } = await supabase
        .from("sp2d")
        .select(`
          *,
          spm:spm_id(
            nomor_spm,
            bendahara_id,
            opd:opd_id(nama_opd),
            bendahara:bendahara_id(full_name, phone, email)
          )
        `)
        .eq("id", documentId)
        .single();

      if (sp2dError) throw sp2dError;
      documentData = sp2d;

      if (action === 'created') {
        // Notify Kuasa BUD when SP2D is created
        const { data: kuasaBud } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "kuasa_bud");
        
        recipientIds = kuasaBud?.map((k: any) => k.user_id) || [];
        messageTemplate = `💰 *SP2D Baru*\n\nNomor: ${sp2d.nomor_sp2d}\nDari SPM: ${sp2d.spm?.nomor_spm}\nNilai: Rp ${new Intl.NumberFormat('id-ID').format(sp2d.nilai_sp2d)}\n\nSilakan proses verifikasi.\n\nSent via\nSIMPA BEND BKAD KOLUT`;
      
      } else if (action === 'approved') {
        // Notify bendahara when SP2D is approved
        if (sp2d.spm?.bendahara_id) {
          recipientIds = [sp2d.spm.bendahara_id];
          messageTemplate = `✅ *SP2D Diterbitkan*\n\nNomor: ${sp2d.nomor_sp2d}\nNomor SPM: ${sp2d.spm?.nomor_spm}\nNilai: Rp ${new Intl.NumberFormat('id-ID').format(sp2d.nilai_sp2d)}\nTanggal Cair: ${sp2d.tanggal_cair ? new Date(sp2d.tanggal_cair).toLocaleDateString('id-ID') : '-'}\n\nSP2D sudah dapat diproses.\n\nSent via\nSIMPA BEND BKAD KOLUT`;
        }
      
      } else if (action === 'rejected') {
        // Notify bendahara when SP2D is rejected
        if (sp2d.spm?.bendahara_id) {
          recipientIds = [sp2d.spm.bendahara_id];
          messageTemplate = `❌ *SP2D Ditolak*\n\nNomor: ${sp2d.nomor_sp2d}\nNomor SPM: ${sp2d.spm?.nomor_spm}\nCatatan: ${notes || '-'}\n\nSilakan cek kembali dokumen SPM.\n\nSent via\nSIMPA BEND BKAD KOLUT`;
        }
      }
    }

    if (recipientIds.length === 0 || !messageTemplate) {
      console.log("No recipients or message template, skipping notification");
      return new Response(
        JSON.stringify({ success: true, message: "No notification needed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Fetch WA Gateway configuration - prioritize active, fallback to latest
    const { data: waConfigActive, error: waErr } = await supabase
      .from("wa_gateway")
      .select("*")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let waConfig = waConfigActive;
    if (!waConfig) {
      console.log("No active WA config found, using latest configuration as fallback");
      const { data: waConfigLatest } = await supabase
        .from("wa_gateway")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      waConfig = waConfigLatest;
    }
    
    if (waConfig) {
      console.log(`Using WA config: id=${waConfig.id}, sender=${waConfig.sender_id}, active=${waConfig.is_active}`);
    } else {
      console.log("No WA gateway configuration found");
    }

    // Get Email config
    const { data: emailConfig } = await supabase
      .from("email_config")
      .select("*")
      .eq("is_active", true)
      .single();

    if (!waConfig && !emailConfig) {
      console.log("No notification channels configured");
      return new Response(
        JSON.stringify({ success: false, message: "No notification channels configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get recipient details and send notifications
    const { data: recipients } = await supabase
      .from("profiles")
      .select("id, full_name, phone, email")
      .in("id", recipientIds);

    const notifications = [];

    for (const recipient of recipients || []) {
      let waSuccess = false;
      let emailSuccess = false;

      // Send WhatsApp notification
      if (waConfig && recipient.phone) {
        try {
          const target = recipient.phone.trim();
          const payload: any = { target, message: messageTemplate };
          
          // Add country code only if number doesn't already have it
          if (!target.startsWith('62') && !target.startsWith('+62')) {
            payload.countryCode = '62';
          }
          
          console.log(`Attempting to send WA to ${recipient.full_name} (${target})`);
          
          const waResponse = await fetch("https://api.fonnte.com/send", {
            method: "POST",
            headers: {
              Authorization: waConfig.api_key,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          const waResult = await waResponse.json();
          console.log(`WA response for ${target}:`, waResult);
          
          if (waResult.status === true || waResult.status === "success") {
            waSuccess = true;
            console.log(`✓ WA successfully sent to ${recipient.full_name}`);
          } else {
            console.error(`✗ WA failed for ${recipient.full_name}:`, waResult);
          }
        } catch (error: any) {
          console.error(`Exception sending WA to ${recipient.full_name}:`, error.message);
        }
      } else {
        console.log(`Skipping WA for ${recipient.full_name}: waConfig=${!!waConfig}, phone=${recipient.phone}`);
      }

      // Send Email notification
      if (emailConfig && recipient.email) {
        try {
          const buildClient = (port: number, implicitTLS: boolean) =>
            new SMTPClient({
              connection: {
                hostname: emailConfig.smtp_host,
                port,
                tls: implicitTLS,
                auth: {
                  username: emailConfig.smtp_user,
                  password: emailConfig.smtp_password,
                },
              },
              debug: {
                log: false,
                allowUnsecure: false,
                noStartTLS: !implicitTLS ? false : true,
              },
            });

          const fromHeader = emailConfig.smtp_host === "smtp.gmail.com"
            ? `${emailConfig.from_name} <${emailConfig.smtp_user}>`
            : `${emailConfig.from_name} <${emailConfig.from_email}>`;

          // Convert message template to HTML
          const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; white-space: pre-line; }
                .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔔 Notifikasi ${type.toUpperCase()}</h1>
                </div>
                <div class="content">
                  ${messageTemplate.replace(/\n/g, '<br>')}
                  <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                  <p style="font-size: 12px; color: #6b7280;">
                    Waktu: ${new Date().toLocaleString("id-ID")}<br>
                    Untuk: ${recipient.full_name}
                  </p>
                </div>
                <div class="footer">
                  <p>Sistem Manajemen SPM BKAD</p>
                  <p>Email ini dikirim secara otomatis, mohon tidak membalas.</p>
                </div>
              </div>
            </body>
            </html>
          `;

          let client = buildClient(Number(emailConfig.smtp_port), emailConfig.smtp_port === 465);

          try {
            await client.send({
              from: fromHeader,
              to: recipient.email,
              subject: `🔔 Notifikasi ${type.toUpperCase()} - Sistem BKAD`,
              content: "auto",
              html: emailHtml,
            });
            console.log(`Email sent to ${recipient.email}`);
            emailSuccess = true;
            try { await client.close(); } catch (_) {}
          } catch (primaryErr: any) {
            console.error("Primary email send failed:", primaryErr?.message);
            const msg = String(primaryErr?.message || "");
            const shouldFallback = msg.includes("startTls") || msg.includes("BadResource");
            
            if (shouldFallback) {
              try { await client.close(); } catch (_) {}
              client = buildClient(465, true);
              await client.send({
                from: fromHeader,
                to: recipient.email,
                subject: `🔔 Notifikasi ${type.toUpperCase()} - Sistem BKAD`,
                content: "auto",
                html: emailHtml,
              });
              console.log(`Email sent to ${recipient.email} (fallback 465)`);
              emailSuccess = true;
              try { await client.close(); } catch (_) {}
            } else {
              throw primaryErr;
            }
          }
        } catch (error: any) {
          console.error(`Failed to send email to ${recipient.email}:`, error);
        }
      }

      // Save notification to database
      await supabase.from("notifikasi").insert({
        user_id: recipient.id,
        jenis: type === 'spm' ? 'spm_status' : 'sp2d_status',
        judul: `Notifikasi ${type.toUpperCase()}`,
        pesan: messageTemplate,
        spm_id: type === 'spm' ? documentId : null,
        sent_via_wa: waSuccess,
        wa_sent_at: waSuccess ? new Date().toISOString() : null,
      });

      notifications.push({
        recipient: recipient.full_name,
        phone: recipient.phone || '-',
        email: recipient.email,
        wa_status: waSuccess ? "sent" : waConfig ? "failed" : "not_configured",
        email_status: emailSuccess ? "sent" : emailConfig ? "failed" : "not_configured",
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        notifications,
        summary: {
          total: notifications.length,
          wa_sent: notifications.filter(n => n.wa_status === 'sent').length,
          email_sent: notifications.filter(n => n.email_status === 'sent').length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: any) {
    console.error("Error in send-workflow-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
