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
  Receipt,
  Link,
} from "lucide-react";

interface MasterDataCard {
  title: string;
  description: string;
  icon: any;
  path: string;
  count?: number;
  gradient: string;
  iconColor: string;
}

const masterDataList: MasterDataCard[] = [
  {
    title: "OPD",
    description: "Organisasi Perangkat Daerah",
    icon: Building2,
    path: "/masterdata/opd",
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-600",
  },
  {
    title: "Vendor",
    description: "Data Vendor/Rekanan",
    icon: Users2,
    path: "/masterdata/vendor",
    gradient: "from-purple-500/10 to-pink-500/10",
    iconColor: "text-purple-600",
  },
  {
    title: "Program",
    description: "Program Kegiatan",
    icon: FolderTree,
    path: "/masterdata/program",
    gradient: "from-green-500/10 to-emerald-500/10",
    iconColor: "text-green-600",
  },
  {
    title: "Kegiatan",
    description: "Data Kegiatan",
    icon: Layers,
    path: "/masterdata/kegiatan",
    gradient: "from-orange-500/10 to-amber-500/10",
    iconColor: "text-orange-600",
  },
  {
    title: "Sub Kegiatan",
    description: "Sub Kegiatan",
    icon: ListTree,
    path: "/masterdata/subkegiatan",
    gradient: "from-rose-500/10 to-red-500/10",
    iconColor: "text-rose-600",
  },
  {
    title: "Pejabat",
    description: "Data Pejabat",
    icon: UserCog,
    path: "/masterdata/pejabat",
    gradient: "from-indigo-500/10 to-violet-500/10",
    iconColor: "text-indigo-600",
  },
  {
    title: "Master Pajak",
    description: "Kelola data pajak (PPh, PPN) dan tarifnya",
    icon: Receipt,
    path: "/masterdata/pajak",
    gradient: "from-yellow-500/10 to-amber-500/10",
    iconColor: "text-yellow-600",
  },
  {
    title: "Mapping Pajak SPM",
    description: "Kelola mapping pajak untuk setiap jenis SPM",
    icon: Link,
    path: "/masterdata/pajak/mapping",
    gradient: "from-teal-500/10 to-cyan-500/10",
    iconColor: "text-teal-600",
  },
];

const MasterDataIndex = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-lg border">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Master Data
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola seluruh data master sistem dengan mudah
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {masterDataList.map((item) => (
            <Card
              key={item.path}
              className={`group relative overflow-hidden bg-gradient-to-br ${item.gradient} hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/20 hover:scale-[1.02]`}
              onClick={() => navigate(item.path)}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-lg font-semibold">
                  {item.title}
                </CardTitle>
                <div className={`p-3 rounded-xl bg-white/50 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">
                  {item.description}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(item.path);
                  }}
                >
                  Kelola Data →
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
