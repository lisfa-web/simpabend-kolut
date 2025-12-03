import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Building2, Trophy, TrendingUp, TrendingDown, Medal, Crown, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/currency";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface OpdComparisonWidgetProps {
  isLoading?: boolean;
}

const RANK_ICONS = [Crown, Medal, Award];
const RANK_COLORS = [
  "from-amber-400 to-yellow-500",
  "from-slate-300 to-slate-400", 
  "from-orange-400 to-amber-500"
];

export const OpdComparisonWidget = ({ isLoading: parentLoading }: OpdComparisonWidgetProps) => {
  const [metric, setMetric] = useState<"total" | "approved" | "speed">("total");

  const { data, isLoading } = useQuery({
    queryKey: ["opd-comparison", metric],
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get all OPD
      const { data: opdList } = await supabase
        .from("opd")
        .select("id, nama_opd, kode_opd")
        .eq("is_active", true);

      // Get SPM data with OPD
      const { data: spmData } = await supabase
        .from("spm")
        .select("opd_id, status, nilai_spm, tanggal_ajuan, tanggal_disetujui")
        .gte("created_at", startOfMonth.toISOString())
        .neq("status", "draft");

      // Calculate metrics per OPD
      const opdMetrics = (opdList || []).map((opd) => {
        const opdSpm = spmData?.filter(s => s.opd_id === opd.id) || [];
        const totalSpm = opdSpm.length;
        const totalNilai = opdSpm.reduce((sum, s) => sum + Number(s.nilai_spm || 0), 0);
        const approvedSpm = opdSpm.filter(s => s.status === "disetujui").length;
        const approvalRate = totalSpm > 0 ? (approvedSpm / totalSpm) * 100 : 0;

        // Calculate average process time
        const completedSpm = opdSpm.filter(s => s.tanggal_ajuan && s.tanggal_disetujui);
        const avgDays = completedSpm.length > 0
          ? completedSpm.reduce((sum, s) => {
              const start = new Date(s.tanggal_ajuan!).getTime();
              const end = new Date(s.tanggal_disetujui!).getTime();
              return sum + (end - start) / (1000 * 60 * 60 * 24);
            }, 0) / completedSpm.length
          : 0;

        return {
          id: opd.id,
          nama: opd.nama_opd,
          kode: opd.kode_opd,
          totalSpm,
          totalNilai,
          approvedSpm,
          approvalRate,
          avgDays,
        };
      });

      // Sort by selected metric
      const sorted = [...opdMetrics].sort((a, b) => {
        switch (metric) {
          case "total": return b.totalSpm - a.totalSpm;
          case "approved": return b.approvalRate - a.approvalRate;
          case "speed": return (a.avgDays || 999) - (b.avgDays || 999);
          default: return 0;
        }
      });

      const maxValue = Math.max(...sorted.map(o => 
        metric === "total" ? o.totalSpm : 
        metric === "approved" ? o.approvalRate : 
        (10 - Math.min(o.avgDays, 10))
      ), 1);

      return {
        rankings: sorted.slice(0, 10),
        maxValue,
        total: opdMetrics.length,
      };
    },
  });

  if (isLoading || parentLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const getMetricValue = (opd: any) => {
    switch (metric) {
      case "total": return opd.totalSpm;
      case "approved": return opd.approvalRate;
      case "speed": return opd.avgDays;
      default: return 0;
    }
  };

  const getMetricLabel = (opd: any) => {
    switch (metric) {
      case "total": return `${opd.totalSpm} SPM`;
      case "approved": return `${opd.approvalRate.toFixed(0)}%`;
      case "speed": return opd.avgDays > 0 ? `${opd.avgDays.toFixed(1)} hari` : "-";
      default: return "";
    }
  };

  const getProgressValue = (opd: any) => {
    switch (metric) {
      case "total": return (opd.totalSpm / (data?.maxValue || 1)) * 100;
      case "approved": return opd.approvalRate;
      case "speed": return opd.avgDays > 0 ? ((10 - Math.min(opd.avgDays, 10)) / 10) * 100 : 0;
      default: return 0;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-5 w-5 text-amber-500" />
            Perbandingan Antar OPD
          </CardTitle>
          <Select value={metric} onValueChange={(v) => setMetric(v as any)}>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="total">Total SPM</SelectItem>
              <SelectItem value="approved">Approval Rate</SelectItem>
              <SelectItem value="speed">Kecepatan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">
          Ranking {data?.total || 0} OPD bulan ini berdasarkan {
            metric === "total" ? "jumlah SPM" :
            metric === "approved" ? "tingkat persetujuan" :
            "kecepatan proses"
          }
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px]">
          <div className="space-y-3">
            {data?.rankings.map((opd, index) => {
              const RankIcon = RANK_ICONS[index] || Building2;
              const isTop3 = index < 3;
              
              return (
                <div
                  key={opd.id}
                  className={`p-3 rounded-lg border transition-all ${
                    isTop3 
                      ? 'bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div className={`
                      flex items-center justify-center w-8 h-8 rounded-full shrink-0
                      ${isTop3 
                        ? `bg-gradient-to-br ${RANK_COLORS[index]} text-white shadow-md` 
                        : 'bg-muted text-muted-foreground'
                      }
                    `}>
                      {isTop3 ? (
                        <RankIcon className="h-4 w-4" />
                      ) : (
                        <span className="text-sm font-bold">{index + 1}</span>
                      )}
                    </div>

                    {/* OPD Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{opd.nama}</span>
                        {isTop3 && (
                          <Badge variant="outline" className="text-xs shrink-0">
                            Top {index + 1}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <Progress 
                          value={getProgressValue(opd)} 
                          className={`flex-1 h-2 ${
                            metric === "speed" ? "[&>div]:bg-cyan-500" :
                            metric === "approved" ? "[&>div]:bg-green-500" :
                            ""
                          }`}
                        />
                        <span className="text-sm font-bold min-w-[60px] text-right">
                          {getMetricLabel(opd)}
                        </span>
                      </div>
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{formatCurrency(opd.totalNilai)}</span>
                        <span>•</span>
                        <span>{opd.approvedSpm} disetujui</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {data?.rankings.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Belum ada data OPD</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
