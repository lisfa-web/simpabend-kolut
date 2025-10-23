import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FileSpreadsheet, CheckSquare, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LaporanIndex = () => {
  const navigate = useNavigate();

  const laporanItems = [
    {
      title: "Laporan SPM",
      description: "Rekapitulasi SPM berdasarkan status, OPD, dan periode",
      icon: FileText,
      path: "/laporan/spm",
      color: "text-blue-500",
    },
    {
      title: "Laporan SP2D",
      description: "Rekapitulasi pencairan dana SP2D",
      icon: FileSpreadsheet,
      path: "/laporan/sp2d",
      color: "text-green-500",
    },
    {
      title: "Laporan Verifikasi",
      description: "Progress verifikasi per tahap",
      icon: CheckSquare,
      path: "/laporan/verifikasi",
      color: "text-orange-500",
    },
    {
      title: "Laporan Keuangan",
      description: "Ringkasan nilai per OPD dan Program",
      icon: DollarSign,
      path: "/laporan/keuangan",
      color: "text-purple-500",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Laporan</h1>
          <p className="text-muted-foreground">
            Pilih jenis laporan yang ingin Anda lihat
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {laporanItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.path}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(item.path)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${item.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Klik untuk melihat laporan detail
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LaporanIndex;
