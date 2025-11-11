import { Link, Navigate } from "react-router-dom";
import { Settings, FileText, MessageSquare, Shield, Mail, AlertTriangle, Palette, Database, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useSettingAccessControl } from "@/hooks/useSettingAccessControl";

const PengaturanIndex = () => {
  const { isSuperAdmin, isAdmin } = useAuth();
  const { data: accessControlSettings } = useSettingAccessControl();

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
      color: "text-cyan-700 dark:text-cyan-400",
      bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
      borderColor: "border-cyan-200 dark:border-cyan-800",
    },
    {
      title: "Mode Emergency",
      description: "Bypass OTP/PIN untuk situasi darurat (HP hilang, gateway down)",
      icon: AlertTriangle,
      href: "/pengaturan/emergency-mode",
      color: "text-rose-700 dark:text-rose-400",
      bgColor: "bg-rose-50 dark:bg-rose-950/30",
      borderColor: "border-rose-200 dark:border-rose-800",
    },
    {
      title: "Template Sidebar",
      description: "Pilih tema dan style sidebar yang sesuai dengan preferensi Anda",
      icon: Palette,
      href: "/pengaturan/sidebar-template",
      color: "text-indigo-700 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
      borderColor: "border-indigo-200 dark:border-indigo-800",
    },
    {
      title: "Keamanan Session",
      description: "Atur timeout aktivitas, deteksi sleep/hibernate, dan opsi remember me",
      icon: Lock,
      href: "/pengaturan/security",
      color: "text-purple-700 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
    {
      title: "Konfigurasi Sistem",
      description: "Kelola pengaturan umum aplikasi seperti nama instansi, alamat, dan kontak",
      icon: Settings,
      href: "/pengaturan/config",
      color: "text-blue-700 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      title: "Format Nomor",
      description: "Atur format penomoran otomatis untuk dokumen SPM, SP2D, dan Surat",
      icon: FileText,
      href: "/pengaturan/format-nomor",
      color: "text-sky-700 dark:text-sky-400",
      bgColor: "bg-sky-50 dark:bg-sky-950/30",
      borderColor: "border-sky-200 dark:border-sky-800",
    },
    {
      title: "WhatsApp Gateway",
      description: "Konfigurasi integrasi WhatsApp untuk notifikasi otomatis",
      icon: MessageSquare,
      href: "/pengaturan/wa-gateway",
      color: "text-emerald-700 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
      borderColor: "border-emerald-200 dark:border-emerald-800",
    },
    {
      title: "Email Configuration",
      description: "Konfigurasi Gmail SMTP untuk pengiriman email otomatis",
      icon: Mail,
      href: "/pengaturan/email",
      color: "text-amber-700 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      borderColor: "border-amber-200 dark:border-amber-800",
    },
    {
      title: "Hak Akses",
      description: "Kelola permissions dan hak akses per role untuk setiap resource",
      icon: Shield,
      href: "/pengaturan/permissions",
      color: "text-orange-700 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
      borderColor: "border-orange-200 dark:border-orange-800",
    },
  ];

  // Filter modules based on dynamic access control from database
  const filteredModules = settingsModules.filter((module) => {
    const settingKey = module.href.replace("/pengaturan/", "");
    const accessControl = accessControlSettings?.find(
      (setting) => setting.setting_key === settingKey
    );
    
    if (accessControl?.superadmin_only) {
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

        {isSuperAdmin() && (
          <Link to="/pengaturan/access-control">
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-muted">
                    <Lock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <CardTitle className="text-xl">Kontrol Akses Pengaturan</CardTitle>
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                        Superadmin
                      </Badge>
                    </div>
                    <CardDescription className="mt-2 text-base">
                      Kelola pengaturan mana saja yang hanya bisa diakses oleh superadmin
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredModules.map((module) => (
            <Link key={module.href} to={module.href}>
              <Card className={`hover:shadow-lg transition-all cursor-pointer h-full border-2 ${module.bgColor} ${module.borderColor} hover:scale-[1.02]`}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${module.bgColor} ${module.color} ring-2 ring-inset ${module.borderColor}`}>
                      <module.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className={module.color}>{module.title}</CardTitle>
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
