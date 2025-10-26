import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Calendar } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface DailySubmission {
  date: string;
  count: number;
}

interface SubmissionTrendWidgetProps {
  data?: DailySubmission[];
  isLoading?: boolean;
}

export const SubmissionTrendWidget = ({ data, isLoading }: SubmissionTrendWidgetProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trend Pengajuan SPM
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const totalSubmissions = data?.reduce((sum, d) => sum + d.count, 0) || 0;
  const avgPerDay = data && data.length > 0 ? totalSubmissions / data.length : 0;
  const peakDay = data?.reduce((max, d) => (d.count > max.count ? d : max), data[0]);

  const chartData = data?.map(d => ({
    date: format(new Date(d.date), "dd MMM", { locale: localeId }),
    count: d.count,
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Trend Pengajuan SPM
        </CardTitle>
        <p className="text-sm text-muted-foreground">Pola pengajuan 30 hari terakhir</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Rata-rata/Hari</div>
            <div className="text-2xl font-bold text-primary">{avgPerDay.toFixed(1)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Hari Tertinggi</div>
            <div className="text-2xl font-bold text-orange-600">{peakDay?.count || 0}</div>
            {peakDay && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(peakDay.date), "dd MMM yyyy", { locale: localeId })}
              </div>
            )}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorCount)"
              name="Pengajuan"
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="pt-3 border-t">
          <div className="text-xs text-muted-foreground">
            Total {totalSubmissions} pengajuan dalam 30 hari terakhir
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
