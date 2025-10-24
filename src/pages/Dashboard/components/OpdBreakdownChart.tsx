import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";

interface OpdBreakdownChartProps {
  data: Array<{
    nama_opd: string;
    total_spm: number;
    total_nilai: number;
  }>;
  isLoading: boolean;
}

export const OpdBreakdownChart = ({ data, isLoading }: OpdBreakdownChartProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top 5 OPD</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top 5 OPD</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Tidak ada data OPD</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((opd) => ({
    nama: opd.nama_opd.length > 25 ? opd.nama_opd.substring(0, 25) + "..." : opd.nama_opd,
    nilai: opd.total_nilai / 1000000, // Convert to millions
    spm: opd.total_spm,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top 5 OPD (Total Nilai SPM)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="nama" width={150} />
            <Tooltip
              formatter={(value: number) => `Rp ${value.toFixed(1)}M`}
              labelFormatter={(label) => {
                const item = data.find((d) => d.nama_opd.includes(label as string));
                return item?.nama_opd || label;
              }}
            />
            <Bar dataKey="nilai" fill="hsl(var(--primary))" name="Nilai (Juta Rupiah)" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {data.map((opd, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{opd.nama_opd}</span>
              <div className="flex gap-4">
                <span className="font-medium">{opd.total_spm} SPM</span>
                <span className="font-bold text-primary">{formatCurrency(opd.total_nilai)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
