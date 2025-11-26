import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePihakKetigaList } from "@/hooks/usePihakKetigaList";
import { usePihakKetigaMutation } from "@/hooks/usePihakKetigaMutation";
import { useMasterBankList } from "@/hooks/useMasterBankList";
import { ArrowLeft } from "lucide-react";

const formSchema = z.object({
  nama_pihak_ketiga: z.string().min(3, "Nama minimal 3 karakter"),
  npwp: z.string().optional(),
  alamat: z.string().optional(),
  telepon: z.string().optional(),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  bank_id: z.string().optional(),
  nomor_rekening: z.string().optional(),
  nama_rekening: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const PihakKetigaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: pihakKetigaList } = usePihakKetigaList({ enabled: isEdit });
  const { data: bankList } = useMasterBankList({ is_active: true });
  const { createPihakKetiga, updatePihakKetiga } = usePihakKetigaMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama_pihak_ketiga: "",
      npwp: "",
      alamat: "",
      telepon: "",
      email: "",
      bank_id: "",
      nomor_rekening: "",
      nama_rekening: "",
    },
  });

  useEffect(() => {
    if (isEdit && pihakKetigaList) {
      const pihakKetiga = pihakKetigaList.find((pk) => pk.id === id);
      if (pihakKetiga) {
        form.reset({
          nama_pihak_ketiga: pihakKetiga.nama_pihak_ketiga,
          npwp: pihakKetiga.npwp || "",
          alamat: pihakKetiga.alamat || "",
          telepon: pihakKetiga.telepon || "",
          email: pihakKetiga.email || "",
          bank_id: pihakKetiga.bank_id || "",
          nomor_rekening: pihakKetiga.nomor_rekening || "",
          nama_rekening: pihakKetiga.nama_rekening || "",
        });
      }
    }
  }, [isEdit, id, pihakKetigaList, form]);

  const onSubmit = (data: FormValues) => {
    const submitData = {
      nama_pihak_ketiga: data.nama_pihak_ketiga,
      npwp: data.npwp || null,
      alamat: data.alamat || null,
      telepon: data.telepon || null,
      email: data.email || null,
      bank_id: data.bank_id || null,
      nomor_rekening: data.nomor_rekening || null,
      nama_rekening: data.nama_rekening || null,
    };
    
    if (isEdit && id) {
      updatePihakKetiga.mutate(
        { id, data: submitData },
        {
          onSuccess: () => navigate("/masterdata/pihak-ketiga"),
        }
      );
    } else {
      createPihakKetiga.mutate(submitData, {
        onSuccess: () => navigate("/masterdata/pihak-ketiga"),
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/masterdata/pihak-ketiga")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEdit ? "Edit Pihak Ketiga" : "Tambah Pihak Ketiga"}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? "Ubah data pihak ketiga" : "Tambah data pihak ketiga baru"}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="nama_pihak_ketiga"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Pihak Ketiga</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama lengkap" {...field} />
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
                    <Input placeholder="00.000.000.0-000.000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alamat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Alamat lengkap" {...field} />
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
                      <Input placeholder="08XXXXXXXXXX" {...field} />
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
                      <Input type="email" placeholder="email@domain.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Informasi Rekening</h3>
              
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="bank_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Bank" />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="nomor_rekening"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Rekening</FormLabel>
                        <FormControl>
                          <Input placeholder="1234567890" {...field} />
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
                        <FormLabel>Nama Rekening</FormLabel>
                        <FormControl>
                          <Input placeholder="Nama pemilik rekening" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/masterdata/pihak-ketiga")}
              >
                Batal
              </Button>
              <Button type="submit">
                {isEdit ? "Update" : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default PihakKetigaForm;
