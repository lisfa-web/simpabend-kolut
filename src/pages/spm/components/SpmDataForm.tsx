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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CurrencyInput } from "./CurrencyInput";
import { NamaPenerimaCombobox } from "./NamaPenerimaCombobox";
import { useOpdList } from "@/hooks/useOpdList";
import { useJenisSpmList } from "@/hooks/useJenisSpmList";
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
  selectedOptionalTaxIds?: string[];
  onToggleOptionalTax?: (taxId: string, checked: boolean) => void;
}

export const SpmDataForm = ({ defaultValues, onSubmit, onBack }: SpmDataFormProps) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingData, setPendingData] = useState<SpmDataFormValues | null>(null);

  const form = useForm<SpmDataFormValues>({
    resolver: zodResolver(spmDataSchema),
    defaultValues: {
      tanggal_ajuan: new Date(),
      jenis_spm_id: "",
      nilai_spm: 0,
      opd_id: "",
      uraian: "",
      is_aset: false,
      ...defaultValues,
    },
  });

  const jenisSpmId = form.watch("jenis_spm_id");
  const nilaiSpm = form.watch("nilai_spm");
  const isAset = form.watch("is_aset");
  const tipePenerima = form.watch("tipe_penerima");

  const { speak, isSpeaking } = useSpeechSynthesis();

  const { data: opdList, isLoading: opdLoading } = useOpdList({ is_active: true });
  const { data: jenisSpmList, isLoading: jenisSpmLoading } = useJenisSpmList({ is_active: true });

  // Get selected jenis SPM data
  const selectedJenisSpm = jenisSpmList?.find((j) => j.id === jenisSpmId);

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
        setShowConfirmDialog(true);
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
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

  if (opdLoading || jenisSpmLoading) {
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
          name="jenis_spm_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jenis SPM</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Jenis SPM" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {jenisSpmList?.map((jenis) => (
                    <SelectItem key={jenis.id} value={jenis.id}>
                      {jenis.nama_jenis}
                      {jenis.deskripsi && ` - ${jenis.deskripsi}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedJenisSpm && (
                <p className="text-sm text-muted-foreground mt-1">
                  <Info className="h-3 w-3 inline mr-1" />
                  {selectedJenisSpm.ada_pajak 
                    ? "Jenis SPM ini ada potongan pajak" 
                    : "Jenis SPM ini tidak ada potongan pajak"}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tipe_penerima"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipe Penerima</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Tipe Penerima" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="bendahara_pengeluaran">Bendahara Pengeluaran</SelectItem>
                  <SelectItem value="vendor">Vendor (PT/CV)</SelectItem>
                  <SelectItem value="pihak_ketiga">Pihak Ketiga</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nama_penerima"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Penerima</FormLabel>
              <FormControl>
                <NamaPenerimaCombobox
                  value={field.value}
                  onChange={field.onChange}
                  tipePenerima={tipePenerima}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <FormField
          control={form.control}
          name="tanggal_ajuan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggal Ajuan</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_aset"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Belanja Aset</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Tandai jika SPM ini untuk pembelian aset
                </p>
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

        {isAset && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              SPM untuk belanja aset akan dicatat dalam sistem manajemen aset.
            </AlertDescription>
          </Alert>
        )}

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