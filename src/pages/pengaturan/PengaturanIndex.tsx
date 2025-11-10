import { Link, Navigate } from "react-router-dom";
import { Settings, FileText, MessageSquare, Shield, Mail, AlertTriangle, Palette, Database, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";

const PengaturanIndex = () => {
  const { isSuperAdmin, isAdmin } = useAuth();

  // Allow both administrator and super_admin to access settings
  if (!isAdmin() && !isSuperAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }

  const settingsModules = [
    {
      title: "Database Backup",
      description: "Download complete SQL schema untuk backup atau migrasi database",
      icon: Database,
      href: "/pengaturan/database-backup",
      color: "text-cyan-600",
    },
    {
      title: "Mode Emergency",
      description: "Bypass OTP/PIN untuk situasi darurat (HP hilang, gateway down)",
      icon: AlertTriangle,
      href: "/pengaturan/emergency-mode",
      color: "text-red-600",
    },
    {
      title: "Template Sidebar",
      description: "Pilih tema dan style sidebar yang sesuai dengan preferensi Anda",
      icon: Palette,
      href: "/pengaturan/sidebar-template",
      color: "text-indigo-600",
    },
    {
      title: "Keamanan Session",
      description: "Atur timeout aktivitas, deteksi sleep/hibernate, dan opsi remember me",
      icon: Lock,
      href: "/pengaturan/security",
      color: "text-purple-600",
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
  ];

  // Filter modules based on role - WA Gateway, Email Config, Database Backup, and Sidebar Template only for super admin
  const filteredModules = settingsModules.filter((module) => {
    if (
      module.href === "/pengaturan/wa-gateway" || 
      module.href === "/pengaturan/email" ||
      module.href === "/pengaturan/database-backup" ||
      module.href === "/pengaturan/sidebar-template"
    ) {
      return isSuperAdmin();
    }
    return true;
  });

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
          {filteredModules.map((module) => (
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
