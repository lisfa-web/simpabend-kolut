import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useKegiatanMutation } from "@/hooks/useKegiatanMutation";
import { useProgramList } from "@/hooks/useProgramList";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";

const kegiatanSchema = z.object({
  kode_kegiatan: z.string().min(1, "Kode kegiatan harus diisi"),
  nama_kegiatan: z.string().min(1, "Nama kegiatan harus diisi"),
  program_id: z.string().min(1, "Program harus dipilih"),
  is_active: z.boolean().default(true),
});

type KegiatanFormData = z.infer<typeof kegiatanSchema>;

export default function KegiatanForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { createKegiatan, updateKegiatan } = useKegiatanMutation();
  const { data: programs } = useProgramList();

  const { data: kegiatan } = useQuery({
    queryKey: ["kegiatan", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("kegiatan")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEdit,
  });

  const form = useForm<KegiatanFormData>({
    resolver: zodResolver(kegiatanSchema),
    defaultValues: {
      kode_kegiatan: "",
      nama_kegiatan: "",
      program_id: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (kegiatan) {
      form.reset({
        kode_kegiatan: kegiatan.kode_kegiatan || "",
        nama_kegiatan: kegiatan.nama_kegiatan || "",
        program_id: kegiatan.program_id || "",
        is_active: kegiatan.is_active ?? true,
      });
    }
  }, [kegiatan, form]);

  const onSubmit = async (data: KegiatanFormData) => {
    try {
      const kegiatanData = {
        kode_kegiatan: data.kode_kegiatan,
        nama_kegiatan: data.nama_kegiatan,
        program_id: data.program_id,
        is_active: data.is_active,
      };
      
      if (isEdit) {
        await updateKegiatan.mutateAsync({ id: id!, data: kegiatanData });
      } else {
        await createKegiatan.mutateAsync(kegiatanData);
      }
      navigate("/masterdata/kegiatan");
    } catch (error) {
      console.error("Error saving kegiatan:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/masterdata/kegiatan")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEdit ? "Edit Kegiatan" : "Tambah Kegiatan"}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? "Ubah data kegiatan" : "Tambah kegiatan baru"}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Kegiatan</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="program_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Program *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih program" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {programs?.map((program) => (
                            <SelectItem key={program.id} value={program.id}>
                              {program.kode_program} - {program.nama_program}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="kode_kegiatan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kode Kegiatan *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nama_kegiatan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Kegiatan *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={createKegiatan.isPending || updateKegiatan.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isEdit ? "Simpan Perubahan" : "Tambah Kegiatan"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/masterdata/kegiatan")}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
