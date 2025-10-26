import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, TrendingUp, TrendingDown } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface SuccessMetrics {
  successRate: number;
  rejectionRate: number;
  revisionRate: number;
  trendVsLastMonth: number;
}

interface SuccessRateWidgetProps {
  data?: SuccessMetrics;
  isLoading?: boolean;
}

const COLORS = {
  success: "#22c55e",
  rejection: "#ef4444",
  revision: "#f59e0b",
};

export const SuccessRateWidget = ({ data, isLoading }: SuccessRateWidgetProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Tingkat Keberhasilan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { name: "Disetujui", value: data?.successRate || 0, color: COLORS.success },
    { name: "Ditolak", value: data?.rejectionRate || 0, color: COLORS.rejection },
    { name: "Revisi", value: data?.revisionRate || 0, color: COLORS.revision },
  ];

  const successRate = data?.successRate || 0;
  const trend = data?.trendVsLastMonth || 0;
  const isPositiveTrend = trend >= 0;

  const getRateColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Tingkat Keberhasilan
        </CardTitle>
        <p className="text-sm text-muted-foreground">Persentase approval vs rejection</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="relative">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`text-3xl font-bold ${getRateColor(successRate)}`}>
                {successRate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="text-lg font-bold text-green-600">
              {data?.successRate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Disetujui</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
            </div>
            <div className="text-lg font-bold text-red-600">
              {data?.rejectionRate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Ditolak</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
            </div>
            <div className="text-lg font-bold text-yellow-600">
              {data?.revisionRate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Revisi</div>
          </div>
        </div>

        <div className="pt-3 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Trend vs Bulan Lalu</span>
            <div className={`flex items-center gap-1 ${isPositiveTrend ? "text-green-600" : "text-red-600"}`}>
              {isPositiveTrend ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="text-sm font-semibold">
                {isPositiveTrend ? "+" : ""}{trend.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
