import { useState, useRef } from "react";
import { Download, Database, Loader2, CheckCircle2, Info, FileText, Shield, Users, Code, HardDrive, Upload, FileUp, Receipt, AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

type ExportType = 'complete' | 'rls' | 'users' | 'data' | 'transactions' | 'edge-functions';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
  stats: {
    totalStatements: number;
    createTables: number;
    insertStatements: number;
    alterStatements: number;
    createFunctions: number;
    createPolicies: number;
    dropStatements: number;
  };
  dependencyOrder: string[];
  missingDependencies: string[];
}

// Table dependency order based on foreign keys
const TABLE_DEPENDENCY_ORDER = [
  'config_sistem',
  'format_nomor',
  'jenis_spm',
  'master_bank',
  'master_pajak',
  'opd',
  'pejabat',
  'vendor',
  'pihak_ketiga',
  'pajak_per_jenis_spm',
  'permissions',
  'template_surat',
  'panduan_manual',
  'setting_access_control',
  'email_config',
  'wa_gateway',
  'dashboard_layout',
  'profiles',
  'user_roles',
  'spm',
  'sp2d',
  'lampiran_spm',
  'potongan_pajak_spm',
  'potongan_pajak_sp2d',
  'revisi_spm',
  'notifikasi',
  'pin_otp',
  'public_token',
  'arsip_spm',
  'arsip_sp2d',
  'audit_log'
];

// Foreign key dependencies map
const FK_DEPENDENCIES: Record<string, string[]> = {
  'opd': ['master_bank'],
  'pejabat': ['opd'],
  'vendor': ['master_bank'],
  'pihak_ketiga': ['master_bank'],
  'pajak_per_jenis_spm': ['master_pajak'],
  'user_roles': ['opd'],
  'spm': ['opd', 'jenis_spm', 'profiles'],
  'sp2d': ['spm', 'profiles'],
  'lampiran_spm': ['spm'],
  'potongan_pajak_spm': ['spm'],
  'potongan_pajak_sp2d': ['sp2d'],
  'revisi_spm': ['spm'],
  'notifikasi': ['spm'],
  'pin_otp': ['spm', 'sp2d'],
  'public_token': ['spm'],
  'arsip_spm': ['spm', 'opd', 'profiles'],
  'arsip_sp2d': ['sp2d', 'spm', 'opd', 'profiles'],
  'audit_log': ['profiles'],
  'panduan_manual': ['profiles'],
};

function validateSQL(sqlContent: string): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    info: [],
    stats: {
      totalStatements: 0,
      createTables: 0,
      insertStatements: 0,
      alterStatements: 0,
      createFunctions: 0,
      createPolicies: 0,
      dropStatements: 0,
    },
    dependencyOrder: [],
    missingDependencies: [],
  };

  if (!sqlContent.trim()) {
    result.isValid = false;
    result.errors.push('SQL content kosong');
    return result;
  }

  // Split into statements
  const statements = sqlContent
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));

  result.stats.totalStatements = statements.length;

  const createdTables: Set<string> = new Set();
  const referencedTables: Set<string> = new Set();
  const insertedTables: string[] = [];

  for (const stmt of statements) {
    const upperStmt = stmt.toUpperCase();

    // Count statement types
    if (upperStmt.includes('CREATE TABLE')) {
      result.stats.createTables++;
      const match = stmt.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(\w+)/i);
      if (match) createdTables.add(match[1].toLowerCase());
    }
    if (upperStmt.includes('INSERT INTO')) {
      result.stats.insertStatements++;
      const match = stmt.match(/INSERT\s+INTO\s+(?:public\.)?(\w+)/i);
      if (match) insertedTables.push(match[1].toLowerCase());
    }
    if (upperStmt.includes('ALTER TABLE') || upperStmt.includes('ALTER PUBLICATION')) {
      result.stats.alterStatements++;
    }
    if (upperStmt.includes('CREATE FUNCTION') || upperStmt.includes('CREATE OR REPLACE FUNCTION')) {
      result.stats.createFunctions++;
    }
    if (upperStmt.includes('CREATE POLICY')) {
      result.stats.createPolicies++;
    }
    if (upperStmt.includes('DROP ')) {
      result.stats.dropStatements++;
    }

    // Check for REFERENCES (foreign keys)
    const refMatches = stmt.matchAll(/REFERENCES\s+(?:public\.)?(\w+)/gi);
    for (const match of refMatches) {
      referencedTables.add(match[1].toLowerCase());
    }

    // Basic syntax checks
    if (upperStmt.includes('CREATE TABLE') && !stmt.includes('(')) {
      result.errors.push(`Syntax error: CREATE TABLE tanpa definisi kolom`);
    }

    // Check for common issues
    if (upperStmt.includes('TRUNCATE') && !upperStmt.includes('CASCADE')) {
      result.warnings.push('TRUNCATE tanpa CASCADE mungkin gagal jika ada FK');
    }

    // Check for dangerous operations
    if (upperStmt.includes('DROP DATABASE')) {
      result.errors.push('DROP DATABASE tidak diizinkan');
    }
    if (upperStmt.includes('DROP SCHEMA') && !upperStmt.includes('IF EXISTS')) {
      result.warnings.push('DROP SCHEMA tanpa IF EXISTS berisiko error');
    }
  }

  // Check foreign key dependencies order for INSERT statements
  const insertOrder = insertedTables.filter((t, i, arr) => arr.indexOf(t) === i);
  result.dependencyOrder = insertOrder;

  // Validate INSERT order against dependencies
  const insertedSet = new Set<string>();
  for (const table of insertOrder) {
    const deps = FK_DEPENDENCIES[table] || [];
    for (const dep of deps) {
      if (!insertedSet.has(dep) && insertOrder.includes(dep)) {
        const depIndex = insertOrder.indexOf(dep);
        const tableIndex = insertOrder.indexOf(table);
        if (depIndex > tableIndex) {
          result.warnings.push(`Urutan INSERT mungkin salah: ${table} membutuhkan ${dep} diinsert lebih dulu`);
        }
      }
    }
    insertedSet.add(table);
  }

  // Check for missing dependencies
  for (const ref of referencedTables) {
    if (!createdTables.has(ref) && !['auth', 'users'].includes(ref)) {
      result.missingDependencies.push(ref);
    }
  }

  if (result.missingDependencies.length > 0) {
    result.warnings.push(`Tabel referensi yang mungkin belum dibuat: ${result.missingDependencies.join(', ')}`);
  }

  // Info messages
  result.info.push(`Total ${result.stats.totalStatements} statements ditemukan`);
  if (result.stats.createTables > 0) result.info.push(`${result.stats.createTables} CREATE TABLE`);
  if (result.stats.insertStatements > 0) result.info.push(`${result.stats.insertStatements} INSERT statements`);
  if (result.stats.createFunctions > 0) result.info.push(`${result.stats.createFunctions} functions`);
  if (result.stats.createPolicies > 0) result.info.push(`${result.stats.createPolicies} RLS policies`);
  if (result.stats.dropStatements > 0) result.info.push(`${result.stats.dropStatements} DROP statements (hati-hati!)`);

  // Set overall validity
  result.isValid = result.errors.length === 0;

  return result;
}

const DatabaseBackup = () => {
  const { isSuperAdmin } = useAuth();
  const [downloading, setDownloading] = useState<ExportType | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [sqlContent, setSqlContent] = useState("");
  const [importing, setImporting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isSuperAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.sql')) {
      toast.error("Hanya file .sql yang didukung");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setSqlContent(content);
      setValidationResult(null);
      toast.success(`File ${file.name} berhasil dimuat (${(file.size / 1024).toFixed(1)} KB)`);
    };
    reader.readAsText(file);
  };

  const handleValidate = () => {
    setValidating(true);
    setTimeout(() => {
      const result = validateSQL(sqlContent);
      setValidationResult(result);
      setValidating(false);
      
      if (result.isValid && result.warnings.length === 0) {
        toast.success("Validasi berhasil! SQL siap untuk di-import.");
      } else if (result.isValid && result.warnings.length > 0) {
        toast.warning(`Validasi selesai dengan ${result.warnings.length} warning`);
      } else {
        toast.error(`Validasi gagal: ${result.errors.length} error ditemukan`);
      }
    }, 500);
  };

  const handleImport = async () => {
    if (!sqlContent.trim()) {
      toast.error("SQL content kosong");
      return;
    }

    if (!validationResult || !validationResult.isValid) {
      toast.error("Validasi SQL terlebih dahulu sebelum import");
      return;
    }

    try {
      setImporting(true);
      toast.info("Menjalankan SQL import...");

      const statements = sqlContent
        .split(/;\s*\n/)
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'));

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const stmt of statements) {
        if (!stmt) continue;
        
        try {
          const { error } = await supabase.rpc('execute_import_sql' as any, { sql_statement: stmt + ';' });
          
          if (error) {
            errorCount++;
            if (errors.length < 5) {
              errors.push(`${stmt.substring(0, 50)}... - ${error.message}`);
            }
          } else {
            successCount++;
          }
        } catch (err) {
          errorCount++;
        }
      }

      if (errorCount === 0) {
        toast.success(`Import berhasil! ${successCount} statements dieksekusi.`);
        setImportDialogOpen(false);
        setSqlContent("");
        setValidationResult(null);
      } else {
        toast.warning(`Import selesai dengan ${errorCount} errors dari ${statements.length} statements`);
        console.error("Import errors:", errors);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error("Gagal import: " + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setImporting(false);
    }
  };

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
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Complete SQL Backup
              </CardTitle>
              <Badge className="bg-primary/10 text-primary border-primary/20">~1.3 MB</Badge>
            </div>
            <CardDescription>
              Backup lengkap seluruh database: Schema, Master Data, User & Roles, Transaksi SPM/SP2D, dan Data Operasional
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
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
                <p className="text-2xl font-bold">1,231</p>
                <p className="text-xs text-muted-foreground">Data Rows</p>
              </div>
              <div className="space-y-1 text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">20</p>
                <p className="text-xs text-muted-foreground">Edge Functions</p>
              </div>
              <div className="space-y-1 text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">4</p>
                <p className="text-xs text-muted-foreground">Storage Buckets</p>
              </div>
              <div className="space-y-1 text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">11</p>
                <p className="text-xs text-muted-foreground">Sections</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">ENUMs</Badge>
              <Badge variant="outline">Tables + Constraints</Badge>
              <Badge variant="outline">Functions & Triggers</Badge>
              <Badge variant="outline">RLS Policies & Indexes</Badge>
              <Badge variant="outline">Master Data & Config</Badge>
              <Badge variant="outline">Users & Roles</Badge>
              <Badge variant="outline">SPM & SP2D</Badge>
              <Badge variant="outline">Audit Log & Arsip</Badge>
              <Badge variant="outline">Storage Buckets</Badge>
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
                <><Download className="mr-2 h-4 w-4" /> Download Complete SQL Backup (~1.3 MB)</>
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

          {/* Transactions Data */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Receipt className="h-5 w-5 text-rose-600" />
                Transaction Data (SPM & SP2D)
              </CardTitle>
              <CardDescription>
                Backup lengkap data transaksi operasional: SPM, SP2D, lampiran, potongan pajak, revisi, notifikasi, arsip, dan audit log
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1 text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">SPM</p>
                  <p className="text-xs text-muted-foreground">Data pengajuan</p>
                </div>
                <div className="space-y-1 text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">SP2D</p>
                  <p className="text-xs text-muted-foreground">Data pencairan</p>
                </div>
                <div className="space-y-1 text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">Lampiran</p>
                  <p className="text-xs text-muted-foreground">File dokumen</p>
                </div>
                <div className="space-y-1 text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">Audit Log</p>
                  <p className="text-xs text-muted-foreground">Riwayat aktivitas</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">SPM + Potongan Pajak</Badge>
                <Badge variant="outline">SP2D + Potongan Pajak</Badge>
                <Badge variant="outline">Lampiran SPM</Badge>
                <Badge variant="outline">Revisi SPM</Badge>
                <Badge variant="outline">Notifikasi</Badge>
                <Badge variant="outline">Arsip SPM/SP2D</Badge>
                <Badge variant="outline">Audit Log</Badge>
              </div>
              <Button 
                onClick={() => handleDownload('transactions', `transactions-backup-${dateStr}.sql`)}
                disabled={downloading === 'transactions'}
                className="w-full"
              >
                {downloading === 'transactions' ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><Download className="mr-2 h-4 w-4" /> Download Transaction Data</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Import / Restore Database
            </CardTitle>
            <CardDescription>
              Import data dari file SQL yang sudah di-export sebelumnya
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Perhatian:</strong> Import hanya untuk server lokal/VPS dengan akses langsung ke PostgreSQL.
                Untuk Lovable Cloud, gunakan <code className="bg-muted px-1 rounded">psql</code> command line.
              </AlertDescription>
            </Alert>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Urutan Import yang Benar:</h4>
                <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground">
                  <li>complete-backup.sql (schema)</li>
                  <li>data-backup.sql (master data)</li>
                  <li>users-auth.sql (profiles & roles)</li>
                  <li>transactions-backup.sql (transaksi)</li>
                </ol>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Command Line Import:</h4>
                <div className="text-xs bg-muted p-3 rounded-lg font-mono space-y-1">
                  <p>psql -d spm_sp2d -f complete-backup.sql</p>
                  <p>psql -d spm_sp2d -f data-backup.sql</p>
                  <p>psql -d spm_sp2d -f users-auth.sql</p>
                  <p>psql -d spm_sp2d -f transactions-backup.sql</p>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => setImportDialogOpen(true)} 
              variant="outline" 
              className="w-full"
            >
              <FileUp className="mr-2 h-4 w-4" />
              Upload & Preview SQL File
            </Button>
          </CardContent>
        </Card>

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
                  <li>Import transactions-backup.sql</li>
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
                  <li>Run: <code className="bg-muted px-1 rounded">psql -d spm_sp2d -f transactions-backup.sql</code></li>
                  <li>Setup auth schema manually atau pakai alternatif</li>
                  <li>Deploy edge functions dengan Deno</li>
                </ol>
              </div>
            </div>

            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <strong>Backup Lengkap:</strong> Dengan file transactions-backup.sql, Anda bisa backup 100% data termasuk semua transaksi SPM dan SP2D.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Import Dialog */}
        <Dialog open={importDialogOpen} onOpenChange={(open) => {
          setImportDialogOpen(open);
          if (!open) {
            setValidationResult(null);
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileUp className="h-5 w-5" />
                Import SQL File
              </DialogTitle>
              <DialogDescription>
                Upload file .sql, validasi syntax & dependency, lalu import
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 flex-1 overflow-hidden">
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".sql"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Pilih File SQL
                </Button>
                {sqlContent && (
                  <Button 
                    onClick={handleValidate}
                    disabled={validating || !sqlContent}
                    variant="secondary"
                  >
                    {validating ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Validating...</>
                    ) : (
                      <><CheckCircle className="mr-2 h-4 w-4" /> Validasi SQL</>
                    )}
                  </Button>
                )}
              </div>

              {sqlContent && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* SQL Preview */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Preview SQL ({(sqlContent.length / 1024).toFixed(1)} KB)
                    </p>
                    <Textarea
                      value={sqlContent}
                      onChange={(e) => {
                        setSqlContent(e.target.value);
                        setValidationResult(null);
                      }}
                      className="font-mono text-xs h-48 resize-none"
                      placeholder="SQL content akan muncul di sini..."
                    />
                  </div>

                  {/* Validation Results */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Hasil Validasi</p>
                    <ScrollArea className="h-48 border rounded-md p-3 bg-muted/30">
                      {!validationResult ? (
                        <div className="text-sm text-muted-foreground text-center py-8">
                          <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                          <p>Klik "Validasi SQL" untuk mengecek</p>
                          <p className="text-xs mt-1">syntax, foreign key, dan urutan dependency</p>
                        </div>
                      ) : (
                        <div className="space-y-3 text-sm">
                          {/* Stats */}
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">{validationResult.stats.totalStatements} statements</Badge>
                            {validationResult.stats.createTables > 0 && (
                              <Badge variant="outline" className="text-xs">{validationResult.stats.createTables} tables</Badge>
                            )}
                            {validationResult.stats.insertStatements > 0 && (
                              <Badge variant="outline" className="text-xs">{validationResult.stats.insertStatements} inserts</Badge>
                            )}
                            {validationResult.stats.createFunctions > 0 && (
                              <Badge variant="outline" className="text-xs">{validationResult.stats.createFunctions} functions</Badge>
                            )}
                            {validationResult.stats.createPolicies > 0 && (
                              <Badge variant="outline" className="text-xs">{validationResult.stats.createPolicies} policies</Badge>
                            )}
                          </div>

                          {/* Errors */}
                          {validationResult.errors.length > 0 && (
                            <div className="space-y-1">
                              <p className="font-medium text-destructive flex items-center gap-1">
                                <XCircle className="h-4 w-4" /> Errors ({validationResult.errors.length})
                              </p>
                              {validationResult.errors.map((err, i) => (
                                <p key={i} className="text-xs text-destructive pl-5">• {err}</p>
                              ))}
                            </div>
                          )}

                          {/* Warnings */}
                          {validationResult.warnings.length > 0 && (
                            <div className="space-y-1">
                              <p className="font-medium text-yellow-600 flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4" /> Warnings ({validationResult.warnings.length})
                              </p>
                              {validationResult.warnings.map((warn, i) => (
                                <p key={i} className="text-xs text-yellow-600 pl-5">• {warn}</p>
                              ))}
                            </div>
                          )}

                          {/* Success */}
                          {validationResult.isValid && validationResult.errors.length === 0 && (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="font-medium">Validasi berhasil!</span>
                            </div>
                          )}

                          {/* Dependency Order */}
                          {validationResult.dependencyOrder.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Urutan INSERT:</p>
                              <p className="text-xs font-mono bg-muted p-1 rounded">
                                {validationResult.dependencyOrder.slice(0, 10).join(' → ')}
                                {validationResult.dependencyOrder.length > 10 && '...'}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </div>
              )}

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Validasi mencakup:</strong> Pengecekan syntax dasar, urutan foreign key dependency, 
                  dan deteksi operasi berbahaya. Untuk import yang aman, gunakan <code>psql</code> command line.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter className="flex-shrink-0">
              <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                Batal
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={!sqlContent || importing || !validationResult?.isValid}
                variant={validationResult?.isValid ? "default" : "secondary"}
              >
                {importing ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...</>
                ) : !validationResult ? (
                  <><Database className="mr-2 h-4 w-4" /> Validasi dulu</>
                ) : !validationResult.isValid ? (
                  <><XCircle className="mr-2 h-4 w-4" /> Ada Error</>
                ) : (
                  <><Database className="mr-2 h-4 w-4" /> Execute Import</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default DatabaseBackup;
