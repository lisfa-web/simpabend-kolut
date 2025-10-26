import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useUserRole } from "./useUserRole";

interface MenuNotifications {
  inputSpm: number;
  verifikasiResepsionis: number;
  verifikasiPbmd: number;
  verifikasiAkuntansi: number;
  verifikasiPerbendaharaan: number;
  approvalKepalaBkad: number;
  sp2d: number;
}

export const useMenuNotifications = () => {
  const { user } = useAuth();
  const { roles, hasRole } = useUserRole();

  return useQuery({
    queryKey: ["menuNotifications", user?.id, roles],
    queryFn: async (): Promise<MenuNotifications> => {
      if (!user) {
        return {
          inputSpm: 0,
          verifikasiResepsionis: 0,
          verifikasiPbmd: 0,
          verifikasiAkuntansi: 0,
          verifikasiPerbendaharaan: 0,
          approvalKepalaBkad: 0,
          sp2d: 0,
        };
      }

      const notifications: MenuNotifications = {
        inputSpm: 0,
        verifikasiResepsionis: 0,
        verifikasiPbmd: 0,
        verifikasiAkuntansi: 0,
        verifikasiPerbendaharaan: 0,
        approvalKepalaBkad: 0,
        sp2d: 0,
      };

      // Count for bendahara_opd - SPM perlu revisi
      if (hasRole("bendahara_opd")) {
        const userOpdId = roles.find((r) => r.role === "bendahara_opd")?.opd_id;
        const query = userOpdId
          ? supabase.from("spm").select("*", { count: "exact", head: true }).eq("opd_id", userOpdId).eq("status", "perlu_revisi")
          : supabase.from("spm").select("*", { count: "exact", head: true }).eq("bendahara_id", user.id).eq("status", "perlu_revisi");

        const { count } = await query;
        notifications.inputSpm = count || 0;
      }

      // Count for resepsionis - SPM menunggu verifikasi
      if (hasRole("resepsionis")) {
        const { count } = await supabase
          .from("spm")
          .select("*", { count: "exact", head: true })
          .eq("status", "resepsionis_verifikasi");
        notifications.verifikasiResepsionis = count || 0;
      }

      // Count for pbmd
      if (hasRole("pbmd")) {
        const { count } = await supabase
          .from("spm")
          .select("*", { count: "exact", head: true })
          .eq("status", "pbmd_verifikasi");
        notifications.verifikasiPbmd = count || 0;
      }

      // Count for akuntansi
      if (hasRole("akuntansi")) {
        const { count } = await supabase
          .from("spm")
          .select("*", { count: "exact", head: true })
          .eq("status", "akuntansi_validasi");
        notifications.verifikasiAkuntansi = count || 0;
      }

      // Count for perbendaharaan
      if (hasRole("perbendaharaan")) {
        const { count } = await supabase
          .from("spm")
          .select("*", { count: "exact", head: true })
          .eq("status", "perbendaharaan_verifikasi");
        notifications.verifikasiPerbendaharaan = count || 0;
      }

      // Count for kepala_bkad
      if (hasRole("kepala_bkad")) {
        const { count } = await supabase
          .from("spm")
          .select("*", { count: "exact", head: true })
          .eq("status", "kepala_bkad_review");
        notifications.approvalKepalaBkad = count || 0;
      }

      // Count for kuasa_bud - SP2D pending
      if (hasRole("kuasa_bud")) {
        const { count } = await supabase
          .from("sp2d")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");
        notifications.sp2d = count || 0;
      }

      return notifications;
    },
    enabled: !!user,
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes (optimized dari 30 detik)
    staleTime: 60 * 1000, // Data fresh selama 1 menit
    refetchOnWindowFocus: false, // Jangan auto-refetch saat window focus
  });
};
