import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  FileText, 
  Building2, 
  User, 
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  CheckCircle,
  Printer
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { SpmTimeline } from "../spm/components/SpmTimeline";
import { VerificationDialog } from "../spm/components/VerificationDialog";
import { useSpmVerification } from "@/hooks/useSpmVerification";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "@/hooks/use-toast";
import { generateSpmPDF } from "@/lib/spmPdfUtils";
import { formatJenisSpm } from "@/lib/formatHelpers";

export default function SpmTimelineDetail() {
  const { id: spmId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shouldVerify = searchParams.get('action') === 'verify';
  const [dialogOpen, setDialogOpen] = useState(false);
  const userRole = useUserRole();
  
  // Determine verification role based on user role
  const getVerificationRole = () => {
    if (userRole.hasRole('resepsionis')) return 'resepsionis';
    if (userRole.hasRole('pbmd')) return 'pbmd';
    if (userRole.hasRole('akuntansi')) return 'akuntansi';
    if (userRole.hasRole('perbendaharaan')) return 'perbendaharaan';
    if (userRole.hasRole('kepala_bkad')) return 'kepala_bkad';
    return null;
  };

  const verificationRole = getVerificationRole();
  const { verifySpm } = useSpmVerification(verificationRole || 'resepsionis');

  // Auto-open dialog when ?action=verify param is present
  useEffect(() => {
    if (shouldVerify && verificationRole) {
      setDialogOpen(true);
    }
  }, [shouldVerify, verificationRole]);

  const { data: spm, isLoading } = useQuery({
    queryKey: ["spm-timeline", spmId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spm")
        .select(`
          *,
          opd:opd_id(nama_opd, kode_opd),
          jenis_spm:jenis_spm_id(nama_jenis),
          bendahara:profiles!bendahara_id(full_name, email),
          verified_resepsionis:profiles!verified_by_resepsionis(full_name),
          verified_pbmd:profiles!verified_by_pbmd(full_name),
          verified_akuntansi:profiles!verified_by_akuntansi(full_name),
          verified_perbendaharaan:profiles!verified_by_perbendaharaan(full_name),
          verified_kepala:profiles!verified_by_kepala_bkad(full_name),
          potongan_pajak_spm(*)
        `)
        .eq("id", spmId!)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!spmId,
  });

  // Query for Kop Surat
  const { data: kopSurat } = useQuery({
    queryKey: ["kop-surat-config"],
    queryFn: async () => {
      const { data } = await supabase
        .from("config_sistem")
        .select("value")
        .eq("key", "kop_surat_url")
        .single();
      return data?.value || null;
    },
  });

  const handlePrintSpm = () => {
    if (!spm) return;

    const spmPrintData = {
      nomor_spm: spm.nomor_spm || "DRAFT",
      tanggal_ajuan: spm.tanggal_ajuan,
      nilai_spm: spm.nilai_spm,
      total_potongan: spm.total_potongan,
      nilai_bersih: spm.nilai_bersih,
      uraian: spm.uraian,
      jenis_spm: (spm as any).jenis_spm?.nama_jenis || "SPM",
      nomor_berkas: spm.nomor_berkas,
      nomor_antrian: spm.nomor_antrian,
      opd: spm.opd,
      penerima: {
        tipe: spm.tipe_penerima,
        nama: spm.nama_penerima,
        nama_bank: spm.nama_bank,
        nomor_rekening: spm.nomor_rekening,
        nama_rekening: spm.nama_rekening,
      },
      bendahara: spm.bendahara,
      potongan_pajak_spm: spm.potongan_pajak_spm,
    };

    generateSpmPDF(
      spmPrintData,
      kopSurat,
      "KEPALA BADAN KEUANGAN DAN ASET DAERAH",
      ""
    );

    toast({
      title: "Mencetak Draft SPM",
      description: "Dokumen SPM sedang disiapkan untuk dicetak",
    });
  };

  const handleSubmitVerification = (data: any) => {
    if (!spmId) return;

    verifySpm.mutate(
      {
        spmId: spmId,
        ...data,
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          toast({
            title: "Berhasil",
            description: "SPM berhasil diverifikasi",
          });
          // Redirect back to verification list
          if (verificationRole) {
            navigate(`/spm/verifikasi/${verificationRole}`);
          }
        },
      }
    );
  };

  const canVerify = () => {
    if (!spm || !verificationRole) return false;
    
    const roleStatusMap: Record<string, string> = {
      'resepsionis': 'diajukan',
      'pbmd': 'resepsionis_verifikasi',
      'akuntansi': 'pbmd_verifikasi',
      'perbendaharaan': 'akuntansi_validasi',
      'kepala_bkad': 'perbendaharaan_verifikasi',
    };
    
    return spm.status === roleStatusMap[verificationRole];
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      draft: { label: "Draft", variant: "outline" },
      diajukan: { label: "Diajukan", variant: "secondary" },
      resepsionis_verifikasi: { label: "Verifikasi Resepsionis", variant: "default" },
      pbmd_verifikasi: { label: "Verifikasi PBMD", variant: "default" },
      akuntansi_validasi: { label: "Validasi Akuntansi", variant: "default" },
      perbendaharaan_verifikasi: { label: "Verifikasi Perbendaharaan", variant: "default" },
      kepala_bkad_review: { label: "Review Kepala BKAD", variant: "default" },
      disetujui: { label: "Disetujui", variant: "default" },
      ditolak: { label: "Ditolak", variant: "destructive" },
      perlu_revisi: { label: "Perlu Revisi", variant: "destructive" },
    };

    const config = statusConfig[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!spm) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <AlertCircle className="w-16 h-16 text-muted-foreground" />
          <p className="text-xl text-muted-foreground">SPM tidak ditemukan</p>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Detail Timeline SPM
                </h1>
                <p className="text-muted-foreground mt-1">
                  {spm.nomor_spm || "Draft - Belum ada nomor"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                onClick={handlePrintSpm}
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Cetak Draft SPM</span>
                <span className="sm:hidden">Cetak</span>
              </Button>
              {getStatusBadge(spm.status || "draft")}
            </div>
          </div>
        </div>

        {/* Verification Alert */}
        {shouldVerify && canVerify() && (
          <Alert className="border-primary bg-primary/5">
            <CheckCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-sm">
                Anda dapat memverifikasi SPM ini setelah meninjau detail di bawah
              </span>
              <Button 
                size="sm"
                onClick={() => setDialogOpen(true)}
                className="ml-4"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Verifikasi Sekarang
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {shouldVerify && !canVerify() && verificationRole && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              SPM ini tidak dalam status yang sesuai untuk diverifikasi oleh Anda.
            </AlertDescription>
          </Alert>
        )}

        {/* Info Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">OPD</p>
                  <p className="font-semibold truncate">{spm.opd?.nama_opd}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-50">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Bendahara</p>
                  <p className="font-semibold truncate">{spm.bendahara?.full_name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-50">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Tanggal Ajuan</p>
                  <p className="font-semibold">
                    {spm.tanggal_ajuan
                      ? format(new Date(spm.tanggal_ajuan), "dd MMM yyyy", { locale: id })
                      : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Nilai SPM</p>
                  <p className="font-semibold">{formatCurrency(spm.nilai_spm)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Timeline Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Timeline Verifikasi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SpmTimeline spm={spm} currentStatus={spm.status || "draft"} />
              </CardContent>
            </Card>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Jenis SPM Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informasi Jenis SPM</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Jenis SPM</p>
                  <p className="text-sm font-medium">{(spm as any).jenis_spm?.nama_jenis || "-"}</p>
                  {(spm as any).jenis_spm?.deskripsi && (
                    <p className="text-xs text-muted-foreground mt-1">{(spm as any).jenis_spm.deskripsi}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Vendor Info */}
            {spm.nama_penerima && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informasi Penerima</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Tipe Penerima</p>
                    <p className="text-sm font-medium">{spm.tipe_penerima || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Nama Penerima</p>
                    <p className="text-sm font-medium">{spm.nama_penerima}</p>
                  </div>
                  {spm.nama_bank && (
                    <div>
                      <p className="text-xs text-muted-foreground">Bank</p>
                      <p className="text-sm font-medium">{spm.nama_bank}</p>
                    </div>
                  )}
                  {spm.nomor_rekening && (
                    <div>
                      <p className="text-xs text-muted-foreground">No. Rekening</p>
                      <p className="text-sm font-medium">{spm.nomor_rekening}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Uraian */}
            {spm.uraian && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Uraian</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{spm.uraian}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Verification Dialog */}
      {verificationRole && (
        <VerificationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmitVerification}
          title={`Verifikasi ${verificationRole.replace('_', ' ').toUpperCase()}`}
          showNomorAntrian={verificationRole === 'resepsionis'}
          showNomorBerkas={verificationRole === 'resepsionis'}
          showPin={verificationRole === 'kepala_bkad'}
          isLoading={verifySpm.isPending}
        />
      )}
    </DashboardLayout>
  );
}
