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
import { useMasterBankList } from "@/hooks/useMasterBankList";
import { useMasterBankMutation } from "@/hooks/useMasterBankMutation";
import type { useMasterBankMutation as UseMasterBankMutationType } from "@/hooks/useMasterBankMutation";
import { ArrowLeft } from "lucide-react";

type MasterBankData = Parameters<ReturnType<typeof UseMasterBankMutationType>['createBank']['mutate']>[0];

const formSchema = z.object({
  kode_bank: z.string().min(2, "Kode bank minimal 2 karakter"),
  nama_bank: z.string().min(3, "Nama bank minimal 3 karakter"),
});

type FormValues = z.infer<typeof formSchema>;

const MasterBankForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: bankList } = useMasterBankList({ enabled: isEdit });
  const { createBank, updateBank } = useMasterBankMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kode_bank: "",
      nama_bank: "",
    },
  });

  useEffect(() => {
    if (isEdit && bankList) {
      const bank = bankList.find((b) => b.id === id);
      if (bank) {
        form.reset({
          kode_bank: bank.kode_bank,
          nama_bank: bank.nama_bank,
        });
      }
    }
  }, [isEdit, id, bankList, form]);

  const onSubmit = (data: FormValues) => {
    const submitData: MasterBankData = {
      kode_bank: data.kode_bank,
      nama_bank: data.nama_bank,
    };
    
    if (isEdit && id) {
      updateBank.mutate(
        { id, data: submitData },
        {
          onSuccess: () => navigate("/masterdata/bank"),
        }
      );
    } else {
      createBank.mutate(submitData, {
        onSuccess: () => navigate("/masterdata/bank"),
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
            onClick={() => navigate("/masterdata/bank")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEdit ? "Edit Bank" : "Tambah Bank"}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? "Ubah data bank" : "Tambah data bank baru"}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="kode_bank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode Bank</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: 014" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nama_bank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Bank</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: BCA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/masterdata/bank")}
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

export default MasterBankForm;
