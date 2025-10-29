import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useUserRole } from "./useUserRole";

interface ActionItem {
  id: string;
  type: "spm" | "sp2d";
  title: string;
  status: string;
  date: string;
  amount: number;
}

export const useDashboardActionItems = () => {
  const { user } = useAuth();
  const { hasRole, isAdmin, roles } = useUserRole();

  return useQuery({
    queryKey: ["dashboardActionItems", user?.id, roles],
    queryFn: async (): Promise<ActionItem[]> => {
      if (!user) {
        console.log("❌ [ActionItems] No user logged in");
        return [];
      }

      console.log("🔍 [ActionItems] User ID:", user.id);
      console.log("🔍 [ActionItems] User Roles:", roles);

      const items: ActionItem[] = [];

      try {

        // Bendahara: SPM dengan status revisi
        if (hasRole("bendahara_opd")) {
          const { data: revisiSpm, error } = await supabase
            .from("spm")
            .select("*")
            .eq("bendahara_id", user.id)
            .eq("status", "perlu_revisi")
            .order("tanggal_ajuan", { ascending: true });

          if (error) {
            console.error("❌ [ActionItems] Error fetching Bendahara SPM:", error);
          } else {
            console.log(`✅ [ActionItems] Bendahara - Found ${revisiSpm?.length || 0} SPM perlu revisi`);
            revisiSpm?.forEach((spm) => {
              items.push({
                id: spm.id,
                type: "spm",
                title: `SPM ${spm.nomor_spm || "Draft"} perlu revisi`,
                status: "perlu_revisi",
                date: spm.tanggal_ajuan || "",
                amount: Number(spm.nilai_spm || 0),
              });
            });
          }
        }

        // Resepsionis: SPM yang perlu diverifikasi
        if (hasRole("resepsionis")) {
          const { data: pendingSpm, error } = await supabase
            .from("spm")
            .select("*")
            .eq("status", "diajukan")
            .order("tanggal_ajuan", { ascending: true })
            .limit(5);

          if (error) {
            console.error("❌ [ActionItems] Error fetching Resepsionis SPM:", error);
          } else {
            console.log(`✅ [ActionItems] Resepsionis - Found ${pendingSpm?.length || 0} SPM diajukan`);
            pendingSpm?.forEach((spm) => {
              items.push({
                id: spm.id,
                type: "spm",
                title: `SPM ${spm.nomor_spm || "Draft"} menunggu verifikasi`,
                status: "diajukan",
                date: spm.tanggal_ajuan || "",
                amount: Number(spm.nilai_spm || 0),
              });
            });
          }
        }

        // PBMD: SPM yang perlu diverifikasi
        if (hasRole("pbmd")) {
          const { data: pendingSpm, error } = await supabase
            .from("spm")
            .select("*")
            .eq("status", "resepsionis_verifikasi")
            .order("tanggal_resepsionis", { ascending: true })
            .limit(5);

          if (error) {
            console.error("❌ [ActionItems] Error fetching PBMD SPM:", error);
          } else {
            console.log(`✅ [ActionItems] PBMD - Found ${pendingSpm?.length || 0} SPM resepsionis_verifikasi`);
            pendingSpm?.forEach((spm) => {
              items.push({
                id: spm.id,
                type: "spm",
                title: `SPM ${spm.nomor_spm} menunggu verifikasi PBMD`,
                status: "resepsionis_verifikasi",
                date: spm.tanggal_resepsionis || "",
                amount: Number(spm.nilai_spm || 0),
              });
            });
          }
        }

        // Akuntansi: SPM yang perlu divalidasi
        if (hasRole("akuntansi")) {
          const { data: pendingSpm, error } = await supabase
            .from("spm")
            .select("*")
            .eq("status", "pbmd_verifikasi")
            .order("tanggal_pbmd", { ascending: true })
            .limit(5);

          if (error) {
            console.error("❌ [ActionItems] Error fetching Akuntansi SPM:", error);
          } else {
            console.log(`✅ [ActionItems] Akuntansi - Found ${pendingSpm?.length || 0} SPM pbmd_verifikasi`);
            pendingSpm?.forEach((spm) => {
              items.push({
                id: spm.id,
                type: "spm",
                title: `SPM ${spm.nomor_spm} menunggu validasi Akuntansi`,
                status: "pbmd_verifikasi",
                date: spm.tanggal_pbmd || "",
                amount: Number(spm.nilai_spm || 0),
              });
            });
          }
        }

        // Perbendaharaan: SPM yang perlu diverifikasi
        if (hasRole("perbendaharaan")) {
          const { data: pendingSpm, error } = await supabase
            .from("spm")
            .select("*")
            .eq("status", "akuntansi_validasi")
            .order("tanggal_akuntansi", { ascending: true })
            .limit(5);

          if (error) {
            console.error("❌ [ActionItems] Error fetching Perbendaharaan SPM:", error);
          } else {
            console.log(`✅ [ActionItems] Perbendaharaan - Found ${pendingSpm?.length || 0} SPM akuntansi_validasi`);
            pendingSpm?.forEach((spm) => {
              items.push({
                id: spm.id,
                type: "spm",
                title: `SPM ${spm.nomor_spm} menunggu verifikasi Perbendaharaan`,
                status: "akuntansi_validasi",
                date: spm.tanggal_akuntansi || "",
                amount: Number(spm.nilai_spm || 0),
              });
            });
          }
        }

        // Kepala BKAD: SPM yang perlu approval
        if (hasRole("kepala_bkad") || isAdmin()) {
          const { data: pendingSpm, error } = await supabase
            .from("spm")
            .select("*")
            .eq("status", "perbendaharaan_verifikasi")
            .order("tanggal_perbendaharaan", { ascending: true })
            .limit(5);

          if (error) {
            console.error("❌ [ActionItems] Error fetching Kepala BKAD SPM:", error);
          } else {
            console.log(`✅ [ActionItems] Kepala BKAD - Found ${pendingSpm?.length || 0} SPM perbendaharaan_verifikasi`);
            pendingSpm?.forEach((spm) => {
              items.push({
                id: spm.id,
                type: "spm",
                title: `SPM ${spm.nomor_spm} menunggu approval`,
                status: "perbendaharaan_verifikasi",
                date: spm.tanggal_perbendaharaan || "",
                amount: Number(spm.nilai_spm || 0),
              });
            });
          }
        }

        // Kuasa BUD: SP2D yang perlu tindakan (workflow baru tanpa OTP)
        if (hasRole("kuasa_bud") || isAdmin()) {
          // 1. SP2D siap dikirim ke Bank (status: diterbitkan)
          const { data: readyToSend, error: error1 } = await supabase
            .from("sp2d")
            .select("*, spm:spm_id(nomor_spm)")
            .eq("status", "diterbitkan")
            .order("created_at", { ascending: true })
            .limit(3);

          if (error1) {
            console.error("❌ [ActionItems] Error fetching ready-to-send SP2D:", error1);
          } else {
            console.log(`✅ [ActionItems] Found ${readyToSend?.length || 0} SP2D siap kirim bank`);
            readyToSend?.forEach((sp2d: any) => {
              items.push({
                id: sp2d.id,
                type: "sp2d",
                title: `SP2D ${sp2d.nomor_sp2d} siap dikirim ke Bank`,
                status: "diterbitkan",
                date: sp2d.tanggal_sp2d || "",
                amount: Number(sp2d.nilai_sp2d || 0),
              });
            });
          }

          // 2. SP2D menunggu konfirmasi Bank (status: diuji_bank tanpa konfirmasi)
          const { data: waitingConfirm, error: error2 } = await supabase
            .from("sp2d")
            .select("*, spm:spm_id(nomor_spm)")
            .eq("status", "diuji_bank")
            .is("tanggal_konfirmasi_bank", null)
            .order("tanggal_kirim_bank", { ascending: true })
            .limit(3);

          if (error2) {
            console.error("❌ [ActionItems] Error fetching waiting-confirm SP2D:", error2);
          } else {
            console.log(`✅ [ActionItems] Found ${waitingConfirm?.length || 0} SP2D menunggu konfirmasi`);
            waitingConfirm?.forEach((sp2d: any) => {
              items.push({
                id: sp2d.id,
                type: "sp2d",
                title: `SP2D ${sp2d.nomor_sp2d} menunggu konfirmasi Bank`,
                status: "diuji_bank",
                date: sp2d.tanggal_kirim_bank || "",
                amount: Number(sp2d.nilai_sp2d || 0),
              });
            });
          }

          // 3. SP2D siap dicairkan (status: diuji_bank dengan konfirmasi)
          const { data: readyToDisburse, error: error3 } = await supabase
            .from("sp2d")
            .select("*, spm:spm_id(nomor_spm)")
            .eq("status", "diuji_bank")
            .not("tanggal_konfirmasi_bank", "is", null)
            .order("tanggal_konfirmasi_bank", { ascending: true })
            .limit(3);

          if (error3) {
            console.error("❌ [ActionItems] Error fetching ready-to-disburse SP2D:", error3);
          } else {
            console.log(`✅ [ActionItems] Found ${readyToDisburse?.length || 0} SP2D siap dicairkan`);
            readyToDisburse?.forEach((sp2d: any) => {
              items.push({
                id: sp2d.id,
                type: "sp2d",
                title: `SP2D ${sp2d.nomor_sp2d} siap dicairkan`,
                status: "diuji_bank_confirmed",
                date: sp2d.tanggal_konfirmasi_bank || "",
                amount: Number(sp2d.nilai_sp2d || 0),
              });
            });
          }
        }

        console.log(`📊 [ActionItems] Total items found: ${items.length}`);
        return items;
      } catch (error) {
        console.error("❌ [ActionItems] Unexpected error:", error);
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // Data fresh selama 2 menit
    gcTime: 5 * 60 * 1000, // Cache disimpan 5 menit
    refetchOnWindowFocus: false,
  });
};
