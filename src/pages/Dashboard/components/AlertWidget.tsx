import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface AlertWidgetProps {
  data?: {
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
  isLoading?: boolean;
}

export const AlertWidget = ({ data, isLoading }: AlertWidgetProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Alert & Peringatan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalAlerts = (data?.stuckSpm.length || 0) + (data?.outlierSpm.length || 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Alert & Peringatan
          {totalAlerts > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {totalAlerts}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {/* Stuck SPM Alerts */}
            {data?.stuckSpm.map((spm) => (
              <div
                key={spm.id}
                className="p-3 rounded-lg border border-warning/50 bg-warning/10"
              >
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-warning mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">SPM Tertunda</p>
                    <p className="text-xs text-muted-foreground">
                      {spm.nomor_spm || "Draft"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {spm.days_stuck} hari
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          notation: "compact",
                        }).format(spm.nilai_spm)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Outlier SPM Alerts */}
            {data?.outlierSpm.map((spm) => (
              <div
                key={spm.id}
                className="p-3 rounded-lg border border-chart-3/50 bg-chart-3/10"
              >
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-chart-3 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Nilai Tidak Wajar</p>
                    <p className="text-xs text-muted-foreground">
                      {spm.nomor_spm || "Draft"}
                    </p>
                    <p className="text-xs font-medium mt-1">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(spm.nilai_spm)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Nilai jauh di atas rata-rata
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {totalAlerts === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Tidak ada alert saat ini</p>
                <p className="text-xs mt-1">Semua SPM berjalan normal</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
