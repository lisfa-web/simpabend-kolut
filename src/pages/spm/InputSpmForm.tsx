import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpmDataForm } from "./components/SpmDataForm";
import { SpmPajakForm } from "./components/SpmPajakForm";
import { SpmLampiranForm } from "./components/SpmLampiranForm";
import { SpmReviewForm } from "./components/SpmReviewForm";
import { SpmDataFormValues } from "@/schemas/spmSchema";
import { useSpmMutation } from "@/hooks/useSpmMutation";
import { useSpmDetail } from "@/hooks/useSpmDetail";
import { useOpdList } from "@/hooks/useOpdList";
import { useJenisSpmList } from "@/hooks/useJenisSpmList";
import { useVendorList } from "@/hooks/useVendorList";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

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

  const { createSpm, updateSpm, uploadFile } = useSpmMutation();
  const { data: spmDetail, isLoading: isLoadingSpm } = useSpmDetail(id);
  const { data: opdList } = useOpdList({ is_active: true });
  const { data: jenisSpmList } = useJenisSpmList({ is_active: true });
  const { data: vendorList } = useVendorList({ is_active: true });

  // Block access if SPM status is "ditolak"
  useEffect(() => {
    if (id && spmDetail && spmDetail.status === "ditolak") {
      toast({
        title: "Tidak Dapat Diedit",
        description: "SPM yang ditolak tidak dapat diedit. Silakan buat pengajuan SPM baru.",
        variant: "destructive",
      });
      navigate(`/input-spm/detail/${id}`);
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
        vendor_id: spmDetail.vendor_id || undefined,
        tanggal_ajuan: new Date(spmDetail.tanggal_ajuan || new Date()),
        is_aset: spmDetail.is_aset || false,
        nomor_spm: spmDetail.nomor_spm || undefined,
      });
    }
  }, [id, spmDetail, formData]);

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

  const handleFinalSubmit = async (isDraft: boolean) => {
    if (!formData) return;

    // Defensive check: prevent saving/submitting if status is "ditolak"
    if (id && spmDetail && spmDetail.status === "ditolak") {
      toast({
        title: "Tidak Dapat Disimpan",
        description: "SPM yang ditolak tidak dapat diedit atau diajukan ulang.",
        variant: "destructive",
      });
      return;
    }

    try {
      const spmData = {
        opd_id: formData.opd_id,
        jenis_spm_id: formData.jenis_spm_id,
        nilai_spm: formData.nilai_spm,
        uraian: formData.uraian,
        vendor_id: formData.vendor_id,
        is_aset: formData.is_aset || false,
        nomor_spm: formData.nomor_spm,
        status: isDraft ? "draft" : "diajukan",
        tanggal_ajuan: isDraft ? null : new Date().toISOString(),
        potongan_pajak: potonganPajak,
      };

      const result = id
        ? await updateSpm.mutateAsync({ id, data: spmData })
        : await createSpm.mutateAsync(spmData);

      const spmId = result.id;

      // Upload files
      const allFiles = [
        ...files.dokumen_spm.map((f: any) => ({ file: f, jenis: "spm" })),
        ...files.tbk.map((f: any) => ({ file: f, jenis: "tbk" })),
        ...files.spj.map((f: any) => ({ file: f, jenis: "spj" })),
        ...files.lainnya.map((f: any) => ({ file: f, jenis: "lainnya" })),
      ];

      for (const { file, jenis } of allFiles) {
        try {
          await uploadFile(file, spmId, jenis);
        } catch (uploadError: any) {
          console.error(`Gagal upload file ${file.name}:`, uploadError);
          toast({
            title: "Peringatan",
            description: `File ${file.name} gagal diupload: ${uploadError.message}`,
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Berhasil",
        description: isDraft ? "SPM berhasil disimpan sebagai draft" : "SPM berhasil diajukan untuk verifikasi",
      });

      navigate("/input-spm");
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
  const jenisSpmName = jenisSpmList?.find((j) => j.id === formData?.jenis_spm_id)?.nama_jenis;
  const vendorName = vendorList?.find((v) => v.id === formData?.vendor_id)?.nama_vendor;

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

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{id ? "Edit" : "Buat"} SPM</h1>
          <p className="text-muted-foreground">
            Lengkapi 4 tahap berikut untuk membuat SPM baru
          </p>
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
          <div className={`flex-1 h-0.5 mx-4 ${activeTab === "review" ? "bg-primary" : "bg-muted"}`} />
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${activeTab === "review" ? "bg-primary text-primary-foreground" : formData ? "bg-muted-foreground/20 text-muted-foreground" : "bg-muted text-muted-foreground"}`}>
              4
            </div>
            <span className={`text-sm font-medium ${activeTab === "review" ? "text-foreground" : formData ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
              Review & Submit
            </span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hidden">
            <TabsTrigger value="data">Data Dasar</TabsTrigger>
            <TabsTrigger value="pajak">Potongan Pajak</TabsTrigger>
            <TabsTrigger value="lampiran">Lampiran</TabsTrigger>
            <TabsTrigger value="review">Review & Submit</TabsTrigger>
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
            {formData && (
              <SpmPajakForm
                jenisSpm={formData.jenis_spm_id}
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
              jenisSpm={formData?.jenis_spm_id}
              files={files}
              onFilesChange={setFiles}
              onNext={() => setActiveTab("review")}
              onBack={() => setActiveTab("pajak")}
            />
          </TabsContent>

          <TabsContent value="review" className="mt-6">
            {formData && (
              <SpmReviewForm
                formData={formData}
                files={files}
                potonganPajak={potonganPajak}
                opdName={opdName}
                jenisSpmLabel={jenisSpmLabel}
                vendorName={vendorName}
                onSubmit={handleFinalSubmit}
                onBack={() => setActiveTab("lampiran")}
                isSubmitting={createSpm.isPending || updateSpm.isPending}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default InputSpmForm;
