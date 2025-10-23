import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSpmDetail } from "@/hooks/useSpmDetail";
import { SpmStatusBadge } from "./components/SpmStatusBadge";
import { SpmTimeline } from "./components/SpmTimeline";
import { formatCurrency } from "@/lib/currency";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { formatFileSize } from "@/lib/fileValidation";

const InputSpmDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: spm, isLoading } = useSpmDetail(id);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!spm) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">SPM tidak ditemukan</p>
          <Button onClick={() => navigate("/input-spm")} className="mt-4">
            Kembali
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/input-spm")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Detail SPM</h1>
            <p className="text-muted-foreground">{spm.nomor_spm || "Draft"}</p>
          </div>
          <SpmStatusBadge status={spm.status} className="text-lg px-4 py-2" />
        </div>

        <Tabs defaultValue="info">
          <TabsList>
            <TabsTrigger value="info">Informasi</TabsTrigger>
            <TabsTrigger value="lampiran">Lampiran</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Data SPM</h3>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">OPD</dt>
                  <dd className="font-medium">{spm.opd?.nama_opd}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Program</dt>
                  <dd className="font-medium">{spm.program?.nama_program}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Kegiatan</dt>
                  <dd className="font-medium">{spm.kegiatan?.nama_kegiatan}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Sub Kegiatan</dt>
                  <dd className="font-medium">{spm.subkegiatan?.nama_subkegiatan}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Jenis SPM</dt>
                  <dd className="font-medium">{spm.jenis_spm?.toUpperCase()}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Nilai SPM</dt>
                  <dd className="font-medium text-lg">{formatCurrency(spm.nilai_spm)}</dd>
                </div>
                {spm.vendor && (
                  <div className="col-span-2">
                    <dt className="text-sm text-muted-foreground">Vendor</dt>
                    <dd className="font-medium">{spm.vendor.nama_vendor}</dd>
                  </div>
                )}
                <div className="col-span-2">
                  <dt className="text-sm text-muted-foreground">Uraian</dt>
                  <dd className="font-medium">{spm.uraian}</dd>
                </div>
              </dl>
            </Card>
          </TabsContent>

          <TabsContent value="lampiran" className="space-y-4">
            {spm.lampiran_spm?.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                Belum ada lampiran
              </Card>
            ) : (
              spm.lampiran_spm?.map((lampiran: any) => (
                <Card key={lampiran.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{lampiran.nama_file}</p>
                      <p className="text-sm text-muted-foreground">
                        {lampiran.jenis_lampiran} • {formatFileSize(lampiran.file_size)}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="timeline">
            <Card className="p-6">
              <SpmTimeline currentStatus={spm.status} spm={spm} />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default InputSpmDetail;
