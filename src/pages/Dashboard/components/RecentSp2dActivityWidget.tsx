import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle2, XCircle, Clock, FileText, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";

interface Sp2dActivityItem {
  id: string;
  type: string;
  status: string;
  nomor_sp2d: string;
  user_name: string;
  timestamp: string;
  nilai_sp2d: number;
}

export const RecentSp2dActivityWidget = () => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["recent-sp2d-activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sp2d")
        .select(`
          id,
          nomor_sp2d,
          status,
          nilai_sp2d,
          updated_at,
          spm:spm_id(
            bendahara:profiles!bendahara_id(full_name)
          )
        `)
        .order("updated_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      return data?.map((item: any) => ({
        id: item.id,
        type: "sp2d",
        status: item.status,
        nomor_sp2d: item.nomor_sp2d || "Draft",
        user_name: item.spm?.bendahara?.full_name || "Unknown",
        timestamp: item.updated_at,
        nilai_sp2d: item.nilai_sp2d,
      })) as Sp2dActivityItem[];
    },
  });

  const getActivityIcon = (status: string) => {
    switch (status) {
      case "diterbitkan":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "cair":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "gagal":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "draft":
        return <FileText className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Clock className="w-4 h-4 text-orange-600" />;
    }
  };

  const getActivityBgColor = (status: string) => {
    switch (status) {
      case "diterbitkan":
        return "bg-green-50 hover:bg-green-100 border-green-200";
      case "cair":
        return "bg-green-50 hover:bg-green-100 border-green-200";
      case "gagal":
        return "bg-red-50 hover:bg-red-100 border-red-200";
      case "draft":
        return "bg-gray-50 hover:bg-gray-100 border-gray-200";
      default:
        return "bg-accent/50 hover:bg-accent";
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      draft: "Draft dibuat",
      diterbitkan: "Diterbitkan",
      cair: "Cair",
      gagal: "Gagal",
      verifikasi: "Verifikasi",
    };
    return statusMap[status] || status;
  };

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Aktivitas SP2D Terbaru
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
          Aktivitas SP2D Terbaru
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-3">
            {activities?.map((activity) => (
              <Link
                key={activity.id}
                to={`/sp2d/detail/${activity.id}`}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all hover:shadow-md cursor-pointer ${getActivityBgColor(activity.status)}`}
              >
                <div className="mt-0.5">{getActivityIcon(activity.status)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {activity.nomor_sp2d}
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
                  }).format(activity.nilai_sp2d)}
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
