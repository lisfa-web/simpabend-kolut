import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Trash2, Calculator, Info, AlertCircle } from "lucide-react";
import { CurrencyInput } from "./CurrencyInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { useMasterPajakOptions, useSuggestedTaxes } from "@/hooks/usePajakPotonganSpm";
import { usePajakPerJenisSpmList } from "@/hooks/usePajakPerJenisSpmList";
import { formatCurrency } from "@/lib/currency";
import { Separator } from "@/components/ui/separator";
import { terbilangRupiah } from "@/lib/formatHelpers";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface PajakFormData {
  jenis_pajak: string;
  nama_pajak?: string; // Add this for display
  rekening_pajak: string;
  uraian: string; // filled from master_pajak deskripsi
  tarif?: number; // optional, untuk backward compatibility
  dasar_pengenaan: number;
  jumlah_pajak: number;
}

interface SpmPajakFormProps {
  jenisSpm: string;
  adaPajak?: boolean;
  nilaiSpm: number;
  potonganPajak: PajakFormData[];
  onPotonganChange: (pajak: PajakFormData[]) => void;
  onNext: () => void;
  onBack: () => void;
  initialSelectedOptionalTaxes?: string[]; // optional preselection from previous step
}

export const SpmPajakForm = ({
  jenisSpm,
  adaPajak = true,
  nilaiSpm,
  potonganPajak,
  onPotonganChange,
  onNext,
  onBack,
  initialSelectedOptionalTaxes,
}: SpmPajakFormProps) => {
  const navigate = useNavigate();
  const [pajaks, setPajaks] = useState<PajakFormData[]>(potonganPajak || []);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedOptionalTaxes, setSelectedOptionalTaxes] = useState<string[]>([]);
  
  // Sync state dengan data potongan dari parent saat edit
  useEffect(() => {
    if (potonganPajak && potonganPajak.length > 0) {
      setPajaks(potonganPajak);
    }
  }, [potonganPajak]);
  // Use ada_pajak from jenis_spm master data
  const requiresPajak = adaPajak;
  
  const { speak } = useSpeechSynthesis();
  
  // Fetch master pajak options and suggested taxes from database
  const { data: pajakOptions = [], isLoading: isLoadingPajak } = useMasterPajakOptions();
  const { data: suggestedTaxes = [], isLoading: isLoadingSuggested } = useSuggestedTaxes(
    requiresPajak ? jenisSpm : null
  );
  
  // Fetch optional taxes for this SPM type
  const { data: allTaxesForType = [] } = usePajakPerJenisSpmList({ 
    jenis_spm: requiresPajak ? jenisSpm : undefined 
  });
  
  const optionalTaxes = allTaxesForType.filter(t => !t.is_default);
  
  // Initialize from pre-selected optional taxes (from previous step)
  const initializedFromProps = useRef(false);
  useEffect(() => {
    if (!initializedFromProps.current && initialSelectedOptionalTaxes && initialSelectedOptionalTaxes.length > 0 && optionalTaxes.length > 0) {
      initialSelectedOptionalTaxes.forEach((id) => handleOptionalTaxToggle(id, true));
      initializedFromProps.current = true;
    }
  }, [initialSelectedOptionalTaxes, optionalTaxes]);
  useEffect(() => {
    // Auto-suggest pajak jika belum ada dan SPM type memerlukan pajak
    if (requiresPajak && pajaks.length === 0 && nilaiSpm > 0 && suggestedTaxes.length > 0) {
      const initialPajak = suggestedTaxes.map(sug => {
        const pajakOption = pajakOptions.find(opt => opt.value === sug.jenis);
        return {
          jenis_pajak: sug.jenis,
          nama_pajak: pajakOption?.label || sug.jenis,
          rekening_pajak: sug.rekening || "",
          uraian: sug.uraian,
          tarif: 0,
          dasar_pengenaan: nilaiSpm,
          jumlah_pajak: 0, // User will input manually
        };
      });
      
      setPajaks(initialPajak);
    }
  }, [jenisSpm, nilaiSpm, requiresPajak, pajaks.length, suggestedTaxes]);

  // Handle optional tax selection
  const handleOptionalTaxToggle = (taxId: string, checked: boolean) => {
    if (checked) {
      setSelectedOptionalTaxes(prev => [...prev, taxId]);
      
      // Add pajak to list
      const optionalTax = optionalTaxes.find(t => t.id === taxId);
      if (optionalTax && optionalTax.master_pajak) {
        setPajaks(prev => [...prev, {
          jenis_pajak: optionalTax.master_pajak!.jenis_pajak,
          nama_pajak: optionalTax.master_pajak!.nama_pajak,
          rekening_pajak: optionalTax.master_pajak!.rekening_pajak,
          uraian: optionalTax.uraian_template || optionalTax.master_pajak!.deskripsi || optionalTax.master_pajak!.nama_pajak,
          tarif: 0,
          dasar_pengenaan: nilaiSpm,
          jumlah_pajak: 0, // User will input manually
        }]);
      }
    } else {
      setSelectedOptionalTaxes(prev => prev.filter(id => id !== taxId));
      
      // Remove pajak from list
      const optionalTax = optionalTaxes.find(t => t.id === taxId);
      if (optionalTax && optionalTax.master_pajak) {
        setPajaks(prev => prev.filter(p => p.jenis_pajak !== optionalTax.master_pajak!.jenis_pajak));
      }
    }
  };

  const totalPotongan = pajaks.reduce((sum, p) => sum + (p.jumlah_pajak || 0), 0);
  const nilaiBersih = nilaiSpm - totalPotongan;

  const handleAddPajak = () => {
    setPajaks([
      ...pajaks,
      {
        jenis_pajak: "",
        rekening_pajak: "",
        uraian: "",
        tarif: 0,
        dasar_pengenaan: nilaiSpm,
        jumlah_pajak: 0,
      },
    ]);
  };

  const handleRemovePajak = (index: number) => {
    setPajaks(pajaks.filter((_, i) => i !== index));
  };

  const handlePajakChange = (index: number, field: keyof PajakFormData, value: any) => {
    const updated = [...pajaks];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-fill rekening and deskripsi when jenis_pajak changes
    if (field === "jenis_pajak") {
      const pajakOption = pajakOptions.find(opt => opt.value === value);
      updated[index].rekening_pajak = pajakOption?.rekening || "";
      updated[index].uraian = pajakOption?.deskripsi || pajakOption?.label || "";
      updated[index].nama_pajak = pajakOption?.label || "";
    }

    setPajaks(updated);
  };

  const handleNext = () => {
    // Validasi: total potongan tidak boleh melebihi nilai SPM
    if (totalPotongan > nilaiSpm) {
      alert("Total potongan tidak boleh melebihi nilai SPM!");
      return;
    }

    // Validasi: semua field wajib diisi untuk SPM yang require pajak
    if (requiresPajak) {
      for (let i = 0; i < pajaks.length; i++) {
        const p = pajaks[i];
        if (!p.jenis_pajak || p.dasar_pengenaan <= 0 || p.jumlah_pajak <= 0) {
          alert(`Pajak #${i + 1} belum lengkap. Mohon lengkapi semua field.`);
          return;
        }
      }
    }

    // Bacakan ringkasan perhitungan
    const terbilangText = `Nilai bruto ${terbilangRupiah(nilaiSpm)}. Total potongan ${terbilangRupiah(totalPotongan)}. Nilai bersih ${terbilangRupiah(nilaiBersih)}`;
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(terbilangText);
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
    onPotonganChange(pajaks);
    setShowConfirmDialog(false);
    onNext();
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
  };

  // Jika jenis SPM tidak perlu pajak, tampilkan info dan skip
  if (!requiresPajak) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Potongan Pajak</CardTitle>
          <CardDescription>
            Jenis SPM ini tidak memerlukan potongan pajak
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              SPM jenis <strong>{jenisSpm.toUpperCase().replace(/_/g, ' ')}</strong> tidak memiliki potongan pajak saat penerbitan SPM.
              {jenisSpm === 'gu' && " Pajak sudah dipotong saat realisasi belanja UP sebelumnya."}
            </AlertDescription>
          </Alert>

          <div className="flex justify-between mt-6">
            <Button type="button" variant="outline" onClick={onBack}>
              Kembali
            </Button>
            <Button type="button" onClick={handleNext}>
              Selanjutnya
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Potongan Pajak SPM</CardTitle>
          <CardDescription>
            Tentukan rincian pajak yang akan dipotong dari SPM ini
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Sistem telah menyarankan pajak berdasarkan jenis SPM <strong>{jenisSpm.toUpperCase().replace(/_/g, ' ')}</strong>.
              Anda dapat mengedit atau menambahkan pajak lain sesuai kebutuhan.
            </AlertDescription>
          </Alert>

          {!isLoadingPajak && pajakOptions.length === 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Belum ada Master Pajak aktif. Silakan tambahkan master pajak terlebih dahulu.</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/masterdata/pajak')}
                >
                  Buka Master Pajak
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Optional Taxes Selection */}
          {optionalTaxes.length > 0 && (
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Pajak Opsional
                </CardTitle>
                <CardDescription>
                  Pilih pajak tambahan yang ingin dipotong (jika ada)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {optionalTaxes.map((tax) => (
                  <div key={tax.id} className="flex items-center space-x-3 p-3 rounded-lg bg-background border">
                    <Checkbox
                      id={`opt-tax-${tax.id}`}
                      checked={selectedOptionalTaxes.includes(tax.id)}
                      onCheckedChange={(checked) => handleOptionalTaxToggle(tax.id, checked as boolean)}
                    />
                    <label
                      htmlFor={`opt-tax-${tax.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{tax.master_pajak?.nama_pajak}</p>
                          {tax.uraian_template && (
                            <p className="text-xs text-muted-foreground">{tax.uraian_template}</p>
                          )}
                        </div>
                        <span className="font-semibold text-primary">
                          {tax.tarif_khusus || tax.master_pajak?.tarif_default}%
                        </span>
                      </div>
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {pajaks.map((pajak, index) => (
            <Card key={index} className="border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">
                  Pajak #{index + 1}
                </CardTitle>
                {pajaks.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePajak(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Jenis Pajak *</Label>
                    <Select
                      value={pajak.jenis_pajak}
                      onValueChange={(val) => handlePajakChange(index, "jenis_pajak", val)}
                      disabled={isLoadingPajak}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Jenis Pajak" />
                      </SelectTrigger>
                      <SelectContent>
                        {pajakOptions.map((opt) => (
                          <HoverCard key={opt.value} openDelay={200}>
                            <HoverCardTrigger asChild>
                              <SelectItem value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            </HoverCardTrigger>
                            <HoverCardContent side="right" className="w-80">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-sm">{opt.label}</h4>
                                <div className="text-xs space-y-1">
                                  <p><span className="font-medium">Kode:</span> {opt.kode}</p>
                                  <p><span className="font-medium">Rekening:</span> {opt.rekening}</p>
                                  <p><span className="font-medium">Tarif Default:</span> {opt.tarif_default}%</p>
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Rekening Pajak</Label>
                    <Input
                      value={pajak.rekening_pajak}
                      onChange={(e) => handlePajakChange(index, "rekening_pajak", e.target.value)}
                      placeholder="Otomatis terisi"
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
                    {pajak.uraian || "Pilih jenis pajak untuk melihat deskripsi"}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nilai SPM *</Label>
                    <CurrencyInput
                      value={pajak.dasar_pengenaan}
                      onChange={(val) => handlePajakChange(index, "dasar_pengenaan", val)}
                    />
                    {pajak.dasar_pengenaan > 0 && (
                      <p className="text-xs text-muted-foreground italic">
                        {terbilangRupiah(pajak.dasar_pengenaan)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Potongan Pajak *</Label>
                    <CurrencyInput
                      value={pajak.jumlah_pajak}
                      onChange={(val) => handlePajakChange(index, "jumlah_pajak", val)}
                    />
                    {pajak.jumlah_pajak > 0 && (
                      <p className="text-xs text-muted-foreground italic">
                        {terbilangRupiah(pajak.jumlah_pajak)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={handleAddPajak}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Pajak Lain
          </Button>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Ringkasan Perhitungan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-lg">
              <span>Nilai SPM (Bruto):</span>
              <span className="font-bold">{formatCurrency(nilaiSpm)}</span>
            </div>
            <div className="flex justify-between text-lg text-destructive">
              <span>Total Potongan:</span>
              <span className="font-bold">-{formatCurrency(totalPotongan)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-xl">
              <span className="font-semibold">Nilai Bersih (Netto):</span>
              <span className="font-bold text-primary">{formatCurrency(nilaiBersih)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Kembali
        </Button>
        <Button type="button" onClick={handleNext}>
          Selanjutnya
        </Button>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Perhitungan Pajak</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Apakah perhitungan sudah benar?</p>
              </div>
              <div className="rounded-lg bg-muted p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Nilai SPM (Bruto):</span>
                  <span className="text-base font-bold text-foreground">
                    {formatCurrency(nilaiSpm)}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <p className="text-xs text-muted-foreground italic">
                    {terbilangRupiah(nilaiSpm)}
                  </p>
                </div>
                
                <Separator />
                
                {/* Rincian Potongan Pajak */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Rincian Potongan Pajak:</p>
                  {pajaks.map((pajak, index) => {
                    const pajakOption = pajakOptions.find(opt => opt.value === pajak.jenis_pajak);
                    return (
                      <div key={index} className="border rounded-lg p-3 space-y-2 bg-background">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-primary">
                            #{index + 1} {pajak.nama_pajak || pajak.jenis_pajak}
                          </span>
                          <span className="text-sm font-bold text-destructive">
                            -{formatCurrency(pajak.jumlah_pajak)}
                          </span>
                        </div>
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p><span className="font-medium">Uraian:</span> {pajak.uraian}</p>
                          <p>
                            <span className="font-medium">Nilai SPM:</span>{' '}
                            {formatCurrency(pajak.dasar_pengenaan)}
                          </p>
                        </div>
                        
                        <div className="border-t pt-1">
                          <p className="text-xs text-muted-foreground italic">
                            → {terbilangRupiah(pajak.jumlah_pajak)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Potongan:</span>
                  <span className="text-base font-bold text-destructive">
                    -{formatCurrency(totalPotongan)}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <p className="text-xs text-muted-foreground italic">
                    {terbilangRupiah(totalPotongan)}
                  </p>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center bg-primary/10 p-3 rounded">
                  <span className="text-sm font-semibold">Nilai Bersih (Netto):</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(nilaiBersih)}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <p className="text-xs text-muted-foreground italic font-medium">
                    {terbilangRupiah(nilaiBersih)}
                  </p>
                </div>
              </div>
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
    </div>
  );
};
