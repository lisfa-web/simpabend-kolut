import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BottleneckData {
  stage: string;
  avgDays: number;
  count: number;
  slaTarget: number;
}

interface BottleneckAnalysisWidgetProps {
  data?: BottleneckData[];
  isLoading?: boolean;
}

const getSeverityColor = (avgDays: number, slaTarget: number) => {
  const ratio = avgDays / slaTarget;
  if (ratio >= 1.5) return { bg: "bg-red-500", text: "text-red-600", light: "bg-red-50", border: "border-red-200" };
  if (ratio >= 1.0) return { bg: "bg-orange-500", text: "text-orange-600", light: "bg-orange-50", border: "border-orange-200" };
  return { bg: "bg-green-500", text: "text-green-600", light: "bg-green-50", border: "border-green-200" };
};

export const BottleneckAnalysisWidget = ({ data, isLoading }: BottleneckAnalysisWidgetProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Bottleneck Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Bottleneck Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Tidak ada data bottleneck</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort by severity (highest ratio first)
  const sortedData = [...data].sort((a, b) => (b.avgDays / b.slaTarget) - (a.avgDays / a.slaTarget));
  const maxDays = Math.max(...data.map(d => d.avgDays));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Bottleneck Analysis
          </div>
          <Badge variant="outline" className="gap-1">
            <TrendingDown className="w-3 h-3" />
            SLA Target: 2 hari
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">Identifikasi tahap verifikasi yang paling lambat</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedData.map((stage, index) => {
          const colors = getSeverityColor(stage.avgDays, stage.slaTarget);
          const percentage = (stage.avgDays / maxDays) * 100;
          const ratio = stage.avgDays / stage.slaTarget;
          const isBottleneck = ratio >= 1.0;

          return (
            <div
              key={stage.stage}
              className={cn(
                "relative overflow-hidden rounded-lg p-4 transition-all hover:shadow-md border-2",
                colors.light,
                colors.border,
                isBottleneck && "ring-2 ring-offset-2 ring-orange-500"
              )}
            >
              {isBottleneck && (
                <div className="absolute top-2 right-2">
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Bottleneck!
                  </Badge>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold",
                        colors.bg
                      )}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{stage.stage}</p>
                      <p className="text-xs text-muted-foreground">{stage.count} SPM diproses</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-2xl font-bold", colors.text)}>
                      {stage.avgDays.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">hari rata-rata</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress vs Target</span>
                    <span className={cn("font-semibold", colors.text)}>
                      {ratio >= 1 ? `+${((ratio - 1) * 100).toFixed(0)}%` : `${((1 - ratio) * 100).toFixed(0)}%`}
                    </span>
                  </div>
                  <div className="relative h-3 bg-white rounded-full overflow-hidden shadow-inner">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", colors.bg)}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                    {/* SLA Target marker */}
                    <div
                      className="absolute top-0 h-full w-0.5 bg-gray-400"
                      style={{ left: `${(stage.slaTarget / maxDays) * 100}%` }}
                    >
                      <div className="absolute -top-1 -left-3 text-xs text-gray-500 font-semibold">
                        SLA
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">Status</span>
                  {ratio >= 1.5 ? (
                    <Badge variant="destructive" className="text-xs">Sangat Lambat</Badge>
                  ) : ratio >= 1.0 ? (
                    <Badge variant="destructive" className="text-xs bg-orange-500">Melebihi SLA</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Sesuai Target</Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
