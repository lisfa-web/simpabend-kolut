import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileArchive, FileText } from "lucide-react";

interface ArsipCard {
  title: string;
  description: string;
  icon: any;
  path: string;
  gradient: string;
  iconColor: string;
}

const arsipList: ArsipCard[] = [
  {
    title: "Arsip SPM",
    description: "Arsip dokumen SPM yang telah disetujui",
    icon: FileText,
    path: "/arsip/spm",
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-600",
  },
  {
    title: "Arsip SP2D",
    description: "Arsip dokumen SP2D yang telah diterbitkan",
    icon: FileArchive,
    path: "/arsip/sp2d",
    gradient: "from-purple-500/10 to-pink-500/10",
    iconColor: "text-purple-600",
  },
];

const ArsipIndex = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-lg border">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Arsip Dokumen
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola arsip dokumen SPM dan SP2D
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {arsipList.map((item) => (
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
                  Lihat Arsip →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ArsipIndex;
