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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useBendaharaPengeluaranList } from "@/hooks/useBendaharaPengeluaranList";
import { useBendaharaPengeluaranMutation } from "@/hooks/useBendaharaPengeluaranMutation";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  nama_bendahara: z.string().min(1, "Nama bendahara harus diisi"),
  nip: z.string().optional(),
  alamat: z.string().optional(),
  telepon: z.string().optional(),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  nama_bank: z.string().optional(),
  nomor_rekening: z.string().optional(),
  nama_rekening: z.string().optional(),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const BendaharaPengeluaranForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: bendaharaList, isLoading: isLoadingList } = useBendaharaPengeluaranList();
  const { createBendaharaPengeluaran, updateBendaharaPengeluaran } = useBendaharaPengeluaranMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama_bendahara: "",
      nip: "",
      alamat: "",
      telepon: "",
      email: "",
      nama_bank: "",
      nomor_rekening: "",
      nama_rekening: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (isEdit && bendaharaList) {
      const bendahara = bendaharaList.find((v) => v.id === id);
      if (bendahara) {
        form.reset({
          nama_bendahara: bendahara.nama_bendahara,
          nip: bendahara.nip || "",
          alamat: bendahara.alamat || "",
          telepon: bendahara.telepon || "",
          email: bendahara.email || "",
          nama_bank: bendahara.nama_bank || "",
          nomor_rekening: bendahara.nomor_rekening || "",
          nama_rekening: bendahara.nama_rekening || "",
          is_active: bendahara.is_active,
        });
      }
    }
  }, [isEdit, id, bendaharaList, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEdit && id) {
        await updateBendaharaPengeluaran.mutateAsync({
          id,
          data: {
            nama_bendahara: data.nama_bendahara,
            is_active: data.is_active,
            nip: data.nip || undefined,
            alamat: data.alamat || undefined,
            telepon: data.telepon || undefined,
            email: data.email || undefined,
            nama_bank: data.nama_bank || undefined,
            nomor_rekening: data.nomor_rekening || undefined,
            nama_rekening: data.nama_rekening || undefined,
          },
        });
        toast.success("Bendahara pengeluaran berhasil diperbarui");
      } else {
        await createBendaharaPengeluaran.mutateAsync({
          nama_bendahara: data.nama_bendahara,
          is_active: data.is_active,
          nip: data.nip || undefined,
          alamat: data.alamat || undefined,
          telepon: data.telepon || undefined,
          email: data.email || undefined,
          nama_bank: data.nama_bank || undefined,
          nomor_rekening: data.nomor_rekening || undefined,
          nama_rekening: data.nama_rekening || undefined,
        });
        toast.success("Bendahara pengeluaran berhasil ditambahkan");
      }
      navigate("/masterdata/bendahara-pengeluaran");
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    }
  };

  if (isLoadingList && isEdit) {
    return (
      <DashboardLayout>
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? "Edit" : "Tambah"} Bendahara Pengeluaran
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEdit
              ? "Perbarui informasi bendahara pengeluaran"
              : "Tambahkan bendahara pengeluaran baru"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Bendahara</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="nama_bendahara"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Nama Bendahara <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nama lengkap bendahara" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NIP</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="NIP bendahara" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="alamat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Alamat lengkap" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="telepon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telepon</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="08xx-xxxx-xxxx" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="email@example.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-semibold mb-4">Informasi Rekening</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="nama_bank"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Bank</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Contoh: Bank Mandiri" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="nomor_rekening"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nomor Rekening</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="1234567890" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nama_rekening"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nama Pemilik Rekening</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Nama sesuai rekening" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Status Aktif</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Bendahara yang nonaktif tidak akan muncul dalam pilihan
                        </p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/masterdata/bendahara-pengeluaran")}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      createBendaharaPengeluaran.isPending || updateBendaharaPengeluaran.isPending
                    }
                  >
                    {createBendaharaPengeluaran.isPending || updateBendaharaPengeluaran.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan"
                    )}
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

export default BendaharaPengeluaranForm;
