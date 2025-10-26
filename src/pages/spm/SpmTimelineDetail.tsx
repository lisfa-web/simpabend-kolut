import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Download
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { SpmTimeline } from "../spm/components/SpmTimeline";

export default function SpmTimelineDetail() {
  const { id: spmId } = useParams();
  const navigate = useNavigate();

  const { data: spm, isLoading } = useQuery({
    queryKey: ["spm-timeline", spmId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spm")
        .select(`
          *,
          opd:opd_id(nama_opd, kode_opd),
          bendahara:profiles!bendahara_id(full_name, email),
          program:program_id(nama_program, kode_program),
          kegiatan:kegiatan_id(nama_kegiatan, kode_kegiatan),
          subkegiatan:subkegiatan_id(nama_subkegiatan, kode_subkegiatan),
          vendor:vendor_id(nama_vendor, npwp),
          verified_resepsionis:profiles!verified_by_resepsionis(full_name),
          verified_pbmd:profiles!verified_by_pbmd(full_name),
          verified_akuntansi:profiles!verified_by_akuntansi(full_name),
          verified_perbendaharaan:profiles!verified_by_perbendaharaan(full_name),
          verified_kepala:profiles!verified_by_kepala_bkad(full_name)
        `)
        .eq("id", spmId!)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!spmId,
  });

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
        <div className="flex items-center justify-between">
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
          {getStatusBadge(spm.status || "draft")}
        </div>

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
            {/* Program Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informasi Program</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Program</p>
                  <p className="text-sm font-medium">{spm.program?.nama_program || "-"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {spm.program?.kode_program || "-"}
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Kegiatan</p>
                  <p className="text-sm font-medium">{spm.kegiatan?.nama_kegiatan || "-"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {spm.kegiatan?.kode_kegiatan || "-"}
                  </p>
                </div>

                {spm.subkegiatan && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Sub Kegiatan</p>
                      <p className="text-sm font-medium">{spm.subkegiatan.nama_subkegiatan}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {spm.subkegiatan.kode_subkegiatan}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Vendor Info */}
            {spm.vendor && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informasi Vendor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Nama Vendor</p>
                    <p className="text-sm font-medium">{spm.vendor.nama_vendor}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">NPWP</p>
                    <p className="text-sm font-medium">{spm.vendor.npwp || "-"}</p>
                  </div>
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
    </DashboardLayout>
  );
}
