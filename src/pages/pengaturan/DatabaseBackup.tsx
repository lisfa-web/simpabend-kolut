import { useState } from "react";
import { Download, Database, Loader2, CheckCircle2, Info, FileText } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

const DatabaseBackup = () => {
  const { isSuperAdmin } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);

  // Only super admins can access
  if (!isSuperAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }

  const handleDownloadBackup = async () => {
    try {
      setIsDownloading(true);
      toast.info("Generating backup dari database...");

      // Call edge function to generate fresh SQL backup
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/generate-database-backup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal generate backup');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `database-backup-${new Date().toISOString().split('T')[0]}.sql`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Backup database berhasil didownload!");
    } catch (error) {
      console.error('Error downloading backup:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Gagal mendownload backup: ${errorMessage}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Database className="h-8 w-8" />
            Database Backup
          </h1>
          <p className="text-muted-foreground mt-2">
            Download complete SQL schema untuk backup atau migrasi database
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            File SQL ini di-<strong>generate real-time</strong> langsung dari database saat ini. 
            Setiap kali download, Anda akan mendapat backup <strong>terbaru</strong> yang mencerminkan 
            semua perubahan/migration yang sudah dilakukan. Cocok untuk backup, dokumentasi, 
            atau setup database di hosting baru.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Complete Database Schema
            </CardTitle>
            <CardDescription>
              Backup lengkap struktur database (real-time dari database saat ini)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Schema Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">ENUM Types</p>
                <p className="text-2xl font-bold text-foreground">6</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tables</p>
                <p className="text-2xl font-bold text-foreground">28</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Functions</p>
                <p className="text-2xl font-bold text-foreground">17</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">RLS Policies</p>
                <p className="text-2xl font-bold text-foreground">70+</p>
              </div>
            </div>

            {/* What's Included */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Isi File SQL:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">ENUM Types</p>
                    <p className="text-xs text-muted-foreground">app_role, status_spm, status_sp2d, dll</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">All Tables</p>
                    <p className="text-xs text-muted-foreground">Struktur lengkap + constraints</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Database Functions</p>
                    <p className="text-xs text-muted-foreground">has_role, generate_document_number, dll</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Triggers</p>
                    <p className="text-xs text-muted-foreground">Auto-assign nomor, audit logs, dll</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">RLS Policies</p>
                    <p className="text-xs text-muted-foreground">Semua security policies per table</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Indexes</p>
                    <p className="text-xs text-muted-foreground">Performance optimization</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Initial Data</p>
                    <p className="text-xs text-muted-foreground">Config sistem, format nomor</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Storage Docs</p>
                    <p className="text-xs text-muted-foreground">Dokumentasi bucket configuration</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Use Cases */}
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Kegunaan:</h3>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Backup</Badge>
                  <span className="text-sm text-muted-foreground">Complete database backup untuk disaster recovery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Dokumentasi</Badge>
                  <span className="text-sm text-muted-foreground">Technical documentation untuk tim developer</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Migrasi</Badge>
                  <span className="text-sm text-muted-foreground">Setup database di server/hosting baru</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Analisis</Badge>
                  <span className="text-sm text-muted-foreground">Review struktur database dan security policies</span>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="pt-4 border-t">
              <Button 
                onClick={handleDownloadBackup} 
                disabled={isDownloading}
                size="lg"
                className="w-full"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Mempersiapkan backup...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Download Complete SQL Backup
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                File: database-backup-{new Date().toISOString().split('T')[0]}.sql (~1300+ lines)
              </p>
            </div>

            {/* Instructions */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <p className="font-semibold">Cara Restore Database:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Buat PostgreSQL/Supabase database baru</li>
                  <li>Jalankan: <code className="bg-muted px-1 py-0.5 rounded text-xs">psql -f database-backup.sql</code></li>
                  <li>Setup storage buckets di Supabase Dashboard</li>
                  <li>Konfigurasi auth trigger untuk handle_new_user</li>
                  <li>Buat super_admin user pertama</li>
                </ol>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DatabaseBackup;
