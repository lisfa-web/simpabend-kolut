import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessTimelineData {
  resepsionis_to_pbmd: number;
  pbmd_to_akuntansi: number;
  akuntansi_to_perbendaharaan: number;
  perbendaharaan_to_kepala: number;
}

interface ProcessTimelineWidgetProps {
  data?: ProcessTimelineData;
  isLoading?: boolean;
}

const stages = [
  { key: "resepsionis_to_pbmd", label: "Resepsionis → PBMD" },
  { key: "pbmd_to_akuntansi", label: "PBMD → Akuntansi" },
  { key: "akuntansi_to_perbendaharaan", label: "Akuntansi → Perbendaharaan" },
  { key: "perbendaharaan_to_kepala", label: "Perbendaharaan → Kepala BKAD" },
];

const getColorClass = (days: number) => {
  if (days < 2) return { bg: "bg-green-500", text: "text-green-600", lightBg: "bg-green-50" };
  if (days <= 4) return { bg: "bg-yellow-500", text: "text-yellow-600", lightBg: "bg-yellow-50" };
  return { bg: "bg-red-500", text: "text-red-600", lightBg: "bg-red-50" };
};

export const ProcessTimelineWidget = ({ data, isLoading }: ProcessTimelineWidgetProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Waktu Proses Per Tahap
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const maxDays = data
    ? Math.max(
        data.resepsionis_to_pbmd,
        data.pbmd_to_akuntansi,
        data.akuntansi_to_perbendaharaan,
        data.perbendaharaan_to_kepala
      )
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Waktu Proses Per Tahap
        </CardTitle>
        <p className="text-sm text-muted-foreground">Rata-rata hari untuk setiap verifikasi</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {stages.map(({ key, label }) => {
          const days = data?.[key as keyof ProcessTimelineData] || 0;
          const percentage = maxDays > 0 ? (days / maxDays) * 100 : 0;
          const colors = getColorClass(days);

          return (
            <div key={key} className={cn("p-3 rounded-lg transition-all hover:shadow-sm", colors.lightBg)}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{label}</span>
                <span className={cn("text-sm font-bold", colors.text)}>
                  {days.toFixed(1)} hari
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className={cn("h-full transition-all duration-500 rounded-full", colors.bg)}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
        
        <div className="pt-3 border-t space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Cepat (&lt;2 hari)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-muted-foreground">Normal (2-4 hari)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-muted-foreground">Lambat (&gt;4 hari)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
