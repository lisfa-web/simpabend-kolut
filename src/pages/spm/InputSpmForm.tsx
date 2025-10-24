import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpmDataForm } from "./components/SpmDataForm";
import { SpmLampiranForm } from "./components/SpmLampiranForm";
import { SpmReviewForm } from "./components/SpmReviewForm";
import { SpmDataFormValues } from "@/schemas/spmSchema";
import { useSpmMutation } from "@/hooks/useSpmMutation";
import { useSpmDetail } from "@/hooks/useSpmDetail";
import { useOpdList } from "@/hooks/useOpdList";
import { useProgramList } from "@/hooks/useProgramList";
import { useKegiatanList } from "@/hooks/useKegiatanList";
import { useSubkegiatanList } from "@/hooks/useSubkegiatanList";
import { useVendorList } from "@/hooks/useVendorList";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const InputSpmForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("data");
  const [formData, setFormData] = useState<SpmDataFormValues | null>(null);
  const [files, setFiles] = useState({
    dokumen_spm: [],
    tbk: [],
    spj: [],
    lainnya: [],
  });

  const { createSpm, updateSpm, uploadFile } = useSpmMutation();
  const { data: spmDetail, isLoading: isLoadingSpm } = useSpmDetail(id);
  const { data: opdList } = useOpdList({ is_active: true });
  const { data: programList } = useProgramList({ is_active: true });
  const { data: kegiatanList } = useKegiatanList({ program_id: formData?.program_id, is_active: true });
  const { data: subkegiatanList } = useSubkegiatanList({ kegiatan_id: formData?.kegiatan_id, is_active: true });
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
      const convertDbJenisSpmToFormFormat = (jenis: string): 'up' | 'gu' | 'tu' | 'ls_gaji' | 'ls_barang_jasa' | 'ls_belanja_modal' => {
        const mapping: Record<string, 'up' | 'gu' | 'tu' | 'ls_gaji' | 'ls_barang_jasa' | 'ls_belanja_modal'> = {
          'UP': 'up',
          'GU': 'gu',
          'TU': 'tu',
          'LS_Gaji': 'ls_gaji',
          'LS_Barang_Jasa': 'ls_barang_jasa',
          'LS_Belanja_Modal': 'ls_belanja_modal'
        };
        return mapping[jenis] || 'up';
      };

      setFormData({
        opd_id: spmDetail.opd_id,
        program_id: spmDetail.program_id,
        kegiatan_id: spmDetail.kegiatan_id,
        subkegiatan_id: spmDetail.subkegiatan_id,
        jenis_spm: convertDbJenisSpmToFormFormat(spmDetail.jenis_spm),
        nilai_spm: spmDetail.nilai_spm,
        uraian: spmDetail.uraian || '',
        vendor_id: spmDetail.vendor_id || undefined,
        tanggal_ajuan: new Date(spmDetail.tanggal_ajuan || new Date()),
      });
    }
  }, [id, spmDetail, formData]);

  const convertJenisSpmToDbFormat = (jenis: string): string => {
    const mapping: Record<string, string> = {
      'up': 'UP',
      'gu': 'GU',
      'tu': 'TU',
      'ls_gaji': 'LS_Gaji',
      'ls_barang_jasa': 'LS_Barang_Jasa',
      'ls_belanja_modal': 'LS_Belanja_Modal'
    };
    return mapping[jenis] || jenis;
  };

  const handleDataSubmit = (data: SpmDataFormValues) => {
    setFormData(data);
    setActiveTab("lampiran");
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
        program_id: formData.program_id,
        kegiatan_id: formData.kegiatan_id,
        subkegiatan_id: formData.subkegiatan_id,
        jenis_spm: convertJenisSpmToDbFormat(formData.jenis_spm),
        nilai_spm: formData.nilai_spm,
        uraian: formData.uraian,
        vendor_id: formData.vendor_id,
        status: isDraft ? "draft" : "diajukan",
        tanggal_ajuan: isDraft ? null : new Date().toISOString(),
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
  const programName = programList?.find((p) => p.id === formData?.program_id)?.nama_program;
  const kegiatanName = kegiatanList?.find((k) => k.id === formData?.kegiatan_id)?.nama_kegiatan;
  const subkegiatanName = subkegiatanList?.find((s) => s.id === formData?.subkegiatan_id)?.nama_subkegiatan;
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
            Lengkapi 3 tahap berikut untuk membuat SPM baru
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
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${activeTab === "lampiran" ? "bg-primary text-primary-foreground" : formData ? "bg-muted-foreground/20 text-muted-foreground" : "bg-muted text-muted-foreground"}`}>
              2
            </div>
            <span className={`text-sm font-medium ${activeTab === "lampiran" ? "text-foreground" : formData ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
              Lampiran
            </span>
          </div>
          <div className={`flex-1 h-0.5 mx-4 ${activeTab === "review" ? "bg-primary" : "bg-muted"}`} />
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${activeTab === "review" ? "bg-primary text-primary-foreground" : formData ? "bg-muted-foreground/20 text-muted-foreground" : "bg-muted text-muted-foreground"}`}>
              3
            </div>
            <span className={`text-sm font-medium ${activeTab === "review" ? "text-foreground" : formData ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
              Review & Submit
            </span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hidden">
            <TabsTrigger value="data">Data Dasar</TabsTrigger>
            <TabsTrigger value="lampiran">Lampiran</TabsTrigger>
            <TabsTrigger value="review">Review & Submit</TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="mt-6">
            <SpmDataForm
              defaultValues={formData || undefined}
              onSubmit={handleDataSubmit}
              onBack={() => navigate("/input-spm")}
            />
          </TabsContent>

          <TabsContent value="lampiran" className="mt-6">
            <SpmLampiranForm
              jenisSpm={formData?.jenis_spm}
              files={files}
              onFilesChange={setFiles}
              onNext={() => setActiveTab("review")}
              onBack={() => setActiveTab("data")}
            />
          </TabsContent>

          <TabsContent value="review" className="mt-6">
            {formData && (
              <SpmReviewForm
                formData={formData}
                files={files}
                opdName={opdName}
                programName={programName}
                kegiatanName={kegiatanName}
                subkegiatanName={subkegiatanName}
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
