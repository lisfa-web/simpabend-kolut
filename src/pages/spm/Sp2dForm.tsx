import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2, Info, Upload, FileCheck } from "lucide-react";
import { useSp2dMutation } from "@/hooks/useSp2dMutation";
import { useAuth } from "@/hooks/useAuth";
import { useGenerateSp2dNumber } from "@/hooks/useGenerateSp2dNumber";
import { formatCurrency, parseCurrency } from "@/lib/currency";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { JENIS_PAJAK_OPTIONS, getSuggestedTaxes } from "@/hooks/usePajakPotongan";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CurrencyInput } from "./components/CurrencyInput";
import { toast } from "sonner";

interface PajakFormData {
  jenis_pajak: string;
  rekening_pajak: string;
  uraian: string;
  tarif: number;
  dasar_pengenaan: number;
  jumlah_pajak: number;
}

interface Sp2dFormData {
  spm_id: string;
  nomor_sp2d: string;
  tanggal_sp2d: string;
  nilai_sp2d: number;
  dokumen_sp2d_file?: File;
  catatan?: string;
  potongan_pajak: PajakFormData[];
}

const Sp2dForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [selectedSpm, setSelectedSpm] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Get SPM ID from route state
  const routeSpmId = location.state?.spmId;

  // Fetch specific SPM if ID is provided
  const { data: spmData } = useQuery({
    queryKey: ["spm-detail", routeSpmId],
    queryFn: async () => {
      if (!routeSpmId) return null;
      
      const { data, error } = await supabase
        .from("spm")
        .select(`
          *,
          opd:opd_id(nama_opd),
          jenis_spm:jenis_spm_id(nama_jenis),
          vendor:vendor_id(nama_vendor, nama_bank, nomor_rekening, nama_rekening),
          potongan_pajak_spm(*)
        `)
        .eq("id", routeSpmId)
        .eq("status", "disetujui")
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!routeSpmId && !!user?.id,
  });

  const { createSp2d } = useSp2dMutation();

  const form = useForm<Sp2dFormData>({
    defaultValues: {
      spm_id: routeSpmId || "",
      nomor_sp2d: "",
      tanggal_sp2d: new Date().toISOString().split("T")[0],
      nilai_sp2d: 0,
      catatan: "",
      potongan_pajak: [],
    },
  });

  const watchPotonganPajak = form.watch("potongan_pajak");
  const watchNilaiSp2d = form.watch("nilai_sp2d");

  // Calculate totals
  const totalPotongan = watchPotonganPajak.reduce(
    (sum, p) => sum + (p.jumlah_pajak || 0),
    0
  );
  const nilaiDiterima = watchNilaiSp2d - totalPotongan;

  // Load SPM data when available
  useEffect(() => {
    if (spmData) {
      setSelectedSpm(spmData);
      form.setValue("spm_id", spmData.id);
      form.setValue("nilai_sp2d", Number(spmData.nilai_bersih || spmData.nilai_spm));
    }
  }, [spmData, form]);

  const onSubmit = async (data: Sp2dFormData) => {
    if (!selectedSpm) {
      toast.error("SPM belum dipilih");
      return;
    }

    // Upload dokumen SP2D if provided
    let dokumenUrl = null;
    if (uploadedFile) {
      const fileExt = uploadedFile.name.split('.').pop();
      const fileName = `${data.spm_id}-${Date.now()}.${fileExt}`;
      const filePath = `sp2d-documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('spm-documents')
        .upload(filePath, uploadedFile);

      if (uploadError) {
        toast.error("Gagal mengupload dokumen: " + uploadError.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('spm-documents')
        .getPublicUrl(filePath);
      
      dokumenUrl = urlData.publicUrl;
    }

    // Copy pajak from SPM
    const pajakFromSpm = selectedSpm?.potongan_pajak_spm || [];
    
    createSp2d.mutate(
      {
        spm_id: data.spm_id,
        nomor_sp2d: data.nomor_sp2d,
        tanggal_sp2d: data.tanggal_sp2d,
        nilai_sp2d: data.nilai_sp2d,
        dokumen_sp2d_url: dokumenUrl,
        nama_bank: selectedSpm.vendor?.nama_bank || selectedSpm.nama_bank || "",
        nomor_rekening: selectedSpm.vendor?.nomor_rekening || selectedSpm.nomor_rekening || "",
        nama_rekening: selectedSpm.vendor?.nama_rekening || selectedSpm.nama_rekening || "",
        catatan: data.catatan || null,
        kuasa_bud_id: user?.id,
        status: "pending" as any,
        total_potongan: selectedSpm?.total_potongan || 0,
        nilai_diterima: selectedSpm?.nilai_bersih || data.nilai_sp2d,
        potongan_pajak: pajakFromSpm,
      },
      {
        onSuccess: () => {
          navigate("/sp2d");
        },
      }
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/sp2d")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Penerbitan SP2D</h1>
            <p className="text-muted-foreground">
              SP2D Terbit dari SIPD berdasarkan SPM yang disetujui
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data SPM</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!routeSpmId ? (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      SPM harus dipilih dari halaman daftar SP2D
                    </AlertDescription>
                  </Alert>
                ) : selectedSpm ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                      <p className="text-sm">
                        <span className="font-semibold">Nomor SPM:</span>{" "}
                        {selectedSpm.nomor_spm}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Jenis SPM:</span>{" "}
                        {selectedSpm.jenis_spm?.nama_jenis}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">OPD:</span>{" "}
                        {selectedSpm.opd?.nama_opd}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Nilai SPM:</span>{" "}
                        {formatCurrency(selectedSpm.nilai_spm)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center py-4">
                    <p className="text-muted-foreground">Memuat data SPM...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data SP2D</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nomor_sp2d"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor SP2D *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Masukkan nomor SP2D"
                            required
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Masukkan nomor SP2D dari SIPD
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tanggal_sp2d"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal SP2D *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} required />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Masukkan tanggal SP2D dari SIPD
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="nilai_sp2d"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nilai SP2D</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          readOnly
                          className="bg-muted"
                          value={formatCurrency(field.value)}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Nilai diambil otomatis dari SPM yang dipilih
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label htmlFor="dokumen_sp2d">Upload Dokumen SP2D *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="dokumen_sp2d"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 10 * 1024 * 1024) {
                            toast.error("Ukuran file maksimal 10MB");
                            e.target.value = "";
                            return;
                          }
                          setUploadedFile(file);
                        }
                      }}
                      required
                    />
                    {uploadedFile && (
                      <div className="flex items-center gap-2 text-sm text-success">
                        <FileCheck className="h-4 w-4" />
                        {uploadedFile.name}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload dokumen SP2D yang sudah discan dengan tanda tangan dan cap basah (PDF/JPG/PNG, maks. 10MB)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Catatan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="catatan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catatan (Opsional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Catatan tambahan" rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/sp2d")}
              >
                Batal
              </Button>
              <Button type="submit" disabled={createSp2d.isPending || !selectedSpm || !uploadedFile}>
                {createSp2d.isPending ? "Menyimpan..." : "Terbitkan SP2D"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default Sp2dForm;
