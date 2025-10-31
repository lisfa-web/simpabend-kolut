import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PeriodData {
  current: {
    submitted: number;
    approved: number;
    revised: number;
    avgProcessDays: number;
    totalValue: number;
  };
  previous: {
    submitted: number;
    approved: number;
    revised: number;
    avgProcessDays: number;
    totalValue: number;
  };
}

interface PeriodComparisonWidgetProps {
  weeklyData?: PeriodData;
  monthlyData?: PeriodData;
  isLoading?: boolean;
}

const MetricCard = ({ 
  label, 
  current, 
  previous, 
  format = "number",
  inverse = false 
}: { 
  label: string; 
  current: number; 
  previous: number; 
  format?: "number" | "currency" | "days";
  inverse?: boolean;
}) => {
  const diff = current - previous;
  const percentChange = previous !== 0 ? (diff / previous) * 100 : 0;
  const isPositive = inverse ? diff < 0 : diff > 0;
  const isNeutral = diff === 0;

  const formatValue = (value: number) => {
    if (format === "currency") {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value);
    }
    if (format === "days") {
      return `${value.toFixed(1)} hari`;
    }
    return value.toString();
  };

  return (
    <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-all">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          {isNeutral ? (
            <Badge variant="outline" className="gap-1">
              <Minus className="w-3 h-3" />
              0%
            </Badge>
          ) : (
            <Badge 
              variant={isPositive ? "default" : "destructive"}
              className={isPositive ? "bg-green-500 gap-1" : "gap-1"}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(percentChange).toFixed(1)}%
            </Badge>
          )}
        </div>
        
        <div>
          <div className="text-2xl font-bold">{formatValue(current)}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">vs periode lalu:</span>
            <span className="text-xs font-medium">{formatValue(previous)}</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="text-xs">
            {isNeutral ? (
              <span className="text-muted-foreground">Tidak ada perubahan</span>
            ) : (
              <>
                <span className={isPositive ? "text-green-600" : "text-red-600"}>
                  {isPositive ? "↑" : "↓"} {Math.abs(diff).toFixed(format === "days" ? 1 : 0)}
                </span>
                <span className="text-muted-foreground ml-1">
                  {format === "currency" ? formatValue(Math.abs(diff)) : ""}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PeriodComparisonWidget = ({ weeklyData, monthlyData, isLoading }: PeriodComparisonWidgetProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Perbandingan Periode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Perbandingan Periode
        </CardTitle>
        <p className="text-sm text-muted-foreground">Tracking performa periode ini vs periode sebelumnya</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Mingguan</TabsTrigger>
            <TabsTrigger value="monthly">Bulanan</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-4">
            {weeklyData ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium">Minggu Ini vs Minggu Lalu</p>
                    <p className="text-xs text-muted-foreground">7 hari terakhir dibandingkan dengan 7 hari sebelumnya</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <MetricCard 
                    label="Total Pengajuan"
                    current={weeklyData.current.submitted}
                    previous={weeklyData.previous.submitted}
                  />
                  <MetricCard 
                    label="Total Disetujui"
                    current={weeklyData.current.approved}
                    previous={weeklyData.previous.approved}
                  />
                  <MetricCard 
                    label="Total Revisi"
                    current={weeklyData.current.revised}
                    previous={weeklyData.previous.revised}
                    inverse={true}
                  />
                  <MetricCard 
                    label="Rata-rata Proses"
                    current={weeklyData.current.avgProcessDays}
                    previous={weeklyData.previous.avgProcessDays}
                    format="days"
                    inverse={true}
                  />
                  <MetricCard 
                    label="Total Nilai SPM"
                    current={weeklyData.current.totalValue}
                    previous={weeklyData.previous.totalValue}
                    format="currency"
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Data mingguan tidak tersedia</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            {monthlyData ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium">Bulan Ini vs Bulan Lalu</p>
                    <p className="text-xs text-muted-foreground">30 hari terakhir dibandingkan dengan 30 hari sebelumnya</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <MetricCard 
                    label="Total Pengajuan"
                    current={monthlyData.current.submitted}
                    previous={monthlyData.previous.submitted}
                  />
                  <MetricCard 
                    label="Total Disetujui"
                    current={monthlyData.current.approved}
                    previous={monthlyData.previous.approved}
                  />
                  <MetricCard 
                    label="Total Revisi"
                    current={monthlyData.current.revised}
                    previous={monthlyData.previous.revised}
                    inverse={true}
                  />
                  <MetricCard 
                    label="Rata-rata Proses"
                    current={monthlyData.current.avgProcessDays}
                    previous={monthlyData.previous.avgProcessDays}
                    format="days"
                    inverse={true}
                  />
                  <MetricCard 
                    label="Total Nilai SPM"
                    current={monthlyData.current.totalValue}
                    previous={monthlyData.previous.totalValue}
                    format="currency"
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Data bulanan tidak tersedia</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
