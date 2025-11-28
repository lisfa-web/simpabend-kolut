import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, supabaseServiceKey);

    // Get archive threshold from config (default 30 days)
    const { data: configData } = await admin
      .from("config_sistem")
      .select("value")
      .eq("key", "auto_archive_days")
      .maybeSingle();

    const archiveDays = configData?.value ? parseInt(configData.value) : 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - archiveDays);

    console.log(`Auto-archive started. Archiving documents older than ${archiveDays} days (before ${cutoffDate.toISOString()})`);

    let archivedSpmCount = 0;
    let archivedSp2dCount = 0;

    // Archive SPM with status 'disetujui' older than cutoff date
    const { data: spmToArchive, error: spmError } = await admin
      .from("spm")
      .select("*")
      .eq("status", "disetujui")
      .lt("tanggal_disetujui", cutoffDate.toISOString())
      .limit(100);

    if (spmError) {
      console.error("Error fetching SPM to archive:", spmError);
    } else if (spmToArchive && spmToArchive.length > 0) {
      console.log(`Found ${spmToArchive.length} SPM to archive`);

      for (const spm of spmToArchive) {
        // Check if already archived
        const { data: existingArsip } = await admin
          .from("arsip_spm")
          .select("id")
          .eq("spm_id", spm.id)
          .maybeSingle();

        if (!existingArsip) {
          const { error: insertError } = await admin
            .from("arsip_spm")
            .insert({
              spm_id: spm.id,
              bendahara_id: spm.bendahara_id,
              opd_id: spm.opd_id,
              tanggal_spm: spm.tanggal_ajuan,
              nilai_spm: spm.nilai_spm,
              nilai_bersih: spm.nilai_bersih,
              nomor_spm: spm.nomor_spm || "-",
              nama_penerima: spm.nama_penerima,
              status: spm.status,
              snapshot_data: spm,
              archived_at: new Date().toISOString(),
            });

          if (insertError) {
            console.error(`Error archiving SPM ${spm.id}:`, insertError);
          } else {
            archivedSpmCount++;
            console.log(`Archived SPM: ${spm.nomor_spm}`);
          }
        }
      }
    }

    // Archive SP2D with status 'cair' older than cutoff date
    const { data: sp2dToArchive, error: sp2dError } = await admin
      .from("sp2d")
      .select(`
        *,
        spm:spm_id (
          bendahara_id,
          opd_id
        )
      `)
      .eq("status", "cair")
      .lt("tanggal_cair", cutoffDate.toISOString())
      .limit(100);

    if (sp2dError) {
      console.error("Error fetching SP2D to archive:", sp2dError);
    } else if (sp2dToArchive && sp2dToArchive.length > 0) {
      console.log(`Found ${sp2dToArchive.length} SP2D to archive`);

      for (const sp2d of sp2dToArchive) {
        // Check if already archived
        const { data: existingArsip } = await admin
          .from("arsip_sp2d")
          .select("id")
          .eq("sp2d_id", sp2d.id)
          .maybeSingle();

        if (!existingArsip && sp2d.spm) {
          const spmData = sp2d.spm as { bendahara_id: string; opd_id: string };
          const { error: insertError } = await admin
            .from("arsip_sp2d")
            .insert({
              sp2d_id: sp2d.id,
              spm_id: sp2d.spm_id,
              bendahara_id: spmData.bendahara_id,
              opd_id: spmData.opd_id,
              tanggal_sp2d: sp2d.tanggal_sp2d,
              nilai_sp2d: sp2d.nilai_sp2d,
              nilai_diterima: sp2d.nilai_diterima,
              nomor_sp2d: sp2d.nomor_sp2d,
              status: sp2d.status,
              snapshot_data: sp2d,
              archived_at: new Date().toISOString(),
            });

          if (insertError) {
            console.error(`Error archiving SP2D ${sp2d.id}:`, insertError);
          } else {
            archivedSp2dCount++;
            console.log(`Archived SP2D: ${sp2d.nomor_sp2d}`);
          }
        }
      }
    }

    const result = {
      success: true,
      message: `Auto-archive completed`,
      archived_spm: archivedSpmCount,
      archived_sp2d: archivedSp2dCount,
      archive_threshold_days: archiveDays,
      cutoff_date: cutoffDate.toISOString(),
    };

    console.log("Auto-archive result:", result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Auto-archive error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
