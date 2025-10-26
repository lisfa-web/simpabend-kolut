import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Trash2, Calculator, Info } from "lucide-react";
import { CurrencyInput } from "./CurrencyInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { JENIS_PAJAK_OPTIONS, getSuggestedTaxes } from "@/hooks/usePajakPotonganSpm";
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

interface PajakFormData {
  jenis_pajak: string;
  rekening_pajak: string;
  uraian: string;
  tarif: number;
  dasar_pengenaan: number;
  jumlah_pajak: number;
}

interface SpmPajakFormProps {
  jenisSpm: string;
  nilaiSpm: number;
  potonganPajak: PajakFormData[];
  onPotonganChange: (pajak: PajakFormData[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const SpmPajakForm = ({
  jenisSpm,
  nilaiSpm,
  potonganPajak,
  onPotonganChange,
  onNext,
  onBack,
}: SpmPajakFormProps) => {
  const [pajaks, setPajaks] = useState<PajakFormData[]>(potonganPajak || []);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Jenis SPM yang memerlukan pajak
  const requiresPajak = ['ls_gaji', 'ls_barang_jasa', 'ls_belanja_modal'].includes(jenisSpm);
  
  const { speak } = useSpeechSynthesis();

  useEffect(() => {
    // Auto-suggest pajak jika belum ada dan SPM type memerlukan pajak
    if (requiresPajak && pajaks.length === 0 && nilaiSpm > 0) {
      const suggestions = getSuggestedTaxes(jenisSpm);
      const initialPajak = suggestions.map(sug => {
        const pajakOption = JENIS_PAJAK_OPTIONS.find(opt => opt.value === sug.jenis);
        const dasarPengenaan = nilaiSpm;
        const jumlahPajak = Math.round((dasarPengenaan * sug.tarif) / 100);
        
        return {
          jenis_pajak: sug.jenis,
          rekening_pajak: pajakOption?.rekening || "",
          uraian: sug.uraian,
          tarif: sug.tarif,
          dasar_pengenaan: dasarPengenaan,
          jumlah_pajak: jumlahPajak,
        };
      });
      
      setPajaks(initialPajak);
    }
  }, [jenisSpm, nilaiSpm, requiresPajak, pajaks.length]);

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

    // Auto-calculate jumlah_pajak when tarif or dasar_pengenaan changes
    if (field === "tarif" || field === "dasar_pengenaan") {
      const tarif = field === "tarif" ? value : updated[index].tarif;
      const dasarPengenaan = field === "dasar_pengenaan" ? value : updated[index].dasar_pengenaan;
      updated[index].jumlah_pajak = Math.round((dasarPengenaan * tarif) / 100);
    }

    // Auto-fill rekening when jenis_pajak changes
    if (field === "jenis_pajak") {
      const pajakOption = JENIS_PAJAK_OPTIONS.find(opt => opt.value === value);
      updated[index].rekening_pajak = pajakOption?.rekening || "";
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
        if (!p.jenis_pajak || !p.uraian || p.tarif <= 0 || p.dasar_pengenaan <= 0) {
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
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Jenis Pajak" />
                      </SelectTrigger>
                      <SelectContent>
                        {JENIS_PAJAK_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
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
                  <Label>Uraian *</Label>
                  <Input
                    value={pajak.uraian}
                    onChange={(e) => handlePajakChange(index, "uraian", e.target.value)}
                    placeholder="Contoh: PPh 21 Gaji Pegawai"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Tarif (%) *</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={pajak.tarif}
                      onChange={(e) => handlePajakChange(index, "tarif", parseFloat(e.target.value) || 0)}
                      placeholder="0.0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Dasar Pengenaan *</Label>
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
                    <Label>Jumlah Pajak</Label>
                    <Input
                      value={formatCurrency(pajak.jumlah_pajak)}
                      readOnly
                      className="bg-muted font-semibold"
                    />
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
                    const pajakOption = JENIS_PAJAK_OPTIONS.find(opt => opt.value === pajak.jenis_pajak);
                    return (
                      <div key={index} className="border rounded-lg p-3 space-y-2 bg-background">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-primary">
                            #{index + 1} {pajakOption?.label || pajak.jenis_pajak}
                          </span>
                          <span className="text-sm font-bold text-destructive">
                            -{formatCurrency(pajak.jumlah_pajak)}
                          </span>
                        </div>
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p><span className="font-medium">Uraian:</span> {pajak.uraian}</p>
                          <p><span className="font-medium">Tarif:</span> {pajak.tarif}%</p>
                          <p>
                            <span className="font-medium">Dasar Pengenaan:</span>{' '}
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
