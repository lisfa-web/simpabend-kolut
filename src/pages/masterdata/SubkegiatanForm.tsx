import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSubkegiatanMutation } from "@/hooks/useSubkegiatanMutation";
import { useProgramList } from "@/hooks/useProgramList";
import { useKegiatanList } from "@/hooks/useKegiatanList";
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

const subkegiatanSchema = z.object({
  kode_subkegiatan: z.string().min(1, "Kode sub kegiatan harus diisi"),
  nama_subkegiatan: z.string().min(1, "Nama sub kegiatan harus diisi"),
  kegiatan_id: z.string().min(1, "Kegiatan harus dipilih"),
  is_active: z.boolean().default(true),
});

type SubkegiatanFormData = z.infer<typeof subkegiatanSchema>;

export default function SubkegiatanForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const { createSubkegiatan, updateSubkegiatan } = useSubkegiatanMutation();
  const { data: programs } = useProgramList();
  const { data: kegiatanList } = useKegiatanList(selectedProgramId);

  const { data: subkegiatan } = useQuery({
    queryKey: ["subkegiatan", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("subkegiatan")
        .select(`
          *,
          kegiatan:kegiatan_id (
            id,
            program_id
          )
        `)
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEdit,
  });

  const form = useForm<SubkegiatanFormData>({
    resolver: zodResolver(subkegiatanSchema),
    defaultValues: {
      kode_subkegiatan: "",
      nama_subkegiatan: "",
      kegiatan_id: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (subkegiatan) {
      form.reset({
        kode_subkegiatan: subkegiatan.kode_subkegiatan || "",
        nama_subkegiatan: subkegiatan.nama_subkegiatan || "",
        kegiatan_id: subkegiatan.kegiatan_id || "",
        is_active: subkegiatan.is_active ?? true,
      });
      if (subkegiatan.kegiatan) {
        setSelectedProgramId(subkegiatan.kegiatan.program_id);
      }
    }
  }, [subkegiatan, form]);

  const onSubmit = async (data: SubkegiatanFormData) => {
    try {
      const subkegiatanData = {
        kode_subkegiatan: data.kode_subkegiatan,
        nama_subkegiatan: data.nama_subkegiatan,
        kegiatan_id: data.kegiatan_id,
        is_active: data.is_active,
      };
      
      if (isEdit) {
        await updateSubkegiatan.mutateAsync({ id: id!, data: subkegiatanData });
      } else {
        await createSubkegiatan.mutateAsync(subkegiatanData);
      }
      navigate("/masterdata/subkegiatan");
    } catch (error) {
      console.error("Error saving subkegiatan:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/masterdata/subkegiatan")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEdit ? "Edit Sub Kegiatan" : "Tambah Sub Kegiatan"}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? "Ubah data sub kegiatan" : "Tambah sub kegiatan baru"}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Sub Kegiatan</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Program *</label>
                    <Select
                      value={selectedProgramId}
                      onValueChange={setSelectedProgramId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih program" />
                      </SelectTrigger>
                      <SelectContent>
                        {programs?.map((program) => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.kode_program} - {program.nama_program}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <FormField
                    control={form.control}
                    name="kegiatan_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kegiatan *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!selectedProgramId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kegiatan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {kegiatanList?.map((kegiatan) => (
                              <SelectItem key={kegiatan.id} value={kegiatan.id}>
                                {kegiatan.kode_kegiatan} - {kegiatan.nama_kegiatan}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="kode_subkegiatan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kode Sub Kegiatan *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nama_subkegiatan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Sub Kegiatan *</FormLabel>
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
                    disabled={createSubkegiatan.isPending || updateSubkegiatan.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isEdit ? "Simpan Perubahan" : "Tambah Sub Kegiatan"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/masterdata/subkegiatan")}
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
