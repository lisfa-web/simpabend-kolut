import { Link, Navigate } from "react-router-dom";
import { Settings, FileText, MessageSquare, Shield, Mail, ScrollText, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";

const PengaturanIndex = () => {
  const { isSuperAdmin } = useAuth();

  // Only super admins can access settings
  if (!isSuperAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }
  const settingsModules = [
    {
      title: "Mode Emergency",
      description: "Bypass OTP/PIN untuk situasi darurat (HP hilang, gateway down)",
      icon: AlertTriangle,
      href: "/pengaturan/emergency-mode",
      color: "text-red-600",
    },
    {
      title: "Konfigurasi Sistem",
      description: "Kelola pengaturan umum aplikasi seperti nama instansi, alamat, dan kontak",
      icon: Settings,
      href: "/pengaturan/config",
      color: "text-primary",
    },
    {
      title: "Format Nomor",
      description: "Atur format penomoran otomatis untuk dokumen SPM, SP2D, dan Surat",
      icon: FileText,
      href: "/pengaturan/format-nomor",
      color: "text-blue-600",
    },
    {
      title: "WhatsApp Gateway",
      description: "Konfigurasi integrasi WhatsApp untuk notifikasi otomatis",
      icon: MessageSquare,
      href: "/pengaturan/wa-gateway",
      color: "text-green-600",
    },
    {
      title: "Email Configuration",
      description: "Konfigurasi Gmail SMTP untuk pengiriman email otomatis",
      icon: Mail,
      href: "/pengaturan/email",
      color: "text-red-600",
    },
    {
      title: "Hak Akses",
      description: "Kelola permissions dan hak akses per role untuk setiap resource",
      icon: Shield,
      href: "/pengaturan/permissions",
      color: "text-orange-600",
    },
    {
      title: "Audit Trail",
      description: "Log aktivitas dan perubahan data sistem untuk monitoring keamanan",
      icon: ScrollText,
      href: "/pengaturan/audit-trail",
      color: "text-purple-600",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pengaturan</h1>
          <p className="text-muted-foreground mt-2">
            Kelola konfigurasi dan pengaturan sistem
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsModules.map((module) => (
            <Link key={module.href} to={module.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-muted ${module.color}`}>
                      <module.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle>{module.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {module.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PengaturanIndex;
