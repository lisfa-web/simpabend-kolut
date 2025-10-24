import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useUserRole } from "./useUserRole";

interface DashboardStats {
  totalSpm: number;
  totalSpmValue: number;
  approvedSpm: number;
  approvedSpmValue: number;
  inProgressSpm: number;
  inProgressSpmValue: number;
  revisionSpm: number;
  revisionSpmValue: number;
  totalSp2d: number;
  totalSp2dValue: number;
  pendingSp2d: number;
  avgProcessDays: number;
  monthlyTrend: Array<{
    month: string;
    diajukan: number;
    disetujui: number;
    ditolak: number;
  }>;
  opdBreakdown: Array<{
    nama_opd: string;
    total_spm: number;
    total_nilai: number;
  }>;
}

export const useDashboardStats = () => {
  const { user } = useAuth();
  const { roles, hasRole, isAdmin } = useUserRole();

  return useQuery({
    queryKey: ["dashboardStats", user?.id, roles],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user) throw new Error("User not authenticated");

      // Build base query with role-based filtering
      let spmQuery = supabase.from("spm").select("*", { count: "exact" });

      // Role-based filtering
      if (hasRole("bendahara_opd")) {
        const userOpdId = roles.find((r) => r.role === "bendahara_opd")?.opd_id;
        if (userOpdId) {
          spmQuery = spmQuery.eq("opd_id", userOpdId);
        } else {
          spmQuery = spmQuery.eq("bendahara_id", user.id);
        }
      } else if (hasRole("resepsionis")) {
        spmQuery = spmQuery.neq("status", "draft");
      } else if (!isAdmin() && !hasRole("kepala_bkad") && !hasRole("kuasa_bud")) {
        // Other roles see relevant SPM
        spmQuery = spmQuery.neq("status", "draft");
      }

      const { data: allSpm, error: spmError } = await spmQuery;
      if (spmError) throw spmError;

      // Calculate stats
      const totalSpm = allSpm?.length || 0;
      const totalSpmValue = allSpm?.reduce((sum, spm) => sum + Number(spm.nilai_spm || 0), 0) || 0;

      const approvedSpm = allSpm?.filter((s) => s.status === "disetujui").length || 0;
      const approvedSpmValue = allSpm
        ?.filter((s) => s.status === "disetujui")
        .reduce((sum, spm) => sum + Number(spm.nilai_spm || 0), 0) || 0;

      const inProgressStatuses = [
        "resepsionis_verifikasi",
        "pbmd_verifikasi",
        "akuntansi_validasi",
        "perbendaharaan_verifikasi",
        "kepala_bkad_review",
      ];
      const inProgressSpm = allSpm?.filter((s) => inProgressStatuses.includes(s.status || "")).length || 0;
      const inProgressSpmValue = allSpm
        ?.filter((s) => inProgressStatuses.includes(s.status || ""))
        .reduce((sum, spm) => sum + Number(spm.nilai_spm || 0), 0) || 0;

      const revisionSpm = allSpm?.filter((s) => s.status === "perlu_revisi").length || 0;
      const revisionSpmValue = allSpm
        ?.filter((s) => s.status === "perlu_revisi")
        .reduce((sum, spm) => sum + Number(spm.nilai_spm || 0), 0) || 0;

      // Average process time
      const approvedWithDates = allSpm?.filter(
        (s) => s.status === "disetujui" && s.tanggal_ajuan && s.tanggal_disetujui
      );
      const avgProcessDays =
        approvedWithDates && approvedWithDates.length > 0
          ? approvedWithDates.reduce((sum, spm) => {
              const start = new Date(spm.tanggal_ajuan!).getTime();
              const end = new Date(spm.tanggal_disetujui!).getTime();
              return sum + (end - start) / (1000 * 60 * 60 * 24);
            }, 0) / approvedWithDates.length
          : 0;

      // Monthly trend (last 5 months)
      const fiveMonthsAgo = new Date();
      fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 4);

      const monthlyData = allSpm?.filter((s) => new Date(s.tanggal_ajuan || "") >= fiveMonthsAgo) || [];
      const monthlyTrend = Array.from({ length: 5 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (4 - i));
        const monthName = date.toLocaleString("id-ID", { month: "short" });
        const month = date.getMonth();
        const year = date.getFullYear();

        const monthData = monthlyData.filter((s) => {
          const spmDate = new Date(s.tanggal_ajuan || "");
          return spmDate.getMonth() === month && spmDate.getFullYear() === year;
        });

        return {
          month: monthName,
          diajukan: monthData.length,
          disetujui: monthData.filter((s) => s.status === "disetujui").length,
          ditolak: monthData.filter((s) => s.status === "perlu_revisi" || s.status === "ditolak").length,
        };
      });

      // SP2D Stats
      const { data: sp2dData, error: sp2dError } = await supabase.from("sp2d").select("*");
      if (sp2dError) throw sp2dError;

      const totalSp2d = sp2dData?.length || 0;
      const totalSp2dValue = sp2dData?.reduce((sum, sp2d) => sum + Number(sp2d.nilai_sp2d || 0), 0) || 0;
      const pendingSp2d = sp2dData?.filter((s) => s.status === "pending").length || 0;

      // OPD Breakdown
      const { data: opdData, error: opdError } = await supabase
        .from("spm")
        .select("opd_id, nilai_spm, opd:opd_id(nama_opd)")
        .neq("status", "draft");

      if (opdError) throw opdError;

      const opdMap = new Map<string, { nama_opd: string; total_spm: number; total_nilai: number }>();
      opdData?.forEach((spm: any) => {
        const opdId = spm.opd_id;
        const opdName = spm.opd?.nama_opd || "Unknown OPD";
        if (!opdMap.has(opdId)) {
          opdMap.set(opdId, { nama_opd: opdName, total_spm: 0, total_nilai: 0 });
        }
        const opd = opdMap.get(opdId)!;
        opd.total_spm += 1;
        opd.total_nilai += Number(spm.nilai_spm || 0);
      });

      const opdBreakdown = Array.from(opdMap.values())
        .sort((a, b) => b.total_nilai - a.total_nilai)
        .slice(0, 5);

      return {
        totalSpm,
        totalSpmValue,
        approvedSpm,
        approvedSpmValue,
        inProgressSpm,
        inProgressSpmValue,
        revisionSpm,
        revisionSpmValue,
        totalSp2d,
        totalSp2dValue,
        pendingSp2d,
        avgProcessDays,
        monthlyTrend,
        opdBreakdown,
      };
    },
    enabled: !!user,
  });
};
