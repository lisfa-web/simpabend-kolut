import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTemplateSuratList } from "@/hooks/useTemplateSuratList";
import { usePejabatList } from "@/hooks/usePejabatList";

export default function SuratIndex() {
  const navigate = useNavigate();
  const { data: templates = [] } = useTemplateSuratList({ is_active: true });
  const { data: pejabat = [] } = usePejabatList({ is_active: true });

  const menuCards = [
    {
      title: "Data Pejabat",
      description: "Kelola data pejabat penandatangan surat",
      icon: Users,
      path: "/surat/pejabat",
      count: pejabat.length,
      color: "text-primary",
    },
    {
      title: "Template Surat",
      description: "Kelola template dokumen surat",
      icon: FileText,
      path: "/surat/template",
      count: templates.length,
      color: "text-success",
    },
    {
      title: "Generate Surat",
      description: "Buat surat baru dari template",
      icon: PlusCircle,
      path: "/surat/generate",
      color: "text-accent",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Modul Surat</h1>
          <p className="text-muted-foreground mt-2">
            Kelola pejabat, template, dan generate surat resmi
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {menuCards.map((menu) => {
            const Icon = menu.icon;
            return (
              <Card
                key={menu.path}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(menu.path)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Icon className={`h-8 w-8 ${menu.color}`} />
                    {menu.count !== undefined && (
                      <span className="text-2xl font-bold">{menu.count}</span>
                    )}
                  </div>
                  <CardTitle className="mt-4">{menu.title}</CardTitle>
                  <CardDescription>{menu.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Buka
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
