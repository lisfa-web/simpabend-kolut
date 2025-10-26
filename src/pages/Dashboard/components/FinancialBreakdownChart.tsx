import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface FinancialBreakdownProps {
  data?: Array<{
    jenis_spm: string;
    total_spm: number;
    total_nilai: number;
  }>;
  isLoading?: boolean;
}

const JENIS_SPM_LABELS: Record<string, string> = {
  ls: "Langsung (LS)",
  gu: "Ganti Uang (GU)",
  tu: "Tambah Uang (TU)",
};

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"];

export const FinancialBreakdownChart = ({ data, isLoading }: FinancialBreakdownProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Breakdown Jenis SPM
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data?.map((item) => ({
    name: JENIS_SPM_LABELS[item.jenis_spm] || item.jenis_spm.toUpperCase(),
    value: item.total_nilai,
    count: item.total_spm,
  })) || [];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm">{data.name}</p>
          <p className="text-xs text-muted-foreground">
            {data.count} SPM
          </p>
          <p className="text-sm font-medium">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
            }).format(data.value)}
          </p>
          <p className="text-xs text-muted-foreground">
            {((data.value / total) * 100).toFixed(1)}% dari total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Breakdown Jenis SPM
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {chartData.map((item, index) => (
                <div key={index} className="text-center">
                  <div
                    className="w-3 h-3 rounded-full mx-auto mb-1"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <p className="text-xs font-medium">{item.count} SPM</p>
                  <p className="text-xs text-muted-foreground">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(item.value)}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Tidak ada data untuk ditampilkan
          </div>
        )}
      </CardContent>
    </Card>
  );
};
