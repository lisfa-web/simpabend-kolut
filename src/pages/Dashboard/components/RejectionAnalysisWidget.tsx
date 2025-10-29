import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileEdit, TrendingDown, AlertCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Badge } from "@/components/ui/badge";

interface RevisionReason {
  stage: string;
  count: number;
  percentage: number;
}

interface RejectionAnalysisWidgetProps {
  data?: {
    totalRejected: number;
    byStage: RevisionReason[];
    trendVsLastMonth: number;
  };
  isLoading?: boolean;
}

const STAGE_COLORS = {
  "Resepsionis": "#ef4444",
  "PBMD": "#f97316", 
  "Akuntansi": "#f59e0b",
  "Perbendaharaan": "#eab308",
  "Kepala BKAD": "#84cc16",
};

const STAGE_LABELS: Record<string, string> = {
  "resepsionis_verifikasi": "Resepsionis",
  "pbmd_verifikasi": "PBMD",
  "akuntansi_validasi": "Akuntansi",
  "perbendaharaan_verifikasi": "Perbendaharaan",
  "kepala_bkad_review": "Kepala BKAD",
};

export const RejectionAnalysisWidget = ({ data, isLoading }: RejectionAnalysisWidgetProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileEdit className="w-5 h-5" />
            Analisis Revisi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.byStage.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileEdit className="w-5 h-5" />
            Analisis Revisi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileEdit className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Tidak ada data revisi</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.byStage.map(item => ({
    name: item.stage,
    value: item.count,
    percentage: item.percentage,
  }));

  const isPositiveTrend = data.trendVsLastMonth < 0; // Negative trend is good for revisions

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileEdit className="w-5 h-5 text-orange-600" />
            Analisis Revisi SPM
          </div>
          <Badge 
            variant={isPositiveTrend ? "default" : "destructive"}
            className={isPositiveTrend ? "bg-green-500 gap-1" : "gap-1"}
          >
            {isPositiveTrend ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <AlertCircle className="w-3 h-3" />
            )}
            {Math.abs(data.trendVsLastMonth).toFixed(1)}% vs bulan lalu
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">Distribusi revisi per tahap verifikasi</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Pie Chart */}
          <div className="flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage }) => `${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={STAGE_COLORS[entry.name as keyof typeof STAGE_COLORS] || "#94a3b8"} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} SPM`, "Total"]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Total Revisions */}
            <div className="text-center mt-4">
              <div className="text-3xl font-bold text-orange-600">{data.totalRejected}</div>
              <div className="text-sm text-muted-foreground">Total Revisi</div>
            </div>
          </div>

          {/* List breakdown */}
          <div className="space-y-3">
            <p className="text-sm font-semibold mb-4">Breakdown per Tahap:</p>
            {data.byStage.map((item, index) => {
              const color = STAGE_COLORS[item.stage as keyof typeof STAGE_COLORS] || "#94a3b8";
              
              return (
                <div
                  key={item.stage}
                  className="p-3 rounded-lg border-l-4 hover:shadow-sm transition-all"
                  style={{ 
                    borderLeftColor: color,
                    backgroundColor: `${color}10`
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-medium text-sm">{item.stage}</span>
                    </div>
                    <Badge variant="outline" style={{ borderColor: color, color }}>
                      {item.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {item.count} SPM perlu revisi
                    </span>
                    <div className="flex items-center gap-1">
                      {index === 0 && (
                        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 border-orange-300">
                          Tertinggi
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Mini progress bar */}
                  <div className="mt-2 h-1.5 bg-white rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: color
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Summary card */}
            <div className="mt-4 p-3 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold">Rekomendasi</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {data.byStage[0] && (
                  <>
                    Fokus improvement pada tahap <span className="font-semibold">{data.byStage[0].stage}</span> yang memiliki tingkat revisi tertinggi ({data.byStage[0].percentage.toFixed(1)}%).
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
