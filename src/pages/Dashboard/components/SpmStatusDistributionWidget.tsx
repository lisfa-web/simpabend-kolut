import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SpmStatusDistributionWidgetProps {
  isLoading?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  diajukan: "Diajukan",
  resepsionis_verifikasi: "Verifikasi Resepsionis",
  pbmd_verifikasi: "Verifikasi PBMD",
  akuntansi_verifikasi: "Verifikasi Akuntansi",
  perbendaharaan_verifikasi: "Verifikasi Perbendaharaan",
  kepala_bkad_review: "Review Kepala BKAD",
  disetujui: "Disetujui",
  perlu_revisi: "Perlu Revisi",
  ditolak: "Ditolak",
};

const COLORS = [
  'hsl(217, 91%, 60%)',  // draft - blue
  'hsl(142, 71%, 45%)',  // disetujui - green
  'hsl(38, 92%, 50%)',   // diajukan - orange
  'hsl(0, 84%, 60%)',    // kepala_bkad_review - red
  'hsl(262, 83%, 58%)',  // perlu_revisi - purple
  'hsl(199, 89%, 48%)',  // resepsionis_verifikasi - cyan
];

export const SpmStatusDistributionWidget = ({ isLoading: parentLoading }: SpmStatusDistributionWidgetProps) => {
  // Fetch SPM status distribution
  const { data: statusData, isLoading } = useQuery({
    queryKey: ["spm-status-distribution"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spm")
        .select("status")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group by status
      const grouped = data.reduce((acc: Record<string, number>, item) => {
        const status = item.status || "draft";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(grouped).map(([status, count]) => ({
        status,
        count,
      }));
    },
  });
  if (isLoading || parentLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribusi Status SPM</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <Skeleton className="h-[250px] w-[250px] rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = statusData || [];

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribusi Status SPM</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Tidak ada data untuk ditampilkan
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribusi Status SPM</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ status, count }) => `${STATUS_LABELS[status] || status}: ${count}`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name: string) => [value, STATUS_LABELS[name] || name]}
            />
            <Legend 
              formatter={(value: string) => STATUS_LABELS[value] || value}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
