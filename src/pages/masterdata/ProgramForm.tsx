import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useProgramMutation } from "@/hooks/useProgramMutation";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";

const programSchema = z.object({
  kode_program: z.string().min(1, "Kode program harus diisi"),
  nama_program: z.string().min(1, "Nama program harus diisi"),
  tahun_anggaran: z.coerce.number().min(2000, "Tahun tidak valid"),
  is_active: z.boolean().default(true),
});

type ProgramFormData = z.infer<typeof programSchema>;

export default function ProgramForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { createProgram, updateProgram } = useProgramMutation();

  const { data: program } = useQuery({
    queryKey: ["program", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("program")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEdit,
  });

  const form = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      kode_program: "",
      nama_program: "",
      tahun_anggaran: new Date().getFullYear(),
      is_active: true,
    },
  });

  useEffect(() => {
    if (program) {
      form.reset({
        kode_program: program.kode_program || "",
        nama_program: program.nama_program || "",
        tahun_anggaran: program.tahun_anggaran || new Date().getFullYear(),
        is_active: program.is_active ?? true,
      });
    }
  }, [program, form]);

  const onSubmit = async (data: ProgramFormData) => {
    try {
      const programData = {
        kode_program: data.kode_program,
        nama_program: data.nama_program,
        tahun_anggaran: data.tahun_anggaran,
        is_active: data.is_active,
      };
      
      if (isEdit) {
        await updateProgram.mutateAsync({ id: id!, data: programData });
      } else {
        await createProgram.mutateAsync(programData);
      }
      navigate("/masterdata/program");
    } catch (error) {
      console.error("Error saving program:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/masterdata/program")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEdit ? "Edit Program" : "Tambah Program"}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? "Ubah data program" : "Tambah program baru"}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Program</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="kode_program"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kode Program *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tahun_anggaran"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tahun Anggaran *</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="nama_program"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Program *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={createProgram.isPending || updateProgram.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isEdit ? "Simpan Perubahan" : "Tambah Program"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/masterdata/program")}
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
