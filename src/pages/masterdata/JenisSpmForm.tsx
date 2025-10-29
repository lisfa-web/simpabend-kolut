import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, FileText } from "lucide-react";
import { useJenisSpmById } from "@/hooks/useJenisSpmList";
import { useJenisSpmMutation } from "@/hooks/useJenisSpmMutation";

const formSchema = z.object({
  nama_jenis: z.string().min(1, "Nama jenis SPM wajib diisi"),
  deskripsi: z.string().optional(),
  ada_pajak: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const JenisSpmForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: jenisSpmData } = useJenisSpmById(id);
  const { createJenisSpm, updateJenisSpm } = useJenisSpmMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama_jenis: "",
      deskripsi: "",
      ada_pajak: false,
      is_active: true,
    },
  });

  useEffect(() => {
    if (jenisSpmData) {
      form.reset({
        nama_jenis: jenisSpmData.nama_jenis,
        deskripsi: jenisSpmData.deskripsi || "",
        ada_pajak: jenisSpmData.ada_pajak,
        is_active: jenisSpmData.is_active,
      });
    }
  }, [jenisSpmData, form]);

  const onSubmit = (values: FormValues) => {
    if (isEdit && id) {
      updateJenisSpm.mutate(
        { id, data: values },
        {
          onSuccess: () => navigate("/masterdata/jenis-spm"),
        }
      );
    } else {
      createJenisSpm.mutate(values, {
        onSuccess: () => navigate("/masterdata/jenis-spm"),
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/masterdata/jenis-spm")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              {isEdit ? "Edit Jenis SPM" : "Tambah Jenis SPM"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isEdit ? "Perbarui data jenis SPM" : "Tambahkan jenis SPM baru"}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Form Jenis SPM</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="nama_jenis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Jenis SPM</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: UP (Uang Persediaan)" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nama lengkap jenis SPM
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deskripsi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi (Opsional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Keterangan tambahan tentang jenis SPM ini..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ada_pajak"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Ada Potongan Pajak</FormLabel>
                        <FormDescription>
                          Apakah jenis SPM ini dikenakan potongan pajak?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
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
                          Jenis SPM aktif akan muncul dalam pilihan saat input SPM
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/masterdata/jenis-spm")}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={createJenisSpm.isPending || updateJenisSpm.isPending}
                  >
                    {createJenisSpm.isPending || updateJenisSpm.isPending
                      ? "Menyimpan..."
                      : isEdit
                      ? "Perbarui"
                      : "Simpan"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default JenisSpmForm;
