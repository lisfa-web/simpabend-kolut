import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

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
          bendahara:bendahara_id(full_name, phone, email)
        `)
        .eq("id", documentId)
        .single();

      if (spmError) throw spmError;
      documentData = spm;

      // Determine recipients based on action and stage
      if (action === 'created' || action === 'submitted') {
        // Notify Resepsionis when SPM is submitted
        const { data: resepsionis } = await supabase
          .from("user_roles")
          .select("user_id, profiles:user_id(full_name, phone, email)")
          .eq("role", "resepsionis");
        
        recipientIds = resepsionis?.map((r: any) => r.user_id) || [];
        messageTemplate = `📋 *SPM Baru*\n\nNomor: ${spm.nomor_spm || 'Draft'}\nOPD: ${spm.opd?.nama_opd}\nNilai: Rp ${new Intl.NumberFormat('id-ID').format(spm.nilai_spm)}\nBendahara: ${spm.bendahara?.full_name}\n\nSilakan proses verifikasi di sistem.`;
      
      } else if (action === 'verified') {
        // Notify next stage based on current status
        let nextRole = '';
        
        if (spm.status === 'resepsionis_verifikasi') {
          nextRole = 'pbmd';
          messageTemplate = `✅ *SPM Diverifikasi Resepsionis*\n\nNomor: ${spm.nomor_spm}\nNomor Berkas: ${spm.nomor_berkas}\nNomor Antrian: ${spm.nomor_antrian}\n\nSilakan lanjutkan verifikasi PBMD.`;
        } else if (spm.status === 'pbmd_verifikasi') {
          nextRole = 'akuntansi';
          messageTemplate = `✅ *SPM Diverifikasi PBMD*\n\nNomor: ${spm.nomor_spm}\nNomor Berkas: ${spm.nomor_berkas}\n\nSilakan lanjutkan verifikasi Akuntansi.`;
        } else if (spm.status === 'akuntansi_validasi') {
          nextRole = 'perbendaharaan';
          messageTemplate = `✅ *SPM Divalidasi Akuntansi*\n\nNomor: ${spm.nomor_spm}\nNomor Berkas: ${spm.nomor_berkas}\n\nSilakan lanjutkan verifikasi Perbendaharaan.`;
        } else if (spm.status === 'perbendaharaan_verifikasi') {
          nextRole = 'kepala_bkad';
          messageTemplate = `✅ *SPM Diverifikasi Perbendaharaan*\n\nNomor: ${spm.nomor_spm}\nNomor Berkas: ${spm.nomor_berkas}\n\nMenunggu review Kepala BKAD.`;
        }

        if (nextRole) {
          const { data: nextUsers } = await supabase
            .from("user_roles")
            .select("user_id, profiles:user_id(full_name, phone, email)")
            .eq("role", nextRole);
          
          recipientIds = nextUsers?.map((u: any) => u.user_id) || [];
        }

        // Also notify bendahara about progress
        recipientIds.push(spm.bendahara_id);
      
      } else if (action === 'revised') {
        // Notify bendahara about revision
        recipientIds = [spm.bendahara_id];
        messageTemplate = `⚠️ *SPM Perlu Revisi*\n\nNomor: ${spm.nomor_spm || 'Draft'}\nTahap: ${stage}\nCatatan: ${notes || '-'}\n\nSilakan perbaiki dan ajukan kembali.`;
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
          .select("user_id, profiles:user_id(full_name, phone, email)")
          .eq("role", "kuasa_bud");
        
        recipientIds = kuasaBud?.map((k: any) => k.user_id) || [];
        messageTemplate = `💰 *SP2D Baru*\n\nNomor: ${sp2d.nomor_sp2d}\nDari SPM: ${sp2d.spm?.nomor_spm}\nNilai: Rp ${new Intl.NumberFormat('id-ID').format(sp2d.nilai_sp2d)}\n\nSilakan proses verifikasi.`;
      
      } else if (action === 'approved') {
        // Notify bendahara when SP2D is approved
        if (sp2d.spm?.bendahara_id) {
          recipientIds = [sp2d.spm.bendahara_id];
          messageTemplate = `✅ *SP2D Diterbitkan*\n\nNomor: ${sp2d.nomor_sp2d}\nNomor SPM: ${sp2d.spm?.nomor_spm}\nNilai: Rp ${new Intl.NumberFormat('id-ID').format(sp2d.nilai_sp2d)}\nTanggal Cair: ${sp2d.tanggal_cair ? new Date(sp2d.tanggal_cair).toLocaleDateString('id-ID') : '-'}\n\nSP2D sudah dapat diproses.`;
        }
      
      } else if (action === 'rejected') {
        // Notify bendahara when SP2D is rejected
        if (sp2d.spm?.bendahara_id) {
          recipientIds = [sp2d.spm.bendahara_id];
          messageTemplate = `❌ *SP2D Ditolak*\n\nNomor: ${sp2d.nomor_sp2d}\nNomor SPM: ${sp2d.spm?.nomor_spm}\nCatatan: ${notes || '-'}\n\nSilakan cek kembali dokumen SPM.`;
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

    // Get WA Gateway config
    const { data: waConfig } = await supabase
      .from("wa_gateway")
      .select("*")
      .eq("is_active", true)
      .single();

    if (!waConfig) {
      console.log("WA Gateway not configured");
      return new Response(
        JSON.stringify({ success: false, message: "WA Gateway not configured" }),
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
      if (!recipient.phone) {
        console.log(`No phone for user ${recipient.id}, skipping`);
        continue;
      }

      // Send WhatsApp notification
      try {
        const waResponse = await fetch("https://api.fonnte.com/send", {
          method: "POST",
          headers: {
            "Authorization": waConfig.api_key,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            target: recipient.phone,
            message: messageTemplate,
            countryCode: "62",
          }),
        });

        const waResult = await waResponse.json();
        console.log(`WA sent to ${recipient.phone}:`, waResult);

        // Save notification to database
        await supabase.from("notifikasi").insert({
          user_id: recipient.id,
          jenis: type === 'spm' ? 'spm_status' : 'sp2d_status',
          judul: `Notifikasi ${type.toUpperCase()}`,
          pesan: messageTemplate,
          spm_id: type === 'spm' ? documentId : null,
          sent_via_wa: true,
          wa_sent_at: new Date().toISOString(),
        });

        notifications.push({
          recipient: recipient.full_name,
          phone: recipient.phone,
          status: "sent",
        });

      } catch (error: any) {
        console.error(`Failed to send WA to ${recipient.phone}:`, error);
        notifications.push({
          recipient: recipient.full_name,
          phone: recipient.phone,
          status: "failed",
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        notifications,
        message: `Sent ${notifications.filter(n => n.status === 'sent').length} notifications`,
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
