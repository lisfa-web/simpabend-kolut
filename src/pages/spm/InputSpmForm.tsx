import { useState } from "react";
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
  const { data: spmDetail } = useSpmDetail(id);
  const { data: opdList } = useOpdList();
  const { data: programList } = useProgramList();
  const { data: kegiatanList } = useKegiatanList(formData?.program_id);
  const { data: subkegiatanList } = useSubkegiatanList(formData?.kegiatan_id);
  const { data: vendorList } = useVendorList();

  const handleDataSubmit = (data: SpmDataFormValues) => {
    setFormData(data);
    setActiveTab("lampiran");
  };

  const handleFinalSubmit = async (isDraft: boolean) => {
    if (!formData) return;

    try {
      const spmData = {
        opd_id: formData.opd_id,
        program_id: formData.program_id,
        kegiatan_id: formData.kegiatan_id,
        subkegiatan_id: formData.subkegiatan_id,
        jenis_spm: formData.jenis_spm,
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
        await uploadFile(file, spmId, jenis);
      }

      navigate("/input-spm");
    } catch (error) {
      console.error("Error submitting SPM:", error);
    }
  };

  const opdName = opdList?.find((o) => o.id === formData?.opd_id)?.nama_opd;
  const programName = programList?.find((p) => p.id === formData?.program_id)?.nama_program;
  const kegiatanName = kegiatanList?.find((k) => k.id === formData?.kegiatan_id)?.nama_kegiatan;
  const subkegiatanName = subkegiatanList?.find((s) => s.id === formData?.subkegiatan_id)?.nama_subkegiatan;
  const vendorName = vendorList?.find((v) => v.id === formData?.vendor_id)?.nama_vendor;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">{id ? "Edit" : "Buat"} SPM</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="data">Data Dasar</TabsTrigger>
            <TabsTrigger value="lampiran" disabled={!formData}>
              Lampiran
            </TabsTrigger>
            <TabsTrigger value="review" disabled={!formData}>
              Review & Submit
            </TabsTrigger>
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
