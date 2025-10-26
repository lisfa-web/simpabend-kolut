import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
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
import { ArrowLeft, Save } from "lucide-react";
import { usePajakPerJenisSpmById } from "@/hooks/usePajakPerJenisSpmList";
import { usePajakPerJenisSpmMutation } from "@/hooks/usePajakPerJenisSpmMutation";
import { useMasterPajakList } from "@/hooks/useMasterPajakList";

const formSchema = z.object({
  jenis_spm: z.string().min(1, "Jenis SPM wajib dipilih"),
  master_pajak_id: z.string().uuid("Master pajak wajib dipilih"),
  tarif_khusus: z.coerce.number().min(0).max(100).optional(),
  uraian_template: z.string().optional(),
  is_default: z.boolean().default(true),
  urutan: z.coerce.number().int().min(1, "Urutan minimal 1").default(1),
});

type FormValues = z.infer<typeof formSchema>;

const PajakPerJenisSpmForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const { data: mappingData } = usePajakPerJenisSpmById(id);
  const { data: masterPajakList = [] } = useMasterPajakList();
  const { createMapping, updateMapping } = usePajakPerJenisSpmMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jenis_spm: "",
      master_pajak_id: "",
      tarif_khusus: undefined,
      uraian_template: "",
      is_default: true,
      urutan: 1,
    },
  });

  useEffect(() => {
    if (mappingData) {
      form.reset({
        jenis_spm: mappingData.jenis_spm,
        master_pajak_id: mappingData.master_pajak_id,
        tarif_khusus: mappingData.tarif_khusus || undefined,
        uraian_template: mappingData.uraian_template || "",
        is_default: mappingData.is_default,
        urutan: mappingData.urutan,
      });
    }
  }, [mappingData, form]);

  const onSubmit = (data: FormValues) => {
    const mappingData = {
      jenis_spm: data.jenis_spm,
      master_pajak_id: data.master_pajak_id,
      tarif_khusus: data.tarif_khusus,
      uraian_template: data.uraian_template,
      is_default: data.is_default,
      urutan: data.urutan,
    };

    if (isEditMode && id) {
      updateMapping.mutate(
        { id, mapping: mappingData },
        {
          onSuccess: () => navigate("/masterdata/pajak/mapping"),
        }
      );
    } else {
      createMapping.mutate(mappingData, {
        onSuccess: () => navigate("/masterdata/pajak/mapping"),
      });
    }
  };

  const activePajakList = masterPajakList.filter((p) => p.is_active);
  const selectedPajak = activePajakList.find(
    (p) => p.id === form.watch("master_pajak_id")
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/masterdata/pajak/mapping")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditMode ? "Edit Mapping Pajak" : "Tambah Mapping Pajak"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode
                ? "Perbarui mapping pajak per jenis SPM"
                : "Tambahkan pajak baru untuk jenis SPM tertentu"}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Formulir Mapping</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="jenis_spm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis SPM</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isEditMode}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis SPM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="up">UP (Uang Persediaan)</SelectItem>
                          <SelectItem value="gu">GU (Ganti Uang)</SelectItem>
                          <SelectItem value="tu">TU (Tambah Uang)</SelectItem>
                          <SelectItem value="ls_gaji">LS Gaji</SelectItem>
                          <SelectItem value="ls_barang_jasa">
                            LS Barang & Jasa
                          </SelectItem>
                          <SelectItem value="ls_belanja_modal">
                            LS Belanja Modal
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="master_pajak_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Master Pajak</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isEditMode}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih master pajak" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {activePajakList.map((pajak) => (
                            <SelectItem key={pajak.id} value={pajak.id}>
                              {pajak.kode_pajak} - {pajak.nama_pajak} (
                              {pajak.tarif_default}%)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedPajak && (
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Tarif Default:</span>{" "}
                      {selectedPajak.tarif_default}%
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Rekening:</span>{" "}
                      {selectedPajak.rekening_pajak}
                    </div>
                    {selectedPajak.deskripsi && (
                      <div className="text-sm text-muted-foreground">
                        {selectedPajak.deskripsi}
                      </div>
                    )}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="tarif_khusus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tarif Khusus (Opsional)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="Kosongkan untuk menggunakan tarif default"
                            {...field}
                            value={field.value || ""}
                          />
                          <span className="text-muted-foreground">%</span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Kosongkan jika ingin menggunakan tarif default
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="uraian_template"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Uraian Template (Opsional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Template uraian untuk auto-fill"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Uraian ini akan muncul otomatis saat input SPM
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="urutan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urutan</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Urutan tampilan pajak (angka lebih kecil tampil lebih dulu)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_default"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Pajak Default (Auto-populate)
                        </FormLabel>
                        <FormDescription>
                          Jika aktif, pajak ini akan muncul otomatis saat input SPM
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

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/masterdata/pajak/mapping")}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMapping.isPending || updateMapping.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isEditMode ? "Perbarui" : "Simpan"}
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

export default PajakPerJenisSpmForm;
