import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { useSp2dMutation } from "@/hooks/useSp2dMutation";
import { useAuth } from "@/hooks/useAuth";
import { useGenerateSp2dNumber } from "@/hooks/useGenerateSp2dNumber";
import { formatCurrency } from "@/lib/currency";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Sp2dFormData {
  spm_id: string;
  nomor_sp2d: string;
  tanggal_sp2d: string;
  nilai_sp2d: number;
  nama_bank: string;
  nomor_rekening: string;
  nama_rekening: string;
  catatan?: string;
}

const Sp2dForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedSpm, setSelectedSpm] = useState<any>(null);

  // Fetch approved SPM that don't have SP2D yet
  const { data: spmList } = useQuery({
    queryKey: ["spm-without-sp2d"],
    queryFn: async () => {
      // First, get all SPM IDs that already have SP2D
      const { data: sp2dList, error: sp2dError } = await supabase
        .from("sp2d")
        .select("spm_id");

      if (sp2dError) throw sp2dError;

      const usedSpmIds = sp2dList?.map((sp2d) => sp2d.spm_id) || [];

      // Then, fetch approved SPM excluding those with SP2D
      let query = supabase
        .from("spm")
        .select(`
          *,
          opd:opd_id(nama_opd),
          program:program_id(nama_program),
          kegiatan:kegiatan_id(nama_kegiatan),
          subkegiatan:subkegiatan_id(nama_subkegiatan),
          vendor:vendor_id(nama_vendor, nama_bank, nomor_rekening, nama_rekening)
        `)
        .eq("status", "disetujui")
        .order("created_at", { ascending: false });

      // Exclude SPM that already have SP2D
      if (usedSpmIds.length > 0) {
        query = query.not("id", "in", `(${usedSpmIds.join(",")})`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { createSp2d } = useSp2dMutation();
  const { data: generatedNumber, isLoading: isGeneratingNumber } = useGenerateSp2dNumber();

  const form = useForm<Sp2dFormData>({
    defaultValues: {
      spm_id: "",
      nomor_sp2d: "",
      tanggal_sp2d: new Date().toISOString().split("T")[0],
      nilai_sp2d: 0,
      nama_bank: "",
      nomor_rekening: "",
      nama_rekening: "",
      catatan: "",
    },
  });

  const watchSpmId = form.watch("spm_id");

  // Auto-fill nomor SP2D when generated
  useEffect(() => {
    if (generatedNumber) {
      form.setValue("nomor_sp2d", generatedNumber);
    }
  }, [generatedNumber, form]);

  useEffect(() => {
    if (watchSpmId && spmList) {
      const spm = spmList.find((s) => s.id === watchSpmId);
      if (spm) {
        setSelectedSpm(spm);
        form.setValue("nilai_sp2d", Number(spm.nilai_spm));
        if (spm.vendor) {
          const vendor = spm.vendor as any; // Type assertion for dynamic vendor data
          form.setValue("nama_bank", vendor.nama_bank || "");
          form.setValue("nomor_rekening", vendor.nomor_rekening || "");
          form.setValue("nama_rekening", vendor.nama_rekening || "");
        }
      }
    }
  }, [watchSpmId, spmList, form]);

  const onSubmit = (data: Sp2dFormData) => {
    createSp2d.mutate(
      {
        spm_id: data.spm_id,
        nomor_sp2d: data.nomor_sp2d,
        tanggal_sp2d: data.tanggal_sp2d,
        nilai_sp2d: data.nilai_sp2d,
        nama_bank: data.nama_bank,
        nomor_rekening: data.nomor_rekening,
        nama_rekening: data.nama_rekening,
        catatan: data.catatan || null,
        kuasa_bud_id: user?.id,
        status: "pending" as any,
      },
      {
        onSuccess: () => {
          navigate("/sp2d");
        },
      }
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/sp2d")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Buat SP2D Baru</h1>
            <p className="text-muted-foreground">
              Buat Surat Perintah Pencairan Dana dari SPM yang disetujui
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pilih SPM</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="spm_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SPM yang Disetujui</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih SPM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {spmList?.map((spm) => (
                            <SelectItem key={spm.id} value={spm.id}>
                              {spm.nomor_spm} - {spm.opd?.nama_opd} - Rp{" "}
                              {new Intl.NumberFormat("id-ID").format(
                                Number(spm.nilai_spm)
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedSpm && (
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <p className="text-sm">
                      <span className="font-semibold">OPD:</span>{" "}
                      {selectedSpm.opd?.nama_opd}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Program:</span>{" "}
                      {selectedSpm.program?.nama_program || "-"}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Vendor:</span>{" "}
                      {selectedSpm.vendor?.nama_vendor || "-"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data SP2D</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nomor_sp2d"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor SP2D</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder={isGeneratingNumber ? "Generating..." : "Nomor SP2D"}
                            readOnly
                            className="bg-muted"
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Nomor otomatis dibuat oleh sistem
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tanggal_sp2d"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal SP2D</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="nilai_sp2d"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nilai SP2D</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          readOnly
                          className="bg-muted"
                          value={formatCurrency(field.value)}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Nilai diambil otomatis dari SPM yang dipilih
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informasi Bank</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="nama_bank"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Bank</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nama Bank" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nomor_rekening"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Rekening</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nomor Rekening" />
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
                          <Input {...field} placeholder="Nama Rekening" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="catatan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catatan (Opsional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Catatan tambahan" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/sp2d")}
              >
                Batal
              </Button>
              <Button type="submit" disabled={createSp2d.isPending}>
                {createSp2d.isPending ? "Menyimpan..." : "Simpan SP2D"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default Sp2dForm;
