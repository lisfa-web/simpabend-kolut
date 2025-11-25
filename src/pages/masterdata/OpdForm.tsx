import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useOpdMutation } from "@/hooks/useOpdMutation";
import { useMasterBankList } from "@/hooks/useMasterBankList";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

const opdSchema = z.object({
  kode_opd: z.string().min(1, "Kode OPD harus diisi"),
  nama_opd: z.string().min(1, "Nama OPD harus diisi"),
  alamat: z.string().optional(),
  telepon: z.string().optional(),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  nama_bendahara: z.string().optional(),
  nomor_rekening_bendahara: z.string().optional(),
  bank_id: z.string().optional(),
  is_active: z.boolean().default(true),
});

type OpdFormData = z.infer<typeof opdSchema>;

export default function OpdForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { createOpd, updateOpd } = useOpdMutation();
  const { data: bankList, isLoading: bankLoading } = useMasterBankList({ is_active: true });

  const { data: opdData } = useQuery({
    queryKey: ["opd", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("opd")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEdit,
  });

  const form = useForm<OpdFormData>({
    resolver: zodResolver(opdSchema),
    defaultValues: {
      kode_opd: "",
      nama_opd: "",
      alamat: "",
      telepon: "",
      email: "",
      nama_bendahara: "",
      nomor_rekening_bendahara: "",
      bank_id: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (opdData && isEdit) {
      form.reset({
        kode_opd: opdData.kode_opd,
        nama_opd: opdData.nama_opd,
        alamat: opdData.alamat || "",
        telepon: opdData.telepon || "",
        email: opdData.email || "",
        nama_bendahara: opdData.nama_bendahara || "",
        nomor_rekening_bendahara: opdData.nomor_rekening_bendahara || "",
        bank_id: opdData.bank_id || "",
        is_active: opdData.is_active ?? true,
      });
    }
  }, [opdData, form, isEdit]);

  const onSubmit = async (data: OpdFormData) => {
    try {
      const opdData = {
        kode_opd: data.kode_opd,
        nama_opd: data.nama_opd,
        alamat: data.alamat || undefined,
        telepon: data.telepon || undefined,
        email: data.email || undefined,
        nama_bendahara: data.nama_bendahara || undefined,
        nomor_rekening_bendahara: data.nomor_rekening_bendahara || undefined,
        bank_id: data.bank_id || undefined,
        is_active: data.is_active,
      };

      if (isEdit) {
        await updateOpd.mutateAsync({ id: id!, data: opdData });
      } else {
        await createOpd.mutateAsync(opdData);
      }
      navigate("/masterdata/opd");
    } catch (error) {
      console.error("Error saving OPD:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/masterdata/opd")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEdit ? "Edit OPD" : "Tambah OPD"}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? "Ubah data OPD" : "Tambah OPD baru"}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informasi OPD</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="kode_opd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kode OPD *</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: 1.01.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nama_opd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama OPD *</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan nama OPD" {...field} />
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
                        <Textarea placeholder="Masukkan alamat OPD" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="telepon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telepon</FormLabel>
                        <FormControl>
                          <Input placeholder="08xxxxxxxxxx" {...field} />
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
                          <Input type="email" placeholder="email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Bendahara Pengeluaran</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="nama_bendahara"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Bendahara</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan nama bendahara" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="bank_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nama Bank</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={bankLoading}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih bank" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {bankList?.map((bank) => (
                                  <SelectItem key={bank.id} value={bank.id}>
                                    {bank.nama_bank}
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
                        name="nomor_rekening_bendahara"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nomor Rekening</FormLabel>
                            <FormControl>
                              <Input placeholder="Masukkan nomor rekening" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {isEdit && (
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_active">Status Aktif</Label>
                    <Switch
                      id="is_active"
                      checked={form.watch("is_active")}
                      onCheckedChange={(checked) => form.setValue("is_active", checked)}
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={createOpd.isPending || updateOpd.isPending}
                  >
                    {isEdit ? "Simpan Perubahan" : "Tambah OPD"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/masterdata/opd")}
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
