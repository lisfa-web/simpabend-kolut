import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

interface ChartSp2dProps {
  data: any[];
}

export const ChartSp2d = ({ data }: ChartSp2dProps) => {
  // Monthly trend
  const monthlyData = data.reduce((acc: any[], item: any) => {
    if (!item.tanggal_sp2d) return acc;
    
    const month = format(parseISO(item.tanggal_sp2d), "MMM yyyy", { locale: id });
    const existing = acc.find((m) => m.month === month);
    const value = Number(item.nilai_sp2d || 0);
    
    if (existing) {
      existing.value += value;
      existing.count += 1;
    } else {
      acc.push({
        month,
        value,
        count: 1,
      });
    }
    return acc;
  }, []);

  // OPD distribution
  const opdData = data.reduce((acc: any[], item: any) => {
    const opdName = item.spm?.opd?.nama_opd || "Tidak Diketahui";
    const existing = acc.find((o) => o.name === opdName);
    const value = Number(item.nilai_sp2d || 0);
    
    if (existing) {
      existing.value += value;
    } else {
      acc.push({
        name: opdName,
        value,
      });
    }
    return acc;
  }, []);

  // Sort by value and take top 10
  const topOpdData = opdData.sort((a, b) => b.value - a.value).slice(0, 10);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Trend Pencairan Bulanan</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pencairan per OPD (Top 10)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topOpdData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
