import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useUserRole } from "./useUserRole";

interface DashboardStats {
  totalSpm: number;
  totalSpmValue: number;
  approvedSpm: number;
  approvedSpmValue: number;
  approvedByKepalaBkad: number;
  approvedByKepalaBkadValue: number;
  inProgressSpm: number;
  inProgressSpmValue: number;
  revisionSpm: number;
  revisionSpmValue: number;
  totalSp2d: number;
  totalSp2dValue: number;
  issuedSp2d: number;
  issuedSp2dValue: number;
  testingBankSp2d: number;
  testingBankValue: number;
  disbursedSp2d: number;
  disbursedValue: number;
  failedSp2d: number;
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
  financialBreakdown: Array<{
    jenis_spm: string;
    total_spm: number;
    total_nilai: number;
  }>;
  alerts: {
    stuckSpm: Array<{
      id: string;
      nomor_spm: string;
      status: string;
      days_stuck: number;
      nilai_spm: number;
    }>;
    outlierSpm: Array<{
      id: string;
      nomor_spm: string;
      nilai_spm: number;
    }>;
  };
  topVendors: Array<{
    vendor_id: string;
    vendor_name: string;
    total_spm: number;
    total_nilai: number;
  }>;
  processTimeline: {
    resepsionis_to_pbmd: number;
    pbmd_to_akuntansi: number;
    akuntansi_to_perbendaharaan: number;
    perbendaharaan_to_kepala: number;
  };
  successMetrics: {
    successRate: number;
    rejectionRate: number;
    revisionRate: number;
    trendVsLastMonth: number;
  };
  dailySubmissions: Array<{
    date: string;
    count: number;
  }>;
  bottleneckAnalysis: Array<{
    stage: string;
    avgDays: number;
    count: number;
    slaTarget: number;
  }>;
  periodComparison: {
    weekly: {
      current: {
        submitted: number;
        approved: number;
        rejected: number;
        avgProcessDays: number;
        totalValue: number;
      };
      previous: {
        submitted: number;
        approved: number;
        rejected: number;
        avgProcessDays: number;
        totalValue: number;
      };
    };
    monthly: {
      current: {
        submitted: number;
        approved: number;
        rejected: number;
        avgProcessDays: number;
        totalValue: number;
      };
      previous: {
        submitted: number;
        approved: number;
        rejected: number;
        avgProcessDays: number;
        totalValue: number;
      };
    };
  };
  rejectionAnalysis: {
    totalRejected: number;
    byStage: Array<{
      stage: string;
      count: number;
      percentage: number;
    }>;
    trendVsLastMonth: number;
  };
}

export const useDashboardStats = () => {
  const { user } = useAuth();
  const { roles, hasRole, isAdmin } = useUserRole();

  return useQuery({
    queryKey: ["dashboardStats", user?.id, roles],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user) throw new Error("User not authenticated");

      // Build base query with role-based filtering - include jenis_spm join
      let spmQuery = supabase
        .from("spm")
        .select("*, jenis_spm:jenis_spm_id(id, nama_jenis)", { count: "exact" });

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

      const approvedByKepalaBkad = allSpm?.filter((s) => 
        s.status === "disetujui" && s.verified_by_kepala_bkad
      ).length || 0;
      const approvedByKepalaBkadValue = allSpm
        ?.filter((s) => s.status === "disetujui" && s.verified_by_kepala_bkad)
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
          perlu_revisi: monthData.filter((s) => s.status === "perlu_revisi").length,
        };
      });

      // SP2D Stats - Updated untuk workflow baru tanpa OTP
      const { data: sp2dData, error: sp2dError } = await supabase.from("sp2d").select("*");
      if (sp2dError) throw sp2dError;

      const totalSp2d = sp2dData?.length || 0;
      const totalSp2dValue = sp2dData?.reduce((sum, sp2d) => sum + Number(sp2d.nilai_sp2d || 0), 0) || 0;
      
      // Status: diterbitkan (siap kirim ke bank)
      const issuedSp2d = sp2dData?.filter((s) => s.status === "diterbitkan").length || 0;
      const issuedSp2dValue = sp2dData
        ?.filter((s) => s.status === "diterbitkan")
        .reduce((sum, sp2d) => sum + Number(sp2d.nilai_sp2d || 0), 0) || 0;
      
      // Status: diuji_bank (sedang di Bank Sultra)
      const testingBankSp2d = sp2dData?.filter((s) => s.status === "diuji_bank").length || 0;
      const testingBankValue = sp2dData
        ?.filter((s) => s.status === "diuji_bank")
        .reduce((sum, sp2d) => sum + Number(sp2d.nilai_sp2d || 0), 0) || 0;
      
      // Status: cair (dana sudah dicairkan)
      const disbursedSp2d = sp2dData?.filter((s) => s.status === "cair").length || 0;
      const disbursedValue = sp2dData
        ?.filter((s) => s.status === "cair")
        .reduce((sum, sp2d) => sum + Number(sp2d.nilai_sp2d || 0), 0) || 0;
      
      const failedSp2d = sp2dData?.filter((s) => s.status === "gagal").length || 0;

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

      // Financial Breakdown by Jenis SPM - Now properly joined
      const financialMap = new Map<string, { total_spm: number; total_nilai: number }>();
      allSpm?.forEach((spm: any) => {
        // Access nested jenis_spm from join
        const jenis = spm.jenis_spm?.nama_jenis || "Lainnya";
        if (!financialMap.has(jenis)) {
          financialMap.set(jenis, { total_spm: 0, total_nilai: 0 });
        }
        const data = financialMap.get(jenis)!;
        data.total_spm += 1;
        data.total_nilai += Number(spm.nilai_spm || 0);
      });

      const financialBreakdown = Array.from(financialMap.entries()).map(([jenis_spm, data]) => ({
        jenis_spm,
        ...data,
      }));

      // Alert: Stuck SPM (in progress > 7 days)
      const stuckSpmSevenDaysAgo = new Date();
      stuckSpmSevenDaysAgo.setDate(stuckSpmSevenDaysAgo.getDate() - 7);

      const stuckSpm = allSpm
        ?.filter((s) => {
          const isInProgress = inProgressStatuses.includes(s.status || "");
          const updatedAt = new Date(s.updated_at || "");
          return isInProgress && updatedAt < stuckSpmSevenDaysAgo;
        })
        .map((s) => ({
          id: s.id,
          nomor_spm: s.nomor_spm || "Draft",
          status: s.status || "",
          days_stuck: Math.floor(
            (new Date().getTime() - new Date(s.updated_at || "").getTime()) / (1000 * 60 * 60 * 24)
          ),
          nilai_spm: Number(s.nilai_spm || 0),
        }))
        .slice(0, 5) || [];

      // Alert: Outlier SPM (nilai > 2 standard deviations from mean)
      const values = allSpm?.map((s) => Number(s.nilai_spm || 0)) || [];
      const mean = values.reduce((sum, val) => sum + val, 0) / (values.length || 1);
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length || 1);
      const stdDev = Math.sqrt(variance);
      const threshold = mean + 2 * stdDev;

      const outlierSpm = allSpm
        ?.filter((s) => Number(s.nilai_spm || 0) > threshold)
        .map((s) => ({
          id: s.id,
          nomor_spm: s.nomor_spm || "Draft",
          nilai_spm: Number(s.nilai_spm || 0),
        }))
        .slice(0, 5) || [];

      // Top Vendors/Recipients - Use nama_penerima since no vendor FK exists
      const recipientMap = new Map<string, { vendor_name: string; total_spm: number; total_nilai: number }>();
      allSpm?.forEach((spm: any) => {
        if (!spm.nama_penerima || spm.status === "draft") return;
        
        const recipientName = spm.nama_penerima;
        if (!recipientMap.has(recipientName)) {
          recipientMap.set(recipientName, { vendor_name: recipientName, total_spm: 0, total_nilai: 0 });
        }
        const recipient = recipientMap.get(recipientName)!;
        recipient.total_spm += 1;
        recipient.total_nilai += Number(spm.nilai_spm || 0);
      });

      const topVendors = Array.from(recipientMap.entries())
        .map(([vendor_id, data]) => ({ vendor_id, ...data }))
        .sort((a, b) => b.total_nilai - a.total_nilai)
        .slice(0, 5);

      // Process Timeline - Calculate average time between stages
      const spmWithDates = allSpm?.filter(
        (s) => s.status === "disetujui" && s.tanggal_resepsionis && s.tanggal_disetujui
      ) || [];

      const calculateAvgDays = (dateField1: string, dateField2: string) => {
        const validSpm = spmWithDates.filter(
          (s) => (s as any)[dateField1] && (s as any)[dateField2]
        );
        if (validSpm.length === 0) return 0;
        
        return validSpm.reduce((sum, s) => {
          const start = new Date((s as any)[dateField1]).getTime();
          const end = new Date((s as any)[dateField2]).getTime();
          return sum + (end - start) / (1000 * 60 * 60 * 24);
        }, 0) / validSpm.length;
      };

      const processTimeline = {
        resepsionis_to_pbmd: calculateAvgDays("tanggal_resepsionis", "tanggal_pbmd"),
        pbmd_to_akuntansi: calculateAvgDays("tanggal_pbmd", "tanggal_akuntansi"),
        akuntansi_to_perbendaharaan: calculateAvgDays("tanggal_akuntansi", "tanggal_perbendaharaan"),
        perbendaharaan_to_kepala: calculateAvgDays("tanggal_perbendaharaan", "tanggal_kepala_bkad"),
      };

      // Success Metrics - Only approved vs revision
      const totalCompleted = approvedSpm + revisionSpm || 1;
      const successRate = (approvedSpm / totalCompleted) * 100;
      const revisionRate = (revisionSpm / totalCompleted) * 100;

      // Compare with last month
      const lastMonthDate = new Date();
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
      const lastMonthStart = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth(), 1);
      const lastMonthEnd = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth() + 1, 0);

      const lastMonthSpm = allSpm?.filter((s) => {
        const date = new Date(s.tanggal_ajuan || "");
        return date >= lastMonthStart && date <= lastMonthEnd;
      }) || [];

      const lastMonthApproved = lastMonthSpm.filter((s) => s.status === "disetujui").length;
      const lastMonthTotal = lastMonthSpm.filter(
        (s) => s.status === "disetujui" || s.status === "perlu_revisi"
      ).length || 1;
      const lastMonthSuccessRate = (lastMonthApproved / lastMonthTotal) * 100;
      const trendVsLastMonth = successRate - lastMonthSuccessRate;

      // Daily Submissions (last 30 days)
      const dailySubmissionsThirtyDaysAgo = new Date();
      dailySubmissionsThirtyDaysAgo.setDate(dailySubmissionsThirtyDaysAgo.getDate() - 30);

      const dailyMap = new Map<string, number>();
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        dailyMap.set(dateStr, 0);
      }

      allSpm?.forEach((s) => {
        const date = new Date(s.tanggal_ajuan || "");
        if (date >= dailySubmissionsThirtyDaysAgo) {
          const dateStr = date.toISOString().split("T")[0];
          dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + 1);
        }
      });

      const dailySubmissions = Array.from(dailyMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Bottleneck Analysis
      const STAGE_LABELS: Record<string, string> = {
        "resepsionis_verifikasi": "Resepsionis",
        "pbmd_verifikasi": "PBMD",
        "akuntansi_validasi": "Akuntansi",
        "perbendaharaan_verifikasi": "Perbendaharaan",
        "kepala_bkad_review": "Kepala BKAD",
      };

      const bottleneckAnalysis = [
        { field: "resepsionis_to_pbmd", stage: "Resepsionis", data: processTimeline.resepsionis_to_pbmd },
        { field: "pbmd_to_akuntansi", stage: "PBMD", data: processTimeline.pbmd_to_akuntansi },
        { field: "akuntansi_to_perbendaharaan", stage: "Akuntansi", data: processTimeline.akuntansi_to_perbendaharaan },
        { field: "perbendaharaan_to_kepala", stage: "Perbendaharaan", data: processTimeline.perbendaharaan_to_kepala },
      ].map(({ stage, data }) => {
        const stageCount = spmWithDates.filter((s) => {
          // Count SPM that passed through this stage
          return s.status !== "draft" && s.status !== "diajukan";
        }).length;

        return {
          stage,
          avgDays: data,
          count: stageCount,
          slaTarget: 2, // 2 days SLA target per stage
        };
      });

      // Period Comparison - Weekly
      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      const fourteenDaysAgo = new Date(now);
      fourteenDaysAgo.setDate(now.getDate() - 14);

      const currentWeekSpm = allSpm?.filter((s) => {
        const date = new Date(s.tanggal_ajuan || "");
        return date >= sevenDaysAgo && date <= now;
      }) || [];

      const previousWeekSpm = allSpm?.filter((s) => {
        const date = new Date(s.tanggal_ajuan || "");
        return date >= fourteenDaysAgo && date < sevenDaysAgo;
      }) || [];

      const calculatePeriodStats = (spmList: any[]) => {
        const submitted = spmList.length;
        const approved = spmList.filter((s) => s.status === "disetujui").length;
        const rejected = spmList.filter((s) => s.status === "perlu_revisi").length;
        const totalValue = spmList.reduce((sum, s) => sum + Number(s.nilai_spm || 0), 0);
        
        const completedSpm = spmList.filter((s) => s.status === "disetujui" && s.tanggal_ajuan && s.tanggal_disetujui);
        const avgProcessDays = completedSpm.length > 0
          ? completedSpm.reduce((sum, s) => {
              const start = new Date(s.tanggal_ajuan!).getTime();
              const end = new Date(s.tanggal_disetujui!).getTime();
              return sum + (end - start) / (1000 * 60 * 60 * 24);
            }, 0) / completedSpm.length
          : 0;

        return { submitted, approved, rejected, avgProcessDays, totalValue };
      };

      // Period Comparison - Monthly
      const thirtyDaysAgoDate = new Date(now);
      thirtyDaysAgoDate.setDate(now.getDate() - 30);
      const sixtyDaysAgoDate = new Date(now);
      sixtyDaysAgoDate.setDate(now.getDate() - 60);

      const currentMonthSpm = allSpm?.filter((s) => {
        const date = new Date(s.tanggal_ajuan || "");
        return date >= thirtyDaysAgoDate && date <= now;
      }) || [];

      const previousMonthSpm = allSpm?.filter((s) => {
        const date = new Date(s.tanggal_ajuan || "");
        return date >= sixtyDaysAgoDate && date < thirtyDaysAgoDate;
      }) || [];

      // Rejection Analysis
      const rejectedSpmList = allSpm?.filter((s) => s.status === "perlu_revisi") || [];
      
      // Count rejections by stage (where they were rejected from)
      const rejectionByStage = new Map<string, number>();
      rejectedSpmList.forEach((s) => {
        // Determine at which stage it was rejected based on the last verification timestamp
        let rejectionStage = "Unknown";
        
        if (s.tanggal_kepala_bkad) rejectionStage = STAGE_LABELS["kepala_bkad_review"];
        else if (s.tanggal_perbendaharaan) rejectionStage = STAGE_LABELS["perbendaharaan_verifikasi"];
        else if (s.tanggal_akuntansi) rejectionStage = STAGE_LABELS["akuntansi_validasi"];
        else if (s.tanggal_pbmd) rejectionStage = STAGE_LABELS["pbmd_verifikasi"];
        else if (s.tanggal_resepsionis) rejectionStage = STAGE_LABELS["resepsionis_verifikasi"];
        
        rejectionByStage.set(rejectionStage, (rejectionByStage.get(rejectionStage) || 0) + 1);
      });

      const totalRejections = rejectedSpmList.length;
      const rejectionByStageArray = Array.from(rejectionByStage.entries())
        .map(([stage, count]) => ({
          stage,
          count,
          percentage: totalRejections > 0 ? (count / totalRejections) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);

      // Calculate rejection trend vs last month
      const lastMonthRejected = previousMonthSpm.filter((s) => s.status === "perlu_revisi").length;
      const currentMonthRejected = currentMonthSpm.filter((s) => s.status === "perlu_revisi").length;
      const rejectionTrend = lastMonthRejected > 0 
        ? ((currentMonthRejected - lastMonthRejected) / lastMonthRejected) * 100 
        : 0;

      return {
        totalSpm,
        totalSpmValue,
        approvedSpm,
        approvedSpmValue,
        approvedByKepalaBkad,
        approvedByKepalaBkadValue,
        inProgressSpm,
        inProgressSpmValue,
        revisionSpm,
        revisionSpmValue,
        totalSp2d,
        totalSp2dValue,
        issuedSp2d,
        issuedSp2dValue,
        testingBankSp2d,
        testingBankValue,
        disbursedSp2d,
        disbursedValue,
        failedSp2d,
        avgProcessDays,
        monthlyTrend: monthlyTrend as any,
        opdBreakdown,
        financialBreakdown,
        alerts: {
          stuckSpm,
          outlierSpm,
        },
        topVendors,
        processTimeline,
        successMetrics: {
          successRate,
          rejectionRate: revisionRate, // rejectionRate sama dengan revisionRate
          revisionRate,
          trendVsLastMonth,
        },
        dailySubmissions,
        bottleneckAnalysis,
        periodComparison: {
          weekly: {
            current: calculatePeriodStats(currentWeekSpm),
            previous: calculatePeriodStats(previousWeekSpm),
          },
          monthly: {
            current: calculatePeriodStats(currentMonthSpm),
            previous: calculatePeriodStats(previousMonthSpm),
          },
        },
        rejectionAnalysis: {
          totalRejected: totalRejections,
          byStage: rejectionByStageArray,
          trendVsLastMonth: rejectionTrend,
        },
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Data fresh selama 5 menit
    gcTime: 10 * 60 * 1000, // Cache disimpan 10 menit
    refetchOnWindowFocus: false, // Jangan auto-refetch saat window focus
    refetchOnMount: false, // Jangan auto-refetch saat mount jika data masih fresh
  });
};
