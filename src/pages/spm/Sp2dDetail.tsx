import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, CheckCircle2, Printer, Wallet, FileCheck, Info } from "lucide-react";
import { useSp2dDetail } from "@/hooks/useSp2dDetail";
import { useSp2dMutation } from "@/hooks/useSp2dMutation";
import { useConfigSistem } from "@/hooks/useConfigSistem";
import { usePajakPotongan } from "@/hooks/usePajakPotongan";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { Sp2dStatusBadge } from "./components/Sp2dStatusBadge";
import { Sp2dTimeline } from "./components/Sp2dTimeline";
import { Sp2dVerificationDialog } from "./components/Sp2dVerificationDialog";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { generateSp2dPDF } from "@/lib/sp2dPdfUtils";

const Sp2dDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { roles, user } = useAuth();
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);

  const { data: sp2d, isLoading } = useSp2dDetail(id);
  const { data: configs } = useConfigSistem();
  const { verifyOtp, disburseSp2d, sendToBank, confirmFromBank } = useSp2dMutation();
  const { potonganList } = usePajakPotongan(id);

  const canVerify = roles.some((role) =>
    ["kuasa_bud", "administrator"].includes(role)
  );

  const handleVerify = (otp: string) => {
    if (id) {
      verifyOtp.mutate(
        { id, otp },
        {
          onSuccess: () => {
            setShowVerifyDialog(false);
          },
        }
      );
    }
  };

  const handleDisburse = () => {
    if (id) {
      disburseSp2d.mutate(id);
    }
  };

  const handleSendToBank = () => {
    if (id) {
      sendToBank.mutate(id);
    }
  };

  const handleConfirmFromBank = () => {
    if (id) {
      confirmFromBank.mutate(id);
    }
  };

  const handlePrint = () => {
    if (!sp2d) return;
    
    const kopSuratUrl = configs?.find(
      c => c.key === 'kop_surat_sp2d_url'
    )?.value;
    
    const sp2dWithPajak = {
      ...sp2d,
      potongan_pajak: potonganList,
    };
    
    generateSp2dPDF(sp2dWithPajak, kopSuratUrl);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!sp2d) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">SP2D tidak ditemukan</p>
          <Button onClick={() => navigate("/sp2d")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/sp2d")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground">
                  {sp2d.nomor_sp2d || "SP2D"}
                </h1>
                <Sp2dStatusBadge status={sp2d.status || "pending"} />
              </div>
              <p className="text-muted-foreground">Detail SP2D</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Cetak
            </Button>
          </div>
        </div>

        {/* Print Header - Only visible when printing */}
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">SURAT PERINTAH PENCAIRAN DANA (SP2D)</h1>
          <p className="text-lg font-semibold">{sp2d.nomor_sp2d}</p>
          <div className="mt-2">
            <Sp2dStatusBadge status={sp2d.status || "pending"} />
          </div>
        </div>

        <Tabs defaultValue="informasi" className="space-y-4 print:block">
          <TabsList className="print:hidden">
            <TabsTrigger value="informasi">Informasi</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            {sp2d.status === "pending" && canVerify && (
              <TabsTrigger value="verifikasi">Verifikasi</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="informasi" className="space-y-4 print:block print:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi SP2D</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nomor SP2D</p>
                    <p className="font-medium">{sp2d.nomor_sp2d || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tanggal SP2D</p>
                    <p className="font-medium">
                      {sp2d.tanggal_sp2d
                        ? format(new Date(sp2d.tanggal_sp2d), "dd MMMM yyyy", {
                            locale: localeId,
                          })
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nomor SPM</p>
                    <p className="font-medium">{sp2d.spm?.nomor_spm || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nilai SP2D</p>
                    <p className="font-semibold text-lg">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(Number(sp2d.nilai_sp2d))}
                    </p>
                  </div>
                </div>

                {(sp2d as any).dokumen_sp2d_url && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">Dokumen SP2D</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open((sp2d as any).dokumen_sp2d_url, '_blank')}
                    >
                      <FileCheck className="h-4 w-4 mr-2" />
                      Lihat Dokumen
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data OPD</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">OPD</p>
                    <p className="font-medium">{sp2d.spm?.opd?.nama_opd || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Jenis SPM</p>
                    <p className="font-medium">
                      {(sp2d.spm as any)?.jenis_spm?.nama_jenis || "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Nilai SP2D</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-lg">
                  <span className="font-medium">Nilai SP2D:</span>
                  <span className="font-semibold">
                    {formatCurrency(Number(sp2d.nilai_sp2d))}
                  </span>
                </div>
                <div className="flex justify-between text-destructive">
                  <span className="font-medium">Total Potongan:</span>
                  <span className="font-semibold">
                    - {formatCurrency(Number(sp2d.total_potongan || 0))}
                  </span>
                </div>
                <div className="flex justify-between text-xl border-t pt-3">
                  <span className="font-bold">Nilai Diterima:</span>
                  <span className="font-bold text-primary">
                    {formatCurrency(Number(sp2d.nilai_diterima || sp2d.nilai_sp2d))}
                  </span>
                </div>
              </CardContent>
            </Card>

            {potonganList && potonganList.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Potongan Pajak</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {potonganList.map((pajak: any, index: number) => (
                      <div key={pajak.id} className="flex items-start justify-between p-3 bg-muted rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {pajak.jenis_pajak.toUpperCase().replace(/_/g, ' ')}
                            </Badge>
                            {pajak.rekening_pajak && (
                              <span className="text-xs text-muted-foreground">
                                Rek: {pajak.rekening_pajak}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium">{pajak.uraian}</p>
                          <p className="text-xs text-muted-foreground">
                            Tarif: {pajak.tarif}% × {formatCurrency(Number(pajak.dasar_pengenaan))}
                          </p>
                        </div>
                        <span className="font-semibold text-destructive">
                          {formatCurrency(Number(pajak.jumlah_pajak))}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {sp2d.catatan && (
              <Card>
                <CardHeader>
                  <CardTitle>Catatan</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{sp2d.catatan}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="print:hidden">
            <Card>
              <CardHeader>
                <CardTitle>Timeline SP2D</CardTitle>
              </CardHeader>
              <CardContent>
                <Sp2dTimeline
                  createdAt={sp2d.created_at}
                  otpVerifiedAt={sp2d.otp_verified_at}
                  tanggalCair={sp2d.tanggal_cair}
                  status={sp2d.status || "pending"}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {sp2d.status === "pending" && canVerify && (
            <TabsContent value="verifikasi" className="print:hidden">
              <Card>
                <CardHeader>
                  <CardTitle>Verifikasi OTP</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    SP2D ini memerlukan verifikasi OTP sebelum dana dapat dicairkan.
                    Klik tombol di bawah untuk melakukan verifikasi.
                  </p>
                  <Button onClick={() => setShowVerifyDialog(true)}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Verifikasi OTP
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {sp2d.status === "diterbitkan" && canVerify && (
          <Card className="border-success print:hidden">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">SP2D Terverifikasi</h3>
                  <p className="text-muted-foreground">
                    SP2D telah diverifikasi dan siap untuk dicairkan
                  </p>
                </div>
                <Button onClick={handleDisburse} disabled={disburseSp2d.isPending}>
                  <Wallet className="h-4 w-4 mr-2" />
                  {disburseSp2d.isPending ? "Memproses..." : "Cairkan Dana"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {sp2d.status === "cair" && (
          <Card className="border-success bg-success/5 print:hidden">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-success" />
                <div>
                  <h3 className="font-semibold text-lg">Dana Telah Dicairkan</h3>
                  <p className="text-muted-foreground">
                    Dana telah dicairkan pada{" "}
                    {sp2d.tanggal_cair
                      ? format(new Date(sp2d.tanggal_cair), "dd MMMM yyyy, HH:mm", {
                          locale: localeId,
                        })
                      : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Sp2dVerificationDialog
        open={showVerifyDialog}
        onOpenChange={setShowVerifyDialog}
        onVerify={handleVerify}
        loading={verifyOtp.isPending}
        sp2dId={id || ""}
        userId={user?.id || ""}
      />

      {/* Print styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          
          .print\\:block, 
          .print\\:block * {
            visibility: visible;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          @page {
            size: A4;
            margin: 2cm;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Sp2dDetail;
