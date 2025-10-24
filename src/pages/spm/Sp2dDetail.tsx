import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, CheckCircle2, Printer, Wallet } from "lucide-react";
import { useSp2dDetail } from "@/hooks/useSp2dDetail";
import { useSp2dMutation } from "@/hooks/useSp2dMutation";
import { Sp2dStatusBadge } from "./components/Sp2dStatusBadge";
import { Sp2dTimeline } from "./components/Sp2dTimeline";
import { Sp2dVerificationDialog } from "./components/Sp2dVerificationDialog";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";

const Sp2dDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { roles, user } = useAuth();
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);

  const { data: sp2d, isLoading } = useSp2dDetail(id);
  const { verifyOtp, disburseSp2d } = useSp2dMutation();

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
        <div className="flex items-center justify-between">
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
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Cetak
            </Button>
          </div>
        </div>

        <Tabs defaultValue="informasi" className="space-y-4">
          <TabsList>
            <TabsTrigger value="informasi">Informasi</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            {sp2d.status === "pending" && canVerify && (
              <TabsTrigger value="verifikasi">Verifikasi</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="informasi" className="space-y-4">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data OPD & Program</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">OPD</p>
                    <p className="font-medium">{sp2d.spm?.opd?.nama_opd || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Program</p>
                    <p className="font-medium">
                      {sp2d.spm?.program?.nama_program || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Kegiatan</p>
                    <p className="font-medium">
                      {sp2d.spm?.kegiatan?.nama_kegiatan || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sub Kegiatan</p>
                    <p className="font-medium">
                      {sp2d.spm?.subkegiatan?.nama_subkegiatan || "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informasi Bank Penerima</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nama Bank</p>
                    <p className="font-medium">{sp2d.nama_bank || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nomor Rekening</p>
                    <p className="font-medium">{sp2d.nomor_rekening || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nama Rekening</p>
                    <p className="font-medium">{sp2d.nama_rekening || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Penerima (Vendor)
                    </p>
                    <p className="font-medium">
                      {sp2d.spm?.vendor?.nama_vendor || "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

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

          <TabsContent value="timeline">
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
            <TabsContent value="verifikasi">
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
          <Card className="border-success">
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
          <Card className="border-success bg-success/5">
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
    </DashboardLayout>
  );
};

export default Sp2dDetail;
