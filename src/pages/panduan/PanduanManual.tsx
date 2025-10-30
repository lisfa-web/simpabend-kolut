import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePanduanManual } from "@/hooks/usePanduanManual";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getRoleDisplayName, getRoleBadgeColor } from "@/lib/auth";
import { Separator } from "@/components/ui/separator";

const PanduanManual = () => {
  const { panduanList, isLoading } = usePanduanManual();
  const { roles } = useAuth();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Group panduan by role
  const groupedPanduan = panduanList.reduce((acc: any, item: any) => {
    if (!acc[item.role]) acc[item.role] = [];
    acc[item.role].push(item);
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">📚 Panduan Manual</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Panduan penggunaan aplikasi SIMPA BEND sesuai dengan peran Anda
          </p>
        </div>

        {/* Display user roles */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs text-muted-foreground">Role Anda:</span>
          {roles.map((role) => (
            <Badge key={role} className={getRoleBadgeColor(role)}>
              {getRoleDisplayName(role)}
            </Badge>
          ))}
        </div>

        <Separator />

        {/* Panduan by role */}
        {Object.keys(groupedPanduan).map((role) => (
          <div key={role} className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold">
                Panduan untuk {getRoleDisplayName(role as any)}
              </h2>
            </div>

            {groupedPanduan[role].map((panduan: any) => (
              <Card key={panduan.id}>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">{panduan.judul}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert text-sm"
                    dangerouslySetInnerHTML={{ __html: panduan.konten }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        ))}

        {panduanList.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Belum ada panduan yang tersedia untuk role Anda
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PanduanManual;
