import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sun, Moon, CloudSun, 
  AlertTriangle, Clock, CheckCircle, 
  ArrowRight, FileText, Banknote,
  TrendingUp, TrendingDown, Minus
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { formatCurrency } from "@/lib/currency";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface DailyBriefingWidgetProps {
  isLoading?: boolean;
  opdFilter?: string;
}

export const DailyBriefingWidget = ({ isLoading: parentLoading, opdFilter }: DailyBriefingWidgetProps) => {
  const { user } = useAuth();
  const { hasRole, isAdmin } = useUserRole();

  const { data: briefingData, isLoading } = useQuery({
    queryKey: ["daily-briefing", user?.id, opdFilter],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      // SPM yang perlu ditindaklanjuti hari ini
      let pendingSpmQuery = supabase
        .from("spm")
        .select("id, nomor_spm, status, nilai_spm, updated_at, opd_id, opd:opd_id(nama_opd)")
        .neq("status", "draft")
        .neq("status", "disetujui")
        .order("updated_at", { ascending: true })
        .limit(5);

      if (opdFilter && opdFilter !== "all") {
        pendingSpmQuery = pendingSpmQuery.eq("opd_id", opdFilter);
      }

      const { data: pendingSpm } = await pendingSpmQuery;

      // SPM baru hari ini
      let newSpmQuery = supabase
        .from("spm")
        .select("*", { count: "exact" })
        .gte("created_at", todayISO)
        .neq("status", "draft");

      if (opdFilter && opdFilter !== "all") {
        newSpmQuery = newSpmQuery.eq("opd_id", opdFilter);
      }

      const { data: newSpmToday, count: newSpmCount } = await newSpmQuery;

      // SPM disetujui hari ini
      let approvedQuery = supabase
        .from("spm")
        .select("*", { count: "exact" })
        .eq("status", "disetujui")
        .gte("tanggal_disetujui", todayISO);

      if (opdFilter && opdFilter !== "all") {
        approvedQuery = approvedQuery.eq("opd_id", opdFilter);
      }

      const { data: approvedToday, count: approvedCount } = await approvedQuery;

      // SP2D yang perlu tindakan - need to filter via SPM join
      const { data: pendingSp2dRaw } = await supabase
        .from("sp2d")
        .select("*, spm:spm_id(opd_id)")
        .in("status", ["diterbitkan", "diuji_bank"]);

      const pendingSp2dFiltered = opdFilter && opdFilter !== "all"
        ? pendingSp2dRaw?.filter((sp2d: any) => sp2d.spm?.opd_id === opdFilter)
        : pendingSp2dRaw;
      
      const pendingSp2dCount = pendingSp2dFiltered?.length || 0;

      // SPM stuck lebih dari 3 hari
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      let stuckSpmQuery = supabase
        .from("spm")
        .select("*", { count: "exact" })
        .neq("status", "draft")
        .neq("status", "disetujui")
        .neq("status", "perlu_revisi")
        .lt("updated_at", threeDaysAgo.toISOString());

      if (opdFilter && opdFilter !== "all") {
        stuckSpmQuery = stuckSpmQuery.eq("opd_id", opdFilter);
      }

      const { data: stuckSpm, count: stuckCount } = await stuckSpmQuery;

      // Total nilai SPM dalam proses
      const totalPendingValue = pendingSpm?.reduce((sum, spm) => sum + Number(spm.nilai_spm || 0), 0) || 0;

      return {
        pendingSpm: pendingSpm || [],
        newSpmCount: newSpmCount || 0,
        approvedCount: approvedCount || 0,
        pendingSp2dCount: pendingSp2dCount || 0,
        stuckCount: stuckCount || 0,
        totalPendingValue,
      };
    },
    enabled: !!user,
    refetchInterval: 60000, // Refresh setiap 1 menit
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Selamat Pagi", icon: Sun, color: "text-amber-500" };
    if (hour < 15) return { text: "Selamat Siang", icon: CloudSun, color: "text-orange-500" };
    if (hour < 18) return { text: "Selamat Sore", icon: CloudSun, color: "text-orange-600" };
    return { text: "Selamat Malam", icon: Moon, color: "text-indigo-500" };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  if (isLoading || parentLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resepsionis_verifikasi": return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "pbmd_verifikasi": return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
      case "akuntansi_validasi": return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300";
      case "perbendaharaan_verifikasi": return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300";
      case "kepala_bkad_review": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300";
      case "perlu_revisi": return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      "resepsionis_verifikasi": "Resepsionis",
      "pbmd_verifikasi": "PBMD",
      "akuntansi_validasi": "Akuntansi",
      "perbendaharaan_verifikasi": "Perbendaharaan",
      "kepala_bkad_review": "Kepala BKAD",
      "perlu_revisi": "Revisi",
      "diajukan": "Diajukan",
    };
    return labels[status] || status;
  };

  return (
    <Card className="h-full bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <GreetingIcon className={`h-5 w-5 ${greeting.color}`} />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {greeting.text}
          </span>
          <span className="text-sm font-normal text-muted-foreground ml-auto">
            {format(new Date(), "EEEE, dd MMMM yyyy", { locale: localeId })}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
            <FileText className="h-4 w-4 text-blue-600" />
            <div>
              <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{briefingData?.newSpmCount || 0}</div>
              <div className="text-xs text-blue-600 dark:text-blue-400">SPM Baru Hari Ini</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div>
              <div className="text-lg font-bold text-green-700 dark:text-green-300">{briefingData?.approvedCount || 0}</div>
              <div className="text-xs text-green-600 dark:text-green-400">Disetujui Hari Ini</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
            <Banknote className="h-4 w-4 text-amber-600" />
            <div>
              <div className="text-lg font-bold text-amber-700 dark:text-amber-300">{briefingData?.pendingSp2dCount || 0}</div>
              <div className="text-xs text-amber-600 dark:text-amber-400">SP2D Pending</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <div>
              <div className="text-lg font-bold text-red-700 dark:text-red-300">{briefingData?.stuckCount || 0}</div>
              <div className="text-xs text-red-600 dark:text-red-400">SPM Tertunda</div>
            </div>
          </div>
        </div>

        {/* Total Nilai Pending */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border">
          <div className="text-sm text-muted-foreground">Total Nilai SPM Dalam Proses</div>
          <div className="text-xl font-bold text-primary">{formatCurrency(briefingData?.totalPendingValue || 0)}</div>
        </div>

        {/* SPM Perlu Tindakan */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              SPM Perlu Ditindaklanjuti
            </h4>
            <Link to="/spm/list">
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                Lihat Semua <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
          <ScrollArea className="h-[140px]">
            <div className="space-y-2">
              {briefingData?.pendingSpm.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  Tidak ada SPM yang perlu ditindaklanjuti
                </div>
              ) : (
                briefingData?.pendingSpm.map((spm: any) => (
                  <Link
                    key={spm.id}
                    to={`/spm/timeline/${spm.id}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge className={`text-xs ${getStatusColor(spm.status)}`}>
                        {getStatusLabel(spm.status)}
                      </Badge>
                      <span className="text-sm font-medium truncate">{spm.nomor_spm || "Draft"}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(spm.nilai_spm)}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};
