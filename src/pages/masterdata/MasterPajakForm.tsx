import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useMasterPajakList } from "@/hooks/useMasterPajakList";
import { useMasterPajakMutation } from "@/hooks/useMasterPajakMutation";

const pajakSchema = z.object({
  kode_pajak: z.string().min(1, "Kode pajak wajib diisi").max(20),
  nama_pajak: z.string().min(1, "Nama pajak wajib diisi"),
  jenis_pajak: z.enum(["pph_21", "pph_22", "pph_23", "pph_4_ayat_2", "ppn"]),
  rekening_pajak: z.string().min(1, "Rekening pajak wajib diisi"),
  tarif_default: z.number().min(0).max(100),
  deskripsi: z.string().optional(),
  is_active: z.boolean().default(true),
});

type PajakFormValues = z.infer<typeof pajakSchema>;

const JENIS_PAJAK_OPTIONS = [
  { value: "pph_21", label: "PPh Pasal 21 - Gaji/Honorarium" },
  { value: "pph_22", label: "PPh Pasal 22 - Pembelian Barang" },
  { value: "pph_23", label: "PPh Pasal 23 - Jasa" },
  { value: "pph_4_ayat_2", label: "PPh Pasal 4 Ayat 2 (Final)" },
  { value: "ppn", label: "PPN - Pajak Pertambahan Nilai" },
];

export default function MasterPajakForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: pajakList } = useMasterPajakList();
  const { createPajak, updatePajak } = useMasterPajakMutation();

  const form = useForm<PajakFormValues>({
    resolver: zodResolver(pajakSchema),
    defaultValues: {
      kode_pajak: "",
      nama_pajak: "",
      jenis_pajak: "pph_21",
      rekening_pajak: "",
      tarif_default: 0,
      deskripsi: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (isEdit && pajakList) {
      const pajak = pajakList.find((p) => p.id === id);
      if (pajak) {
        form.reset({
          kode_pajak: pajak.kode_pajak,
          nama_pajak: pajak.nama_pajak,
          jenis_pajak: pajak.jenis_pajak,
          rekening_pajak: pajak.rekening_pajak,
          tarif_default: Number(pajak.tarif_default),
          deskripsi: pajak.deskripsi || "",
          is_active: pajak.is_active,
        });
      }
    }
  }, [isEdit, id, pajakList, form]);

  const onSubmit = async (data: PajakFormValues) => {
    try {
      if (isEdit) {
        await updatePajak.mutateAsync({ id: id!, ...data });
      } else {
        await createPajak.mutateAsync(data);
      }
      navigate("/masterdata/pajak");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/masterdata/pajak")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEdit ? "Edit Master Pajak" : "Tambah Master Pajak"}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? "Ubah data master pajak" : "Tambahkan master pajak baru"}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Pajak</CardTitle>
            <CardDescription>
              Isi form di bawah untuk {isEdit ? "mengubah" : "menambahkan"} master pajak
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="kode_pajak"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kode Pajak</FormLabel>
                        <FormControl>
                          <Input placeholder="PPH21" {...field} />
                        </FormControl>
                        <FormDescription>Kode unik untuk pajak ini</FormDescription>
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
                            {JENIS_PAJAK_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
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
                    name="nama_pajak"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Nama Pajak</FormLabel>
                        <FormControl>
                          <Input placeholder="PPh Pasal 21" {...field} />
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
                          <Input placeholder="411121" {...field} />
                        </FormControl>
                        <FormDescription>Kode rekening untuk pajak ini</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tarif_default"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tarif Default (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="5.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>Tarif pajak dalam persen</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deskripsi"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Deskripsi</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Deskripsi pajak..."
                            className="resize-none"
                            rows={3}
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
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Status Aktif</FormLabel>
                          <FormDescription>
                            Pajak ini dapat digunakan di sistem
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/masterdata/pajak")}
                  >
                    Batal
                  </Button>
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Simpan
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
