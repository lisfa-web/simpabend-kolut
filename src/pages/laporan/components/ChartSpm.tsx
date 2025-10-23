import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface ChartSpmProps {
  data: any[];
}

export const ChartSpm = ({ data }: ChartSpmProps) => {
  // Status distribution
  const statusData = data.reduce((acc: any[], item: any) => {
    const existing = acc.find((s) => s.status === item.status);
    if (existing) {
      existing.count += 1;
      existing.value += Number(item.nilai_spm || 0);
    } else {
      acc.push({
        status: item.status,
        count: 1,
        value: Number(item.nilai_spm || 0),
      });
    }
    return acc;
  }, []);

  // OPD distribution
  const opdData = data.reduce((acc: any[], item: any) => {
    const opdName = item.opd?.nama_opd || "Tidak Diketahui";
    const existing = acc.find((o) => o.name === opdName);
    if (existing) {
      existing.value += Number(item.nilai_spm || 0);
    } else {
      acc.push({
        name: opdName,
        value: Number(item.nilai_spm || 0),
      });
    }
    return acc;
  }, []);

  // Sort by value and take top 10
  const topOpdData = opdData.sort((a, b) => b.value - a.value).slice(0, 10);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Distribusi Status SPM</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nilai SPM per OPD (Top 10)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topOpdData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
