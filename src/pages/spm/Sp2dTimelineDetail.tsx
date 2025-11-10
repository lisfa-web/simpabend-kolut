import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
  CreditCard,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Receipt,
  BanknoteIcon
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Sp2dTimeline } from "./components/Sp2dTimeline";
import { Sp2dStatusBadge } from "./components/Sp2dStatusBadge";

export default function Sp2dTimelineDetail() {
  const { id: sp2dId } = useParams();
  const navigate = useNavigate();

  const { data: sp2d, isLoading } = useQuery({
    queryKey: ["sp2d-timeline", sp2dId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sp2d")
        .select(`
          *,
          spm:spm_id(
            *,
            opd:opd_id(nama_opd, kode_opd),
            jenis_spm:jenis_spm_id(nama_jenis),
            bendahara:profiles!bendahara_id(full_name, email)
          ),
          potongan_pajak_sp2d(*)
        `)
        .eq("id", sp2dId!)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!sp2dId,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "diterbitkan":
      case "cair":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "gagal":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "diuji_bank":
        return <Clock className="w-5 h-5 text-orange-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!sp2d) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>SP2D tidak ditemukan</AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-accent"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Receipt className="w-8 h-8 text-primary" />
                Timeline SP2D
              </h1>
              <p className="text-muted-foreground mt-1">
                Detail dan riwayat perjalanan SP2D
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Cetak
            </Button>
          </div>
        </div>

        {/* Status Card */}
        <Card className="border-2 shadow-lg bg-gradient-to-br from-background to-accent/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl flex items-center gap-3">
                  {getStatusIcon(sp2d.status)}
                  {sp2d.nomor_sp2d}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Sp2dStatusBadge status={sp2d.status} />
                  <span className="text-sm text-muted-foreground">
                    Dibuat {format(new Date(sp2d.created_at), "dd MMMM yyyy, HH:mm", { locale: id })}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Total Nilai</p>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(sp2d.nilai_sp2d)}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Riwayat Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Sp2dTimeline sp2d={sp2d} />
              </CardContent>
            </Card>

            {/* SPM Information */}
            {sp2d.spm && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Informasi SPM Terkait
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Nomor SPM</p>
                      <p className="font-medium">{sp2d.spm.nomor_spm || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Jenis SPM</p>
                      <p className="font-medium">{sp2d.spm.jenis_spm?.nama_jenis || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">OPD</p>
                      <p className="font-medium">{sp2d.spm.opd?.nama_opd || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bendahara</p>
                      <p className="font-medium">{sp2d.spm.bendahara?.full_name || "-"}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Uraian</p>
                    <p className="text-sm">{sp2d.spm.uraian || "-"}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tax Deductions */}
            {sp2d.potongan_pajak_sp2d && sp2d.potongan_pajak_sp2d.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Potongan Pajak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sp2d.potongan_pajak_sp2d.map((pajak: any, index: number) => (
                      <div key={index} className="flex justify-between items-start p-3 bg-accent/5 rounded-lg border">
                        <div className="flex-1">
                          <p className="font-medium">{pajak.jenis_pajak}</p>
                          <p className="text-sm text-muted-foreground">{pajak.uraian}</p>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Tarif: {pajak.tarif}%</span>
                            <span>DPP: {formatCurrency(pajak.dasar_pengenaan)}</span>
                          </div>
                        </div>
                        <p className="font-semibold text-red-600">
                          {formatCurrency(pajak.jumlah_pajak)}
                        </p>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between items-center pt-2">
                      <p className="font-semibold">Total Potongan:</p>
                      <p className="text-xl font-bold text-red-600">
                        {formatCurrency(sp2d.total_potongan || 0)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t-2 border-primary">
                      <p className="font-semibold text-lg">Nilai Diterima:</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(sp2d.nilai_diterima || sp2d.nilai_sp2d)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bank Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="w-5 h-5" />
                  Informasi Rekening
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nama Bank</p>
                  <p className="font-medium">{sp2d.nama_bank || "-"}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Nomor Rekening</p>
                  <p className="font-mono font-medium">{sp2d.nomor_rekening || "-"}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Nama Rekening</p>
                  <p className="font-medium">{sp2d.nama_rekening || "-"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BanknoteIcon className="w-5 h-5" />
                  Ringkasan Keuangan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Nilai SP2D</span>
                  <span className="font-semibold">{formatCurrency(sp2d.nilai_sp2d)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Potongan</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(sp2d.total_potongan || 0)}
                  </span>
                </div>
                <Separator className="border-primary/30" />
                <div className="flex justify-between items-center pt-2 border-t-2 border-primary">
                  <span className="font-semibold">Nilai Diterima</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(sp2d.nilai_diterima || sp2d.nilai_sp2d)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Key Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5" />
                  Tanggal Penting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal SP2D</p>
                  <p className="font-medium">
                    {sp2d.tanggal_sp2d ? format(new Date(sp2d.tanggal_sp2d), "dd MMMM yyyy", { locale: id }) : "-"}
                  </p>
                </div>
                {sp2d.tanggal_kirim_bank && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Kirim ke Bank</p>
                      <p className="font-medium">
                        {format(new Date(sp2d.tanggal_kirim_bank), "dd MMMM yyyy", { locale: id })}
                      </p>
                    </div>
                  </>
                )}
                {sp2d.tanggal_konfirmasi_bank && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Konfirmasi Bank</p>
                      <p className="font-medium">
                        {format(new Date(sp2d.tanggal_konfirmasi_bank), "dd MMMM yyyy", { locale: id })}
                      </p>
                      {sp2d.nomor_referensi_bank && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Ref: {sp2d.nomor_referensi_bank}
                        </p>
                      )}
                    </div>
                  </>
                )}
                {sp2d.tanggal_cair && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Tanggal Cair</p>
                      <p className="font-medium text-green-600">
                        {format(new Date(sp2d.tanggal_cair), "dd MMMM yyyy", { locale: id })}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Involved Parties */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5" />
                  Pihak Terkait
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sp2d.created_by && (
                  <div>
                    <p className="text-sm text-muted-foreground">Dibuat Oleh</p>
                    <p className="font-medium">ID: {sp2d.created_by}</p>
                  </div>
                )}
                {sp2d.kuasa_bud_id && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Kuasa BUD</p>
                      <p className="font-medium">ID: {sp2d.kuasa_bud_id}</p>
                    </div>
                  </>
                )}
                {sp2d.verified_by && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Diverifikasi Oleh</p>
                      <p className="font-medium">ID: {sp2d.verified_by}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {sp2d.catatan && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5" />
                    Catatan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{sp2d.catatan}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
