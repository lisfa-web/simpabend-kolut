import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, TrendingDown, Minus, CheckCircle, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/currency";

interface TargetRealizationWidgetProps {
  isLoading?: boolean;
}

export const TargetRealizationWidget = ({ isLoading: parentLoading }: TargetRealizationWidgetProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["target-realization"],
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const daysInMonth = endOfMonth.getDate();
      const currentDay = now.getDate();
      const progressRatio = currentDay / daysInMonth;

      // Get monthly target from config (default to realistic values)
      const { data: configData } = await supabase
        .from("config_sistem")
        .select("value")
        .eq("key", "target_spm_bulanan")
        .single();

      const targetSpm = configData?.value ? parseInt(configData.value) : 100;
      const targetNilai = 50000000000; // 50 Milyar default

      // SPM this month
      const { data: spmData, count: spmCount } = await supabase
        .from("spm")
        .select("*, nilai_spm", { count: "exact" })
        .gte("created_at", startOfMonth.toISOString())
        .lte("created_at", endOfMonth.toISOString())
        .neq("status", "draft");

      // Approved SPM this month
      const { data: approvedData, count: approvedCount } = await supabase
        .from("spm")
        .select("*, nilai_spm", { count: "exact" })
        .eq("status", "disetujui")
        .gte("tanggal_disetujui", startOfMonth.toISOString())
        .lte("tanggal_disetujui", endOfMonth.toISOString());

      // SP2D disbursed this month
      const { data: sp2dData, count: sp2dCount } = await supabase
        .from("sp2d")
        .select("*, nilai_sp2d", { count: "exact" })
        .eq("status", "cair")
        .gte("tanggal_cair", startOfMonth.toISOString())
        .lte("tanggal_cair", endOfMonth.toISOString());

      const totalSpm = spmCount || 0;
      const totalApproved = approvedCount || 0;
      const totalSp2d = sp2dCount || 0;

      const totalNilaiSpm = spmData?.reduce((sum, s) => sum + Number(s.nilai_spm || 0), 0) || 0;
      const totalNilaiApproved = approvedData?.reduce((sum, s) => sum + Number(s.nilai_spm || 0), 0) || 0;
      const totalNilaiSp2d = sp2dData?.reduce((sum, s) => sum + Number(s.nilai_sp2d || 0), 0) || 0;

      // Calculate expected progress
      const expectedSpm = Math.round(targetSpm * progressRatio);
      const expectedNilai = Math.round(targetNilai * progressRatio);

      return {
        targets: {
          spm: targetSpm,
          nilai: targetNilai,
        },
        actual: {
          spm: totalSpm,
          approved: totalApproved,
          sp2d: totalSp2d,
          nilaiSpm: totalNilaiSpm,
          nilaiApproved: totalNilaiApproved,
          nilaiSp2d: totalNilaiSp2d,
        },
        expected: {
          spm: expectedSpm,
          nilai: expectedNilai,
        },
        progress: {
          spm: Math.min(100, (totalSpm / targetSpm) * 100),
          nilai: Math.min(100, (totalNilaiSpm / targetNilai) * 100),
          approved: Math.min(100, (totalApproved / targetSpm) * 100),
        },
        daysRemaining: daysInMonth - currentDay,
        progressRatio,
      };
    },
  });

  if (isLoading || parentLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  const getProgressStatus = (actual: number, expected: number) => {
    const ratio = actual / expected;
    if (ratio >= 1) return { icon: TrendingUp, color: "text-green-600", bg: "bg-green-100", label: "Di Atas Target" };
    if (ratio >= 0.8) return { icon: Minus, color: "text-amber-600", bg: "bg-amber-100", label: "Mendekati Target" };
    return { icon: TrendingDown, color: "text-red-600", bg: "bg-red-100", label: "Di Bawah Target" };
  };

  const spmStatus = getProgressStatus(data?.actual.spm || 0, data?.expected.spm || 1);
  const SpmStatusIcon = spmStatus.icon;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-5 w-5 text-primary" />
          Target vs Realisasi Bulanan
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {data?.daysRemaining} hari tersisa • Progress bulan: {Math.round((data?.progressRatio || 0) * 100)}%
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* SPM Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total SPM Diajukan</span>
            <Badge className={`${spmStatus.bg} ${spmStatus.color} gap-1`}>
              <SpmStatusIcon className="h-3 w-3" />
              {spmStatus.label}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Progress value={data?.progress.spm || 0} className="flex-1 h-3" />
            <span className="text-sm font-bold min-w-[80px] text-right">
              {data?.actual.spm || 0} / {data?.targets.spm || 0}
            </span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Ekspektasi: {data?.expected.spm || 0} SPM</span>
            <span>{Math.round(data?.progress.spm || 0)}%</span>
          </div>
        </div>

        {/* Approved SPM Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">SPM Disetujui</span>
            <span className="text-sm text-muted-foreground">
              {data?.actual.approved || 0} dari {data?.actual.spm || 0} diajukan
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Progress value={data?.progress.approved || 0} className="flex-1 h-3 [&>div]:bg-green-500" />
            <span className="text-sm font-bold min-w-[80px] text-right text-green-600">
              {Math.round(data?.progress.approved || 0)}%
            </span>
          </div>
        </div>

        {/* Nilai Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Realisasi Nilai</span>
          </div>
          <div className="flex items-center gap-3">
            <Progress value={data?.progress.nilai || 0} className="flex-1 h-3 [&>div]:bg-amber-500" />
            <span className="text-sm font-bold min-w-[60px] text-right">
              {Math.round(data?.progress.nilai || 0)}%
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">
              Realisasi: {formatCurrency(data?.actual.nilaiSpm || 0)}
            </span>
            <span className="text-muted-foreground">
              Target: {formatCurrency(data?.targets.nilai || 0)}
            </span>
          </div>
        </div>

        {/* SP2D Stats */}
        <div className="pt-3 border-t">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{data?.actual.sp2d || 0}</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400">SP2D Cair</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(data?.actual.nilaiSp2d || 0)}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                {((data?.actual.approved || 0) / Math.max(data?.actual.spm || 1, 1) * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">Approval Rate</div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {data?.actual.approved || 0} disetujui
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
