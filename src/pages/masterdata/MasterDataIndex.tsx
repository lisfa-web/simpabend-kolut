import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users2,
  FolderTree,
  Layers,
  ListTree,
  UserCog,
  FileText,
  Hash,
  Settings,
  MessageSquare,
} from "lucide-react";

interface MasterDataCard {
  title: string;
  description: string;
  icon: any;
  path: string;
  count?: number;
}

const masterDataList: MasterDataCard[] = [
  {
    title: "OPD",
    description: "Organisasi Perangkat Daerah",
    icon: Building2,
    path: "/masterdata/opd",
  },
  {
    title: "Vendor",
    description: "Data Vendor/Rekanan",
    icon: Users2,
    path: "/masterdata/vendor",
  },
  {
    title: "Program",
    description: "Program Kegiatan",
    icon: FolderTree,
    path: "/masterdata/program",
  },
  {
    title: "Kegiatan",
    description: "Data Kegiatan",
    icon: Layers,
    path: "/masterdata/kegiatan",
  },
  {
    title: "Sub Kegiatan",
    description: "Sub Kegiatan",
    icon: ListTree,
    path: "/masterdata/subkegiatan",
  },
  {
    title: "Pejabat",
    description: "Data Pejabat",
    icon: UserCog,
    path: "/masterdata/pejabat",
  },
  {
    title: "Template Surat",
    description: "Template Surat Resmi",
    icon: FileText,
    path: "/masterdata/template",
  },
  {
    title: "Format Nomor",
    description: "Format Penomoran Dokumen",
    icon: Hash,
    path: "/masterdata/format-nomor",
  },
  {
    title: "Konfigurasi Sistem",
    description: "Pengaturan Sistem",
    icon: Settings,
    path: "/masterdata/config",
  },
  {
    title: "WhatsApp Gateway",
    description: "Konfigurasi WhatsApp",
    icon: MessageSquare,
    path: "/masterdata/wa-gateway",
  },
];

const MasterDataIndex = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Master Data</h1>
          <p className="text-muted-foreground">
            Kelola seluruh data master sistem
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {masterDataList.map((item) => (
            <Card
              key={item.path}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(item.path)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  {item.title}
                </CardTitle>
                <item.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {item.description}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(item.path);
                  }}
                >
                  Kelola Data
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MasterDataIndex;
