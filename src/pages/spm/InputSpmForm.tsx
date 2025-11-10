import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpmDataForm } from "./components/SpmDataForm";
import { SpmPajakForm } from "./components/SpmPajakForm";
import { SpmLampiranForm } from "./components/SpmLampiranForm";
import { SpmReviewForm } from "./components/SpmReviewForm";
import { SpmNomorForm } from "./components/SpmNomorForm";
import { SpmDataFormValues } from "@/schemas/spmSchema";
import { useSpmMutation } from "@/hooks/useSpmMutation";
import { useSpmDetail } from "@/hooks/useSpmDetail";
import { useOpdList } from "@/hooks/useOpdList";
import { useJenisSpmList } from "@/hooks/useJenisSpmList";
import { useVendorList } from "@/hooks/useVendorList";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SuccessSpmDialog } from "@/components/SuccessSpmDialog";

const InputSpmForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("data");
  const [formData, setFormData] = useState<SpmDataFormValues | null>(null);
  const [potonganPajak, setPotonganPajak] = useState<any[]>([]);
  const [selectedOptionalTaxIds, setSelectedOptionalTaxIds] = useState<string[]>([]);
  const [files, setFiles] = useState({
    dokumen_spm: [],
    tbk: [],
    spj: [],
    lainnya: [],
  });
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successData, setSuccessData] = useState<{ nomorSpm: string; spmId: string } | null>(null);

  const { createSpm, updateSpm, uploadFile } = useSpmMutation();
  const { data: spmDetail, isLoading: isLoadingSpm } = useSpmDetail(id);
  const { data: opdList } = useOpdList({ is_active: true });
  const { data: jenisSpmList } = useJenisSpmList({ is_active: true });
  const { data: vendorList } = useVendorList({ is_active: true });

  // Allow edit for draft and perlu_revisi status only
  // Block access for other statuses
  useEffect(() => {
    if (id && spmDetail) {
      const editableStatuses = ["draft", "perlu_revisi"];
      if (!editableStatuses.includes(spmDetail.status)) {
        toast({
          title: "Tidak Dapat Diedit",
          description: "SPM dengan status ini tidak dapat diedit. Hanya draft dan perlu revisi yang dapat diedit.",
          variant: "destructive",
        });
        navigate(`/input-spm/detail/${id}`);
      }
    }
  }, [id, spmDetail, navigate]);

  // Pre-fill form data saat mode edit
  useEffect(() => {
    if (id && spmDetail && !formData) {
      setFormData({
        opd_id: spmDetail.opd_id,
        jenis_spm_id: spmDetail.jenis_spm_id,
        nilai_spm: spmDetail.nilai_spm,
        uraian: spmDetail.uraian || '',
        tipe_penerima: (spmDetail.tipe_penerima as any) || undefined,
        nama_penerima: spmDetail.nama_penerima || undefined,
        tanggal_ajuan: new Date(spmDetail.tanggal_ajuan || new Date()),
        is_aset: spmDetail.is_aset || false,
        nomor_spm: spmDetail.nomor_spm || undefined,
      });
    }
  }, [id, spmDetail, formData]);

  // Initialize potongan pajak dari detail SPM saat edit
  useEffect(() => {
    if (id && spmDetail?.potongan_pajak_spm && potonganPajak.length === 0) {
      const mapped = (spmDetail.potongan_pajak_spm as any[]).map((p) => ({
        jenis_pajak: p.jenis_pajak,
        rekening_pajak: p.rekening_pajak || "",
        uraian: p.uraian || "",
        tarif: Number(p.tarif) || 0,
        dasar_pengenaan: Number(p.dasar_pengenaan) || 0,
        jumlah_pajak: Number(p.jumlah_pajak) || 0,
      }));
      setPotonganPajak(mapped);
    }
  }, [id, spmDetail, potonganPajak.length]);

  const handleToggleOptionalTax = (taxId: string, checked: boolean) => {
    setSelectedOptionalTaxIds(prev => 
      checked 
        ? [...prev, taxId]
        : prev.filter(id => id !== taxId)
    );
  };

  const handleDataSubmit = (data: SpmDataFormValues) => {
    setFormData(data);
    setActiveTab("pajak");
  };

  const handleNomorSubmit = (nomor: string) => {
    if (formData) {
      setFormData({ ...formData, nomor_spm: nomor });
      handleFinalSubmit(nomor);
    }
  };

  const handleFinalSubmit = async (nomorSpm: string) => {
    if (!formData) return;

    // Only allow saving for editable statuses
    if (id && spmDetail) {
      const editableStatuses = ["draft", "perlu_revisi"];
      if (!editableStatuses.includes(spmDetail.status)) {
        toast({
          title: "Tidak Dapat Disimpan",
          description: "SPM dengan status ini tidak dapat diubah.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const spmData = {
        opd_id: formData.opd_id,
        jenis_spm_id: formData.jenis_spm_id,
        nilai_spm: formData.nilai_spm,
        uraian: formData.uraian,
        tipe_penerima: formData.tipe_penerima,
        nama_penerima: formData.nama_penerima,
        is_aset: formData.is_aset || false,
        nomor_spm: nomorSpm,
        status: "draft",
        tanggal_ajuan: formData.tanggal_ajuan, // Simpan tanggal dari user input
        potongan_pajak: potonganPajak,
      };

      const result = id
        ? await updateSpm.mutateAsync({ id, data: spmData })
        : await createSpm.mutateAsync(spmData);

      const spmId = result.id;

      // Upload files dengan error handling yang lebih baik
      const allFiles = [
        ...files.dokumen_spm.map((f: any) => ({ file: f, jenis: "spm" })),
        ...files.tbk.map((f: any) => ({ file: f, jenis: "tbk" })),
        ...files.spj.map((f: any) => ({ file: f, jenis: "spj" })),
        ...files.lainnya.map((f: any) => ({ file: f, jenis: "lainnya" })),
      ];

      const uploadResults = [];
      const uploadErrors = [];

      for (const { file, jenis } of allFiles) {
        try {
          const uploaded = await uploadFile(file, spmId, jenis);
          uploadResults.push({ file: file.name, success: true });
        } catch (uploadError: any) {
          console.error(`Gagal upload file ${file.name}:`, uploadError);
          uploadErrors.push({ file: file.name, error: uploadError.message });
        }
      }

      // Notify user about upload results
      if (uploadErrors.length > 0) {
        toast({
          title: "Peringatan Upload",
          description: `${uploadErrors.length} file gagal diupload. Silakan upload ulang dari halaman edit.`,
          variant: "destructive",
        });
      }

      // Show success dialog instead of immediate navigation
      setSuccessData({ nomorSpm, spmId });
      setShowSuccessDialog(true);
    } catch (error: any) {
      console.error("Error submitting SPM:", error);
      toast({
        title: "Gagal Menyimpan SPM",
        description: error.message || "Terjadi kesalahan saat menyimpan SPM",
        variant: "destructive",
      });
    }
  };

  const opdName = opdList?.find((o) => o.id === formData?.opd_id)?.nama_opd;
  const jenisSpmData = jenisSpmList?.find((j) => j.id === formData?.jenis_spm_id);
  const jenisSpmName = jenisSpmData?.nama_jenis;

  // Tampilkan loading saat fetch data SPM untuk mode edit
  if (id && isLoadingSpm) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const handleSaveDraft = async () => {
    if (!formData) {
      toast({
        title: "Belum Ada Data",
        description: "Silakan isi data dasar terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    // Generate temporary nomor for draft
    const tempNomor = `DRAFT-${Date.now()}`;
    await handleFinalSubmit(tempNomor);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{id ? "Edit" : "Buat"} SPM</h1>
            <p className="text-muted-foreground">
              Lengkapi 5 tahap berikut untuk membuat SPM baru
            </p>
          </div>
          {formData && activeTab !== "nomor" && (
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={createSpm.isPending || updateSpm.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              Simpan Draft
            </Button>
          )}
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${activeTab === "data" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              1
            </div>
            <span className={`text-sm font-medium ${activeTab === "data" ? "text-foreground" : "text-muted-foreground"}`}>
              Data Dasar
            </span>
          </div>
          <div className={`flex-1 h-0.5 mx-4 ${formData ? "bg-primary" : "bg-muted"}`} />
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${activeTab === "pajak" ? "bg-primary text-primary-foreground" : formData ? "bg-muted-foreground/20 text-muted-foreground" : "bg-muted text-muted-foreground"}`}>
              2
            </div>
            <span className={`text-sm font-medium ${activeTab === "pajak" ? "text-foreground" : formData ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
              Potongan Pajak
            </span>
          </div>
          <div className={`flex-1 h-0.5 mx-4 ${potonganPajak.length > 0 || activeTab === "lampiran" || activeTab === "review" ? "bg-primary" : "bg-muted"}`} />
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${activeTab === "lampiran" ? "bg-primary text-primary-foreground" : formData ? "bg-muted-foreground/20 text-muted-foreground" : "bg-muted text-muted-foreground"}`}>
              3
            </div>
            <span className={`text-sm font-medium ${activeTab === "lampiran" ? "text-foreground" : formData ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
              Lampiran
            </span>
          </div>
          <div className={`flex-1 h-0.5 mx-4 ${activeTab === "review" || activeTab === "nomor" ? "bg-primary" : "bg-muted"}`} />
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${activeTab === "review" ? "bg-primary text-primary-foreground" : formData ? "bg-muted-foreground/20 text-muted-foreground" : "bg-muted text-muted-foreground"}`}>
              4
            </div>
            <span className={`text-sm font-medium ${activeTab === "review" ? "text-foreground" : formData ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
              Review Data
            </span>
          </div>
          <div className={`flex-1 h-0.5 mx-4 ${activeTab === "nomor" ? "bg-primary" : "bg-muted"}`} />
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${activeTab === "nomor" ? "bg-primary text-primary-foreground" : formData ? "bg-muted-foreground/20 text-muted-foreground" : "bg-muted text-muted-foreground"}`}>
              5
            </div>
            <span className={`text-sm font-medium ${activeTab === "nomor" ? "text-foreground" : formData ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
              Nomor SPM
            </span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hidden">
            <TabsTrigger value="data">Data Dasar</TabsTrigger>
            <TabsTrigger value="pajak">Potongan Pajak</TabsTrigger>
            <TabsTrigger value="lampiran">Lampiran</TabsTrigger>
            <TabsTrigger value="review">Review Data</TabsTrigger>
            <TabsTrigger value="nomor">Nomor SPM</TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="mt-6">
            <SpmDataForm
              defaultValues={formData || undefined}
              onSubmit={handleDataSubmit}
              onBack={() => navigate("/input-spm")}
              selectedOptionalTaxIds={selectedOptionalTaxIds}
              onToggleOptionalTax={handleToggleOptionalTax}
            />
          </TabsContent>

          <TabsContent value="pajak" className="mt-6">
            {formData && jenisSpmData && (
              <SpmPajakForm
                jenisSpm={jenisSpmData.nama_jenis}
                adaPajak={jenisSpmData.ada_pajak}
                nilaiSpm={formData.nilai_spm}
                potonganPajak={potonganPajak}
                onPotonganChange={setPotonganPajak}
                onNext={() => setActiveTab("lampiran")}
                onBack={() => setActiveTab("data")}
                initialSelectedOptionalTaxes={selectedOptionalTaxIds}
              />
            )}
          </TabsContent>

          <TabsContent value="lampiran" className="mt-6">
            <SpmLampiranForm
              jenisSpm={jenisSpmData?.nama_jenis}
              spmId={id}
              files={files}
              onFilesChange={setFiles}
              onNext={() => setActiveTab("review")}
              onBack={() => setActiveTab("pajak")}
              existingLampiran={(spmDetail as any)?.lampiran_spm || []}
            />
          </TabsContent>

          <TabsContent value="review" className="mt-6">
            {formData && (
              <SpmReviewForm
                formData={formData}
                files={files}
                potonganPajak={potonganPajak}
                opdName={opdName}
                jenisSpmLabel={jenisSpmName}
                onNext={() => setActiveTab("nomor")}
                onBack={() => setActiveTab("lampiran")}
              />
            )}
          </TabsContent>

          <TabsContent value="nomor" className="mt-6">
            {formData && (
              <SpmNomorForm
                initialNomor={formData.nomor_spm}
                onSubmit={handleNomorSubmit}
                onBack={() => setActiveTab("review")}
                isSubmitting={createSpm.isPending || updateSpm.isPending}
                spmId={id}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Success Dialog */}
      {successData && (
        <SuccessSpmDialog
          open={showSuccessDialog}
          onOpenChange={setShowSuccessDialog}
          nomorSpm={successData.nomorSpm}
          spmId={successData.spmId}
        />
      )}
    </DashboardLayout>
  );
};

export default InputSpmForm;
