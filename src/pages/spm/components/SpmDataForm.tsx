import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { spmDataSchema, SpmDataFormValues } from "@/schemas/spmSchema";
import { useEffect, useState } from "react";
import { terbilangRupiah } from "@/lib/formatHelpers";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
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
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { CurrencyInput } from "./CurrencyInput";
import { useOpdList } from "@/hooks/useOpdList";
import { useProgramList } from "@/hooks/useProgramList";
import { useKegiatanList } from "@/hooks/useKegiatanList";
import { useSubkegiatanList } from "@/hooks/useSubkegiatanList";
import { useVendorList } from "@/hooks/useVendorList";
import { useJenisSpmTaxInfo } from "@/hooks/useJenisSpmTaxInfo";
import { Loader2, Volume2, Info } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SpmDataFormProps {
  defaultValues?: Partial<SpmDataFormValues>;
  onSubmit: (data: SpmDataFormValues) => void;
  onBack?: () => void;
}

export const SpmDataForm = ({ defaultValues, onSubmit, onBack }: SpmDataFormProps) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingData, setPendingData] = useState<SpmDataFormValues | null>(null);

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
  const nilaiSpm = form.watch("nilai_spm");
  const requiresVendor = jenisSpm === 'ls_barang_jasa' || jenisSpm === 'ls_belanja_modal';

  const { speak, isSpeaking } = useSpeechSynthesis();

  const { data: opdList, isLoading: opdLoading } = useOpdList({ is_active: true });
  const { data: programList, isLoading: programLoading } = useProgramList({ tahun_anggaran: new Date().getFullYear(), is_active: true });
  const { data: kegiatanList } = useKegiatanList({ program_id: programId, is_active: true });
  const { data: subkegiatanList } = useSubkegiatanList({ kegiatan_id: kegiatanId, is_active: true });
  const { data: vendorList } = useVendorList({ is_active: true });
  const { data: taxMapping = {} } = useJenisSpmTaxInfo();

  // Reset form dengan defaultValues saat mode edit
  useEffect(() => {
    if (defaultValues) {
      form.reset({
        tanggal_ajuan: new Date(),
        ...defaultValues,
      });
    }
  }, [defaultValues, form]);

  const handleNextClick = (data: SpmDataFormValues) => {
    setPendingData(data);
    
    // Bacakan nilai SPM
    const terbilang = terbilangRupiah(data.nilai_spm);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(terbilang);
      utterance.lang = 'id-ID';
      utterance.rate = 0.85;
      utterance.pitch = 1;
      
      utterance.onend = () => {
        // Setelah audio selesai, buka dialog konfirmasi
        setShowConfirmDialog(true);
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback jika browser tidak support TTS
      setShowConfirmDialog(true);
    }
  };

  const handleConfirm = () => {
    if (pendingData) {
      onSubmit(pendingData);
    }
    setShowConfirmDialog(false);
    setPendingData(null);
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
    setPendingData(null);
  };

  if (opdLoading || programLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleNextClick)} className="space-y-6">
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
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <FormItem className="flex items-center space-x-3 space-y-0 cursor-help">
                        <FormControl>
                          <RadioGroupItem value="up" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-help flex items-center gap-1">
                          UP (Uang Persediaan)
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </FormLabel>
                      </FormItem>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Pajak yang akan dipotong:</h4>
                        {taxMapping["up"] && taxMapping["up"].length > 0 ? (
                          <div className="space-y-1">
                            {taxMapping["up"].map((tax) => (
                              <div key={tax.id} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{tax.nama}</span>
                                <span className="font-medium">{tax.tarif}%</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Belum ada pajak terkonfigurasi</p>
                        )}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <FormItem className="flex items-center space-x-3 space-y-0 cursor-help">
                        <FormControl>
                          <RadioGroupItem value="gu" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-help flex items-center gap-1">
                          GU (Ganti Uang)
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </FormLabel>
                      </FormItem>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Pajak yang akan dipotong:</h4>
                        {taxMapping["gu"] && taxMapping["gu"].length > 0 ? (
                          <div className="space-y-1">
                            {taxMapping["gu"].map((tax) => (
                              <div key={tax.id} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{tax.nama}</span>
                                <span className="font-medium">{tax.tarif}%</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Belum ada pajak terkonfigurasi</p>
                        )}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <FormItem className="flex items-center space-x-3 space-y-0 cursor-help">
                        <FormControl>
                          <RadioGroupItem value="tu" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-help flex items-center gap-1">
                          TU (Tambah Uang)
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </FormLabel>
                      </FormItem>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Pajak yang akan dipotong:</h4>
                        {taxMapping["tu"] && taxMapping["tu"].length > 0 ? (
                          <div className="space-y-1">
                            {taxMapping["tu"].map((tax) => (
                              <div key={tax.id} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{tax.nama}</span>
                                <span className="font-medium">{tax.tarif}%</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Belum ada pajak terkonfigurasi</p>
                        )}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <FormItem className="flex items-center space-x-3 space-y-0 cursor-help">
                        <FormControl>
                          <RadioGroupItem value="ls_gaji" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-help flex items-center gap-1">
                          LS Gaji
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </FormLabel>
                      </FormItem>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Pajak yang akan dipotong:</h4>
                        {taxMapping["ls_gaji"] && taxMapping["ls_gaji"].length > 0 ? (
                          <div className="space-y-1">
                            {taxMapping["ls_gaji"].map((tax) => (
                              <div key={tax.id} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{tax.nama}</span>
                                <span className="font-medium">{tax.tarif}%</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Belum ada pajak terkonfigurasi</p>
                        )}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <FormItem className="flex items-center space-x-3 space-y-0 cursor-help">
                        <FormControl>
                          <RadioGroupItem value="ls_barang_jasa" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-help flex items-center gap-1">
                          LS Barang & Jasa
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </FormLabel>
                      </FormItem>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Pajak yang akan dipotong:</h4>
                        {taxMapping["ls_barang_jasa"] && taxMapping["ls_barang_jasa"].length > 0 ? (
                          <div className="space-y-1">
                            {taxMapping["ls_barang_jasa"].map((tax) => (
                              <div key={tax.id} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{tax.nama}</span>
                                <span className="font-medium">{tax.tarif}%</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Belum ada pajak terkonfigurasi</p>
                        )}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <FormItem className="flex items-center space-x-3 space-y-0 cursor-help">
                        <FormControl>
                          <RadioGroupItem value="ls_belanja_modal" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-help flex items-center gap-1">
                          LS Belanja Modal
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </FormLabel>
                      </FormItem>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Pajak yang akan dipotong:</h4>
                        {taxMapping["ls_belanja_modal"] && taxMapping["ls_belanja_modal"].length > 0 ? (
                          <div className="space-y-1">
                            {taxMapping["ls_belanja_modal"].map((tax) => (
                              <div key={tax.id} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{tax.nama}</span>
                                <span className="font-medium">{tax.tarif}%</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Belum ada pajak terkonfigurasi</p>
                        )}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
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
              {nilaiSpm > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-sm text-muted-foreground italic flex-1">
                    <span className="font-medium">Terbilang:</span> {terbilangRupiah(nilaiSpm)}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => speak(terbilangRupiah(nilaiSpm))}
                    className={isSpeaking ? "animate-pulse" : ""}
                    title="Dengarkan terbilang"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
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

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Nilai SPM</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Apakah nilai SPM sudah benar?</p>
              </div>
              {pendingData && (
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Nilai SPM:</span>
                    <span className="text-lg font-bold text-primary">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(pendingData.nilai_spm)}
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <p className="text-xs text-muted-foreground italic">
                      <span className="font-medium">Terbilang:</span>{' '}
                      {terbilangRupiah(pendingData.nilai_spm)}
                    </p>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              ❌ Tidak, Koreksi
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              ✅ Ya, Benar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
};
