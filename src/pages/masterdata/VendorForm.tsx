import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useVendorMutation } from "@/hooks/useVendorMutation";
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
import { ArrowLeft, Save } from "lucide-react";

const vendorSchema = z.object({
  nama_vendor: z.string().min(1, "Nama vendor harus diisi"),
  npwp: z.string().optional(),
  alamat: z.string().optional(),
  telepon: z.string().optional(),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  bank_id: z.string().optional(),
  nomor_rekening: z.string().optional(),
  nama_rekening: z.string().optional(),
  is_active: z.boolean().default(true),
});

type VendorFormData = z.infer<typeof vendorSchema>;

export default function VendorForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { createVendor, updateVendor } = useVendorMutation();
  const { data: bankList, isLoading: bankLoading } = useMasterBankList({ is_active: true });

  const { data: vendor } = useQuery({
    queryKey: ["vendor", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("vendor")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEdit,
  });

  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      nama_vendor: "",
      npwp: "",
      alamat: "",
      telepon: "",
      email: "",
      bank_id: "",
      nomor_rekening: "",
      nama_rekening: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (vendor) {
      form.reset({
        nama_vendor: vendor.nama_vendor || "",
        npwp: vendor.npwp || "",
        alamat: vendor.alamat || "",
        telepon: vendor.telepon || "",
        email: vendor.email || "",
        bank_id: vendor.bank_id || "",
        nomor_rekening: vendor.nomor_rekening || "",
        nama_rekening: vendor.nama_rekening || "",
        is_active: vendor.is_active ?? true,
      });
    }
  }, [vendor, form]);

  const onSubmit = async (data: VendorFormData) => {
    try {
      const vendorData = {
        nama_vendor: data.nama_vendor,
        npwp: data.npwp || undefined,
        alamat: data.alamat || undefined,
        telepon: data.telepon || undefined,
        email: data.email || undefined,
        bank_id: data.bank_id || undefined,
        nomor_rekening: data.nomor_rekening || undefined,
        nama_rekening: data.nama_rekening || undefined,
        is_active: data.is_active,
      };
      
      if (isEdit) {
        await updateVendor.mutateAsync({ id: id!, data: vendorData });
      } else {
        await createVendor.mutateAsync(vendorData);
      }
      navigate("/masterdata/vendor");
    } catch (error) {
      console.error("Error saving vendor:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/masterdata/vendor")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEdit ? "Edit Vendor" : "Tambah Vendor"}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? "Ubah data vendor" : "Tambah vendor baru"}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Vendor</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nama_vendor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Vendor *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="npwp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NPWP</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telepon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telepon</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Input type="email" {...field} />
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
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informasi Rekening</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                        name="nomor_rekening"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nomor Rekening</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="nama_rekening"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Rekening</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={createVendor.isPending || updateVendor.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isEdit ? "Simpan Perubahan" : "Tambah Vendor"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/masterdata/vendor")}
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
