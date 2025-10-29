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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Receipt } from "lucide-react";
import { useMasterPajakById } from "@/hooks/useMasterPajakList";
import { useMasterPajakMutation } from "@/hooks/useMasterPajakMutation";

const formSchema = z.object({
  kode_pajak: z.string().min(1, "Kode pajak wajib diisi"),
  nama_pajak: z.string().min(1, "Nama pajak wajib diisi"),
  jenis_pajak: z.enum(["pph_21", "pph_22", "pph_23", "pph_4_ayat_2", "ppn"], {
    required_error: "Jenis pajak wajib dipilih",
  }),
  rekening_pajak: z.string().min(1, "Rekening pajak wajib diisi"),
  deskripsi: z.string().optional(),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const MasterPajakForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: pajakData } = useMasterPajakById(id);
  const { createPajak, updatePajak } = useMasterPajakMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kode_pajak: "",
      nama_pajak: "",
      jenis_pajak: "pph_21",
      rekening_pajak: "",
      deskripsi: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (pajakData) {
      form.reset({
        kode_pajak: pajakData.kode_pajak,
        nama_pajak: pajakData.nama_pajak,
        jenis_pajak: pajakData.jenis_pajak,
        rekening_pajak: pajakData.rekening_pajak,
        deskripsi: pajakData.deskripsi || "",
        is_active: pajakData.is_active,
      });
    }
  }, [pajakData, form]);

  const onSubmit = (values: FormValues) => {
    if (isEdit && id) {
      updatePajak.mutate(
        { id, data: values as any },
        {
          onSuccess: () => navigate("/masterdata/pajak"),
        }
      );
    } else {
      createPajak.mutate(values as any, {
        onSuccess: () => navigate("/masterdata/pajak"),
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/masterdata/pajak")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Receipt className="h-8 w-8 text-primary" />
              {isEdit ? "Edit Master Pajak" : "Tambah Master Pajak"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isEdit ? "Perbarui data master pajak" : "Tambahkan data master pajak baru"}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Form Master Pajak</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="kode_pajak"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kode Pajak</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: PPH21-01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="jenis_pajak"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis Pajak</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih jenis pajak" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pph_21">PPh 21</SelectItem>
                            <SelectItem value="pph_22">PPh 22</SelectItem>
                            <SelectItem value="pph_23">PPh 23</SelectItem>
                            <SelectItem value="pph_4_ayat_2">PPh Pasal 4 Ayat 2</SelectItem>
                            <SelectItem value="ppn">PPN</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="nama_pajak"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Pajak</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: PPh 21 Pegawai Tetap" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rekening_pajak"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rekening Pajak</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: 4.1.01.01.01.0001" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nomor rekening untuk pencatatan pajak
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
                          placeholder="Keterangan tambahan tentang pajak ini..."
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
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Status Aktif</FormLabel>
                        <FormDescription>
                          Pajak aktif akan muncul dalam pilihan saat input SPM/SP2D
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
                    onClick={() => navigate("/masterdata/pajak")}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={createPajak.isPending || updatePajak.isPending}
                  >
                    {createPajak.isPending || updatePajak.isPending
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

export default MasterPajakForm;
