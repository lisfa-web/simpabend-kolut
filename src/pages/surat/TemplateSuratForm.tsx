import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useTemplateSuratMutation } from "@/hooks/useTemplateSuratMutation";
import { useKopSuratUpload } from "@/hooks/useKopSuratUpload";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Loader2, X, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const templateSchema = z.object({
  nama_template: z.string().min(1, "Nama template wajib diisi"),
  jenis_surat: z.string().min(1, "Jenis surat wajib diisi"),
  konten_html: z.string().min(1, "Konten template wajib diisi"),
  kop_surat_url: z.string().optional(),
  is_active: z.boolean(),
});

type TemplateFormData = z.infer<typeof templateSchema>;

const jenisSuratOptions = [
  "Surat Pengantar SPM",
  "Surat Keterangan",
  "Nota Dinas",
  "Berita Acara",
  "Surat Tugas",
  "Surat Keputusan",
];

const availableVariables = [
  { key: "{{nomor_surat}}", desc: "Nomor surat" },
  { key: "{{tanggal}}", desc: "Tanggal surat" },
  { key: "{{nama_opd}}", desc: "Nama OPD" },
  { key: "{{nama_pejabat}}", desc: "Nama pejabat penandatangan" },
  { key: "{{jabatan_pejabat}}", desc: "Jabatan pejabat" },
  { key: "{{nip_pejabat}}", desc: "NIP pejabat" },
  { key: "{{nomor_spm}}", desc: "Nomor SPM" },
  { key: "{{nilai_spm}}", desc: "Nilai SPM" },
  { key: "{{vendor}}", desc: "Nama vendor/penerima" },
];

export default function TemplateSuratForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { toast } = useToast();

  const { createTemplate, updateTemplate } = useTemplateSuratMutation();
  const { uploadKopSurat, deleteKopSurat } = useKopSuratUpload();
  
  const [kopSuratFile, setKopSuratFile] = useState<File | null>(null);
  const [kopSuratPreview, setKopSuratPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const { data: existingData } = useQuery({
    queryKey: ["template_surat", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("template_surat")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEdit,
  });

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      nama_template: "",
      jenis_surat: "",
      konten_html: "",
      kop_surat_url: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (existingData) {
      form.reset({
        nama_template: existingData.nama_template,
        jenis_surat: existingData.jenis_surat,
        konten_html: existingData.konten_html,
        kop_surat_url: existingData.kop_surat_url || "",
        is_active: existingData.is_active,
      });
      if (existingData.kop_surat_url) {
        setKopSuratPreview(existingData.kop_surat_url);
      }
    }
  }, [existingData, form]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setKopSuratFile(file);
    
    // Create preview untuk image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setKopSuratPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setKopSuratPreview(file.name);
    }
  };

  const handleRemoveKopSurat = async () => {
    const currentUrl = form.getValues('kop_surat_url');
    if (currentUrl) {
      try {
        await deleteKopSurat(currentUrl);
      } catch (error) {
        console.error('Error deleting kop surat:', error);
      }
    }
    setKopSuratFile(null);
    setKopSuratPreview("");
    form.setValue('kop_surat_url', "");
  };

  const onSubmit = async (data: TemplateFormData) => {
    try {
      setIsUploading(true);
      
      // Upload kop surat jika ada file baru
      let kopSuratUrl = data.kop_surat_url;
      if (kopSuratFile) {
        kopSuratUrl = await uploadKopSurat(kopSuratFile);
      }
      
      const submitData = {
        nama_template: data.nama_template,
        jenis_surat: data.jenis_surat,
        konten_html: data.konten_html,
        kop_surat_url: kopSuratUrl || undefined,
        is_active: data.is_active,
      };
      
      if (isEdit && id) {
        await updateTemplate.mutateAsync({ id, data: submitData });
      } else {
        await createTemplate.mutateAsync(submitData);
      }
      navigate("/surat/template");
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menyimpan template",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? "Edit Template" : "Tambah Template"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isEdit ? "Perbarui template surat" : "Buat template surat baru"}
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Variables yang tersedia:</strong>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {availableVariables.map((v) => (
                <div key={v.key} className="text-sm">
                  <code className="bg-muted px-1 rounded">{v.key}</code> - {v.desc}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="nama_template"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Template</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Template Pengantar SPM UP" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jenis_surat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Surat</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis surat" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {jenisSuratOptions.map((jenis) => (
                            <SelectItem key={jenis} value={jenis}>
                              {jenis}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="kop_surat_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kop Surat</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {/* File Input */}
                      <div className="flex items-center gap-4">
                        <Input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,application/pdf"
                          onChange={handleFileChange}
                          className="cursor-pointer"
                        />
                        {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                      </div>
                      
                      {/* Preview */}
                      {(kopSuratPreview || field.value) && (
                        <div className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Preview Kop Surat:</p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveKopSurat}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          {(field.value || kopSuratPreview)?.endsWith('.pdf') ? (
                            <div className="flex items-center gap-2 p-4 bg-muted rounded">
                              <FileText className="h-8 w-8" />
                              <span className="text-sm">File PDF</span>
                            </div>
                          ) : (
                            <img
                              src={kopSuratPreview || field.value}
                              alt="Preview Kop Surat"
                              className="max-h-48 mx-auto object-contain border rounded"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload file kop surat (PNG, JPG, atau PDF). Max 2MB
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="konten_html"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Konten Template</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Masukkan konten template dengan HTML sederhana dan gunakan {{variable}} untuk data dinamis"
                          className="min-h-[300px] font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Gunakan HTML sederhana. Contoh: {"<p>Nomor: {{nomor_surat}}</p>"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Status Aktif</FormLabel>
                        <FormDescription>
                          Template aktif dapat digunakan untuk generate surat
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="submit" disabled={createTemplate.isPending || updateTemplate.isPending || isUploading}>
                {createTemplate.isPending || updateTemplate.isPending || isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isUploading ? "Uploading..." : "Menyimpan..."}
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/surat/template")}>
                Batal
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}
