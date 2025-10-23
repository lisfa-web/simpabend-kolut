import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/form";
import { usePejabatMutation } from "@/hooks/usePejabatMutation";
import { useOpdList } from "@/hooks/useOpdList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Upload, X } from "lucide-react";

const pejabatSchema = z.object({
  nip: z.string().min(1, "NIP wajib diisi"),
  nama_lengkap: z.string().min(1, "Nama lengkap wajib diisi"),
  jabatan: z.string().min(1, "Jabatan wajib diisi"),
  opd_id: z.string().optional(),
  is_active: z.boolean(),
});

type PejabatFormData = z.infer<typeof pejabatSchema>;

export default function PejabatForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string>("");

  const { data: opdList = [] } = useOpdList({ is_active: true });
  const { createPejabat, updatePejabat, uploadSignature } = usePejabatMutation();

  const { data: existingData } = useQuery({
    queryKey: ["pejabat", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("pejabat")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEdit,
  });

  const form = useForm<PejabatFormData>({
    resolver: zodResolver(pejabatSchema),
    defaultValues: {
      nip: "",
      nama_lengkap: "",
      jabatan: "",
      opd_id: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (existingData) {
      form.reset({
        nip: existingData.nip,
        nama_lengkap: existingData.nama_lengkap,
        jabatan: existingData.jabatan,
        opd_id: existingData.opd_id || "",
        is_active: existingData.is_active,
      });
      if (existingData.ttd_url) {
        setSignaturePreview(existingData.ttd_url);
      }
    }
  }, [existingData, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        form.setError("root", { message: "Ukuran file maksimal 2MB" });
        return;
      }
      setSignatureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignaturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: PejabatFormData) => {
    try {
      let ttdUrl = existingData?.ttd_url;

      if (signatureFile) {
        const uploadResult = await uploadSignature.mutateAsync({
          file: signatureFile,
          pejabatId: id || "new",
        });
        ttdUrl = uploadResult;
      }

      const submitData = {
        ...data,
        opd_id: data.opd_id || null,
        ttd_url: ttdUrl || null,
      };

      if (isEdit && id) {
        await updatePejabat.mutateAsync({ id, data: submitData });
      } else {
        await createPejabat.mutateAsync(submitData);
      }

      navigate("/surat/pejabat");
    } catch (error) {
      console.error("Error saving pejabat:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? "Edit Pejabat" : "Tambah Pejabat"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isEdit ? "Perbarui data pejabat" : "Tambahkan pejabat baru"}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Pejabat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="nip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIP</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan NIP" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nama_lengkap"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama lengkap" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jabatan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jabatan</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan jabatan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="opd_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OPD (Opsional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih OPD" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Tidak ada</SelectItem>
                          {opdList.map((opd) => (
                            <SelectItem key={opd.id} value={opd.id}>
                              {opd.nama_opd}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label>Tanda Tangan Digital</Label>
                  <div className="border-2 border-dashed rounded-lg p-4">
                    {signaturePreview ? (
                      <div className="relative">
                        <img
                          src={signaturePreview}
                          alt="Signature preview"
                          className="max-h-32 mx-auto"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-0 right-0"
                          onClick={() => {
                            setSignatureFile(null);
                            setSignaturePreview("");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-2">
                          Upload tanda tangan (PNG/JPG, max 2MB)
                        </p>
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleFileChange}
                      className="mt-2"
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Status Aktif</FormLabel>
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
              <Button type="submit" disabled={createPejabat.isPending || updatePejabat.isPending}>
                {createPejabat.isPending || updatePejabat.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/surat/pejabat")}>
                Batal
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}
