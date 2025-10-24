import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { spmDataSchema, SpmDataFormValues } from "@/schemas/spmSchema";
import { useEffect } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "./CurrencyInput";
import { useOpdList } from "@/hooks/useOpdList";
import { useProgramList } from "@/hooks/useProgramList";
import { useKegiatanList } from "@/hooks/useKegiatanList";
import { useSubkegiatanList } from "@/hooks/useSubkegiatanList";
import { useVendorList } from "@/hooks/useVendorList";
import { Loader2 } from "lucide-react";

interface SpmDataFormProps {
  defaultValues?: Partial<SpmDataFormValues>;
  onSubmit: (data: SpmDataFormValues) => void;
  onBack?: () => void;
}

export const SpmDataForm = ({ defaultValues, onSubmit, onBack }: SpmDataFormProps) => {
  const form = useForm<SpmDataFormValues>({
    resolver: zodResolver(spmDataSchema),
    defaultValues: {
      tanggal_ajuan: new Date(),
      ...defaultValues,
    },
  });

  const jenisSpm = form.watch("jenis_spm");
  const programId = form.watch("program_id");
  const kegiatanId = form.watch("kegiatan_id");
  const requiresVendor = jenisSpm === 'ls_barang_jasa' || jenisSpm === 'ls_belanja_modal';

  const { data: opdList, isLoading: opdLoading } = useOpdList({ is_active: true });
  const { data: programList, isLoading: programLoading } = useProgramList({ tahun_anggaran: new Date().getFullYear(), is_active: true });
  const { data: kegiatanList } = useKegiatanList({ program_id: programId, is_active: true });
  const { data: subkegiatanList } = useSubkegiatanList({ kegiatan_id: kegiatanId, is_active: true });
  const { data: vendorList } = useVendorList({ is_active: true });

  // Reset form dengan defaultValues saat mode edit
  useEffect(() => {
    if (defaultValues) {
      form.reset({
        tanggal_ajuan: new Date(),
        ...defaultValues,
      });
    }
  }, [defaultValues, form]);

  if (opdLoading || programLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="opd_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>OPD</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih OPD" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {opdList?.map((opd) => (
                    <SelectItem key={opd.id} value={opd.id}>
                      {opd.nama_opd}
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
          name="program_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  form.setValue("kegiatan_id", "");
                  form.setValue("subkegiatan_id", "");
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Program" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {programList?.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.kode_program} - {program.nama_program}
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
          name="kegiatan_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kegiatan</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  form.setValue("subkegiatan_id", "");
                }}
                value={field.value}
                disabled={!programId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kegiatan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {kegiatanList?.map((kegiatan) => (
                    <SelectItem key={kegiatan.id} value={kegiatan.id}>
                      {kegiatan.kode_kegiatan} - {kegiatan.nama_kegiatan}
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
          name="subkegiatan_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sub Kegiatan</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!kegiatanId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Sub Kegiatan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subkegiatanList?.map((subkegiatan) => (
                    <SelectItem key={subkegiatan.id} value={subkegiatan.id}>
                      {subkegiatan.kode_subkegiatan} - {subkegiatan.nama_subkegiatan}
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
          name="jenis_spm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jenis SPM</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-2 gap-4"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="up" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      UP (Uang Persediaan)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="gu" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      GU (Ganti Uang)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="tu" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      TU (Tambah Uang)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="ls_gaji" />
                    </FormControl>
                    <FormLabel className="font-normal">LS Gaji</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="ls_barang_jasa" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      LS Barang & Jasa
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="ls_belanja_modal" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      LS Belanja Modal
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {jenisSpm && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              {requiresVendor ? (
                <span className="font-medium text-primary">
                  ℹ️ Jenis SPM ini memerlukan vendor. Informasi bank akan diambil dari data vendor.
                </span>
              ) : (
                <span>
                  ℹ️ Jenis SPM ini tidak memerlukan vendor. Input informasi rekening penerima akan dilakukan saat pembuatan SP2D.
                </span>
              )}
            </p>
          </div>
        )}

        {requiresVendor && (
          <FormField
            control={form.control}
            name="vendor_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor/Pihak Ketiga *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Vendor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {vendorList?.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.nama_vendor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="nilai_spm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nilai SPM</FormLabel>
              <FormControl>
                <CurrencyInput
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="uraian"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Uraian</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Masukkan uraian SPM"
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack}>
              Kembali
            </Button>
          )}
          <Button type="submit" className="ml-auto">
            Selanjutnya
          </Button>
        </div>
      </form>
    </Form>
  );
};
