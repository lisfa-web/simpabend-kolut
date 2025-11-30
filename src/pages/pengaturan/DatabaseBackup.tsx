import { useState } from "react";
import { Download, Database, Loader2, CheckCircle2, Info, FileText, Shield, Users, Code, HardDrive } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

type ExportType = 'complete' | 'rls' | 'users' | 'data' | 'edge-functions';

const DatabaseBackup = () => {
  const { isSuperAdmin } = useAuth();
  const [downloading, setDownloading] = useState<ExportType | null>(null);

  if (!isSuperAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }

  const handleDownload = async (type: ExportType, filename: string) => {
    try {
      setDownloading(type);
      toast.info("Mempersiapkan export...");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/export-backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Gagal export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Export berhasil!");
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal export');
    } finally {
      setDownloading(null);
    }
  };

  const dateStr = new Date().toISOString().split('T')[0];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Database className="h-8 w-8" />
            Database Backup & Export
          </h1>
          <p className="text-muted-foreground mt-2">
            Export database untuk backup, migrasi ke server lokal/VPS, atau dokumentasi
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Semua export di-<strong>generate real-time</strong> dari database saat ini.
            Cocok untuk migrasi ke <strong>server lokal</strong>, <strong>VPS</strong>, atau <strong>Supabase project baru</strong>.
          </AlertDescription>
        </Alert>

        {/* Complete Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Complete SQL Schema
            </CardTitle>
            <CardDescription>
              Backup lengkap struktur database (ENUM, Tables, Functions, Triggers, RLS, Indexes)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-1 text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">6</p>
                <p className="text-xs text-muted-foreground">ENUM Types</p>
              </div>
              <div className="space-y-1 text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">28</p>
                <p className="text-xs text-muted-foreground">Tables</p>
              </div>
              <div className="space-y-1 text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">17</p>
                <p className="text-xs text-muted-foreground">Functions</p>
              </div>
              <div className="space-y-1 text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">70+</p>
                <p className="text-xs text-muted-foreground">RLS Policies</p>
              </div>
              <div className="space-y-1 text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">20</p>
                <p className="text-xs text-muted-foreground">Edge Functions</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">ENUMs</Badge>
              <Badge variant="outline">Tables + Constraints</Badge>
              <Badge variant="outline">Functions</Badge>
              <Badge variant="outline">Triggers</Badge>
              <Badge variant="outline">RLS Policies</Badge>
              <Badge variant="outline">Indexes</Badge>
            </div>

            <Button 
              onClick={() => handleDownload('complete', `complete-backup-${dateStr}.sql`)}
              disabled={downloading === 'complete'}
              className="w-full"
              size="lg"
            >
              {downloading === 'complete' ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
              ) : (
                <><Download className="mr-2 h-4 w-4" /> Download Complete SQL Backup</>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          {/* RLS Policies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-green-600" />
                RLS Policies
              </CardTitle>
              <CardDescription>
                Semua Row Level Security policies untuk proteksi data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Enable RLS statements</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>CREATE POLICY untuk semua table</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>USING & WITH CHECK expressions</span>
                </div>
              </div>
              <Button 
                onClick={() => handleDownload('rls', `rls-policies-${dateStr}.sql`)}
                disabled={downloading === 'rls'}
                variant="outline"
                className="w-full"
              >
                {downloading === 'rls' ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><Download className="mr-2 h-4 w-4" /> Download RLS Policies</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* User Auth */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-blue-600" />
                User & Auth Data
              </CardTitle>
              <CardDescription>
                Profiles dan role assignments untuk semua user
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>INSERT profiles dengan ON CONFLICT</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>INSERT user_roles lengkap</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Instruksi restore auth</span>
                </div>
              </div>
              <Button 
                onClick={() => handleDownload('users', `users-auth-${dateStr}.sql`)}
                disabled={downloading === 'users'}
                variant="outline"
                className="w-full"
              >
                {downloading === 'users' ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><Download className="mr-2 h-4 w-4" /> Download Users & Auth</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Master Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HardDrive className="h-5 w-5 text-orange-600" />
                Master Data & Config
              </CardTitle>
              <CardDescription>
                Data konfigurasi, master OPD, bank, pajak, vendor, dll
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>config_sistem, format_nomor</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>jenis_spm, master_bank, master_pajak</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>opd, pejabat, vendor, pihak_ketiga</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>template_surat, panduan_manual</span>
                </div>
              </div>
              <Button 
                onClick={() => handleDownload('data', `data-backup-${dateStr}.sql`)}
                disabled={downloading === 'data'}
                variant="outline"
                className="w-full"
              >
                {downloading === 'data' ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><Download className="mr-2 h-4 w-4" /> Download Master Data</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Edge Functions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Code className="h-5 w-5 text-purple-600" />
                Edge Functions Documentation
              </CardTitle>
              <CardDescription>
                Dokumentasi lengkap 20 edge functions untuk deployment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Daftar semua functions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Environment variables required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>config.toml template</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Deployment instructions</span>
                </div>
              </div>
              <Button 
                onClick={() => handleDownload('edge-functions', `edge-functions-${dateStr}.md`)}
                disabled={downloading === 'edge-functions'}
                variant="outline"
                className="w-full"
              >
                {downloading === 'edge-functions' ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><Download className="mr-2 h-4 w-4" /> Download Edge Functions Doc</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Migration Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Panduan Migrasi ke Server Lokal / VPS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">Opsi 1: PostgreSQL + Supabase Self-Hosted</h4>
                <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground">
                  <li>Install Docker & Supabase CLI</li>
                  <li>Run: <code className="bg-muted px-1 rounded">supabase init</code></li>
                  <li>Run: <code className="bg-muted px-1 rounded">supabase start</code></li>
                  <li>Import complete-backup.sql</li>
                  <li>Import data-backup.sql</li>
                  <li>Import users-auth.sql</li>
                  <li>Copy edge functions ke supabase/functions</li>
                  <li>Deploy: <code className="bg-muted px-1 rounded">supabase functions deploy</code></li>
                </ol>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Opsi 2: Pure PostgreSQL (tanpa Supabase)</h4>
                <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground">
                  <li>Install PostgreSQL 15+</li>
                  <li>Create database: <code className="bg-muted px-1 rounded">createdb spm_sp2d</code></li>
                  <li>Run: <code className="bg-muted px-1 rounded">psql -d spm_sp2d -f complete-backup.sql</code></li>
                  <li>Run: <code className="bg-muted px-1 rounded">psql -d spm_sp2d -f data-backup.sql</code></li>
                  <li>Run: <code className="bg-muted px-1 rounded">psql -d spm_sp2d -f users-auth.sql</code></li>
                  <li>Setup auth schema manually atau pakai alternatif</li>
                  <li>Deploy edge functions dengan Deno</li>
                </ol>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Catatan Penting:</strong> File SQL tidak termasuk data transaksi (SPM, SP2D).
                Untuk backup lengkap termasuk transaksi, gunakan <code>pg_dump</code> langsung dari PostgreSQL.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DatabaseBackup;
