import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatCurrency } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OpdBreakdownChartProps {
  data: Array<{
    nama_opd: string;
    total_spm: number;
    total_nilai: number;
  }>;
  isLoading: boolean;
}

const COLORS = [
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#f59e0b", // Amber
  "#10b981", // Green
];

const GRADIENT_COLORS = [
  { from: "#3b82f6", to: "#2563eb" }, // Blue gradient
  { from: "#8b5cf6", to: "#7c3aed" }, // Purple gradient
  { from: "#ec4899", to: "#db2777" }, // Pink gradient
  { from: "#f59e0b", to: "#d97706" }, // Amber gradient
  { from: "#10b981", to: "#059669" }, // Green gradient
];

export const OpdBreakdownChart = ({ data, isLoading }: OpdBreakdownChartProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Top 5 OPD
          </CardTitle>
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
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Top 5 OPD
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-2 opacity-20" />
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
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Top 5 OPD
          </div>
          <Badge variant="outline" className="gap-1">
            <TrendingUp className="w-3 h-3" />
            Berdasarkan Nilai
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">Total Nilai SPM (dalam Juta Rupiah)</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <defs>
              {GRADIENT_COLORS.map((gradient, index) => (
                <linearGradient key={index} id={`colorOpd${index}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="5%" stopColor={gradient.from} stopOpacity={0.9} />
                  <stop offset="95%" stopColor={gradient.to} stopOpacity={1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="nama" width={150} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: number) => `Rp ${value.toFixed(1)}M`}
              labelFormatter={(label) => {
                const item = data.find((d) => d.nama_opd.includes(label as string));
                return item?.nama_opd || label;
              }}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="nilai" name="Nilai (Juta Rupiah)" radius={[0, 8, 8, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`url(#colorOpd${index})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-6 space-y-3">
          {data.map((opd, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 rounded-lg transition-all hover:shadow-sm"
              style={{ 
                background: `linear-gradient(90deg, ${GRADIENT_COLORS[index].from}15 0%, transparent 100%)`,
                borderLeft: `3px solid ${COLORS[index]}`
              }}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: `linear-gradient(135deg, ${GRADIENT_COLORS[index].from}, ${GRADIENT_COLORS[index].to})` }}
                >
                  #{index + 1}
                </div>
                <span className="text-sm font-medium truncate">{opd.nama_opd}</span>
              </div>
              <div className="flex items-center gap-4 ml-4">
                <Badge variant="secondary" className="text-xs">
                  {opd.total_spm} SPM
                </Badge>
                <span className="text-sm font-bold" style={{ color: COLORS[index] }}>
                  {formatCurrency(opd.total_nilai)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
