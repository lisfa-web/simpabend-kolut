import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle2, XCircle, Clock, FileText, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";

interface ActivityItem {
  id: string;
  type: string;
  status: string;
  nomor_spm: string;
  user_name: string;
  timestamp: string;
  nilai_spm: number;
}

export const RecentActivityWidget = () => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spm")
        .select(`
          id,
          nomor_spm,
          status,
          nilai_spm,
          updated_at,
          bendahara:profiles!bendahara_id(full_name)
        `)
        .order("updated_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      return data?.map((item: any) => ({
        id: item.id,
        type: "spm",
        status: item.status,
        nomor_spm: item.nomor_spm || "Draft",
        user_name: item.bendahara?.full_name || "Unknown",
        timestamp: item.updated_at,
        nilai_spm: item.nilai_spm,
      })) as ActivityItem[];
    },
  });

  const getActivityIcon = (status: string) => {
    switch (status) {
      case "disetujui":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "perlu_revisi":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "draft":
        return <FileText className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Clock className="w-4 h-4 text-orange-600" />;
    }
  };

  const getActivityBgColor = (status: string) => {
    switch (status) {
      case "disetujui":
        return "bg-green-50 hover:bg-green-100 border-green-200";
      case "perlu_revisi":
        return "bg-yellow-50 hover:bg-yellow-100 border-yellow-200";
      case "draft":
        return "bg-gray-50 hover:bg-gray-100 border-gray-200";
      default:
        return "bg-accent/50 hover:bg-accent";
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      draft: "Draft dibuat",
      diajukan: "Diajukan",
      resepsionis_verifikasi: "Verifikasi Resepsionis",
      pbmd_verifikasi: "Verifikasi PBMD",
      akuntansi_validasi: "Validasi Akuntansi",
      perbendaharaan_verifikasi: "Verifikasi Perbendaharaan",
      kepala_bkad_review: "Review Kepala BKAD",
      disetujui: "Disetujui",
      perlu_revisi: "Perlu Revisi",
    };
    return statusMap[status] || status;
  };

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Aktivitas SPM Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Aktivitas SPM Terbaru
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {activities?.map((activity) => (
              <Link
                key={activity.id}
                to={`/input-spm/timeline/${activity.id}`}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all hover:shadow-md cursor-pointer ${getActivityBgColor(activity.status)}`}
              >
                <div className="mt-0.5">{getActivityIcon(activity.status)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {activity.nomor_spm}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getStatusText(activity.status)} • {activity.user_name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                      locale: id,
                    })}
                  </p>
                </div>
                <div className="text-xs font-medium text-right">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(activity.nilai_spm)}
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
