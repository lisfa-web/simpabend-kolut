import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSpmDetail } from "@/hooks/useSpmDetail";
import { SpmStatusBadge } from "./components/SpmStatusBadge";
import { SpmTimeline } from "./components/SpmTimeline";
import { formatCurrency } from "@/lib/currency";
import { ArrowLeft, Download, Loader2, Eye, Edit, AlertCircle, Calculator } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { formatFileSize, isImageFile, isPdfFile } from "@/lib/fileValidation";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const InputSpmDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: spm, isLoading } = useSpmDetail(id);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loadingPreviews, setLoadingPreviews] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchPreviewUrls = async () => {
      if (!spm?.lampiran_spm || spm.lampiran_spm.length === 0) return;

      const urls: Record<string, string> = {};
      const loading: Record<string, boolean> = {};

      for (const lampiran of spm.lampiran_spm) {
        if (isImageFile(lampiran.nama_file) || isPdfFile(lampiran.nama_file)) {
          loading[lampiran.id] = true;
          try {
            // Use full path from file_url
            const { data, error } = await supabase.storage
              .from('spm-documents')
              .createSignedUrl(lampiran.file_url, 3600); // 1 hour expiry

            if (error) throw error;
            if (data?.signedUrl) {
              urls[lampiran.id] = data.signedUrl;
            }
          } catch (error) {
            console.error('Error fetching preview URL:', error);
          } finally {
            loading[lampiran.id] = false;
          }
        }
      }

      setPreviewUrls(urls);
      setLoadingPreviews(loading);
    };

    fetchPreviewUrls();
  }, [spm?.lampiran_spm]);

  const handleDownload = async (lampiran: any) => {
    try {
      // Use full path from file_url
      const { data, error } = await supabase.storage
        .from('spm-documents')
        .download(lampiran.file_url);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = lampiran.nama_file;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Gagal mengunduh file",
        variant: "destructive",
      });
    }
  };

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
            {/* Catatan Verifikasi */}
            {(spm.status === "perlu_revisi" || spm.status === "ditolak") && (
              <Card className="p-6 border-destructive bg-destructive/5">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-destructive">
                      {spm.status === "perlu_revisi" ? "SPM Perlu Revisi" : "SPM Ditolak"}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {spm.status === "perlu_revisi" 
                        ? "Silakan perbaiki SPM sesuai catatan di bawah ini" 
                        : "SPM ini telah ditolak dan tidak dapat diperbaiki. Silakan buat pengajuan SPM baru."}
                    </p>
                  </div>
                  {spm.status === "perlu_revisi" && (
                    <Button 
                      onClick={() => navigate(`/input-spm/edit/${spm.id}`)}
                      size="sm"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit & Perbaiki
                    </Button>
                  )}
                </div>
                <div className="space-y-3">
                  {spm.catatan_resepsionis && (
                    <div className="border-l-4 border-orange-500 pl-4 py-2">
                      <p className="text-sm font-medium">Resepsionis:</p>
                      <p className="text-sm text-muted-foreground">{spm.catatan_resepsionis}</p>
                    </div>
                  )}
                  {spm.catatan_pbmd && (
                    <div className="border-l-4 border-blue-500 pl-4 py-2">
                      <p className="text-sm font-medium">PBMD:</p>
                      <p className="text-sm text-muted-foreground">{spm.catatan_pbmd}</p>
                    </div>
                  )}
                  {spm.catatan_akuntansi && (
                    <div className="border-l-4 border-purple-500 pl-4 py-2">
                      <p className="text-sm font-medium">Akuntansi:</p>
                      <p className="text-sm text-muted-foreground">{spm.catatan_akuntansi}</p>
                    </div>
                  )}
                  {spm.catatan_perbendaharaan && (
                    <div className="border-l-4 border-green-500 pl-4 py-2">
                      <p className="text-sm font-medium">Perbendaharaan:</p>
                      <p className="text-sm text-muted-foreground">{spm.catatan_perbendaharaan}</p>
                    </div>
                  )}
                  {spm.catatan_kepala_bkad && (
                    <div className="border-l-4 border-red-500 pl-4 py-2">
                      <p className="text-sm font-medium">Kepala BKAD:</p>
                      <p className="text-sm text-muted-foreground">{spm.catatan_kepala_bkad}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

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

          {/* Potongan Pajak */}
          {spm.potongan_pajak_spm && spm.potongan_pajak_spm.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Potongan Pajak
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jenis Pajak</TableHead>
                    <TableHead>Rekening</TableHead>
                    <TableHead>Tarif</TableHead>
                    <TableHead>Dasar Pengenaan</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spm.potongan_pajak_spm.map((pajak: any) => (
                    <TableRow key={pajak.id}>
                      <TableCell className="font-medium">{pajak.uraian}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{pajak.rekening_pajak}</TableCell>
                      <TableCell>{pajak.tarif}%</TableCell>
                      <TableCell>{formatCurrency(pajak.dasar_pengenaan)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(pajak.jumlah_pajak)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator className="my-4" />
              
              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <div className="flex justify-between">
                  <span>Nilai SPM (Bruto):</span>
                  <span className="font-bold">{formatCurrency(spm.nilai_spm)}</span>
                </div>
                <div className="flex justify-between text-destructive">
                  <span>Total Potongan:</span>
                  <span className="font-bold">-{formatCurrency(spm.total_potongan || 0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Nilai Bersih (Netto):</span>
                  <span className="font-bold text-primary">{formatCurrency(spm.nilai_bersih || spm.nilai_spm)}</span>
                </div>
              </div>
            </Card>
          )}
          </TabsContent>

          <TabsContent value="lampiran" className="space-y-4">
            {spm.lampiran_spm?.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                Belum ada lampiran
              </Card>
            ) : (
              spm.lampiran_spm?.map((lampiran: any) => {
                const previewUrl = previewUrls[lampiran.id];
                const isLoading = loadingPreviews[lampiran.id];
                const isImage = isImageFile(lampiran.nama_file);
                const isPdf = isPdfFile(lampiran.nama_file);
                const canPreview = isImage || isPdf;

                return (
                  <Card key={lampiran.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{lampiran.nama_file}</p>
                          <p className="text-sm text-muted-foreground">
                            {lampiran.jenis_lampiran} • {formatFileSize(lampiran.file_size)}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleDownload(lampiran)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>

                      {canPreview && (
                        <div className="border rounded-lg overflow-hidden bg-muted/50">
                          {isLoading ? (
                            <div className="flex items-center justify-center h-48">
                              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                          ) : previewUrl ? (
                            isImage ? (
                              <div className="relative group cursor-pointer" onClick={() => setSelectedImage(previewUrl)}>
                                <img
                                  src={previewUrl}
                                  alt={lampiran.nama_file}
                                  className="w-full h-auto max-h-96 object-contain"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Eye className="h-8 w-8 text-white" />
                                </div>
                              </div>
                            ) : isPdf ? (
                              <iframe
                                src={previewUrl}
                                className="w-full h-[600px]"
                                title={lampiran.nama_file}
                              />
                            ) : null
                          ) : (
                            <div className="flex items-center justify-center h-48 text-muted-foreground">
                              Preview tidak tersedia
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="timeline">
            <Card className="p-6">
              <SpmTimeline currentStatus={spm.status} spm={spm} />
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl w-full p-0">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Preview"
              className="w-full h-auto"
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default InputSpmDetail;
