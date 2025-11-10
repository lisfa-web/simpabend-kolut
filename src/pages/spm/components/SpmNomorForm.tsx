import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, FileText, AlertCircle, Sparkles, Check, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { useCheckNomorSpmExists } from "@/hooks/useCheckNomorSpm";
import { supabase } from "@/integrations/supabase/client";

interface SpmNomorFormProps {
  initialNomor?: string;
  onSubmit: (nomor: string) => void;
  onBack: () => void;
  isSubmitting?: boolean;
  spmId?: string;
}

export const SpmNomorForm = ({
  initialNomor,
  onSubmit,
  onBack,
  isSubmitting = false,
  spmId,
}: SpmNomorFormProps) => {
  const [nomorSpm, setNomorSpm] = useState(initialNomor || "");
  const [error, setError] = useState("");
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { data: checkResult, isLoading: isCheckingDuplicate } = useCheckNomorSpmExists(
    nomorSpm,
    spmId
  );

  // Auto-generate if toggle is on and field is empty
  useEffect(() => {
    if (autoGenerate && !nomorSpm && !isGenerating) {
      handleAutoGenerate();
    }
  }, [autoGenerate]);

  const handleAutoGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.rpc("generate_document_number", {
        _jenis_dokumen: "spm",
        _tanggal: new Date().toISOString(),
      });
      
      if (error) throw error;
      
      if (data) {
        setNomorSpm(data);
        setError("");
      }
    } catch (err: any) {
      setError(err.message || "Gagal generate nomor otomatis");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = () => {
    if (!nomorSpm.trim()) {
      setError("Nomor SPM harus diisi");
      return;
    }
    
    if (checkResult?.exists) {
      setError("Nomor SPM sudah digunakan, gunakan nomor lain");
      return;
    }
    
    setError("");
    onSubmit(nomorSpm.trim());
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-semibold text-lg">Input Nomor SPM</h3>
              <p className="text-sm text-muted-foreground">
                Masukkan nomor SPM secara manual untuk dokumen ini
              </p>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nomor SPM harus diinput secara manual sebelum dapat menyimpan atau mengajukan SPM.
              Format nomor bebas sesuai dengan sistem penomoran yang berlaku.
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div className="space-y-0.5">
              <Label>Generate Nomor Otomatis</Label>
              <p className="text-xs text-muted-foreground">
                Sistem akan membuat nomor SPM sesuai format yang dikonfigurasi
              </p>
            </div>
            <Switch
              checked={autoGenerate}
              onCheckedChange={(checked) => {
                setAutoGenerate(checked);
                if (!checked) {
                  setNomorSpm("");
                  setError("");
                }
              }}
              disabled={isGenerating}
            />
          </div>

          {!autoGenerate && (
            <div className="space-y-2">
              <Label htmlFor="nomor_spm">
                Nomor SPM <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="nomor_spm"
                  value={nomorSpm}
                  onChange={(e) => {
                    setNomorSpm(e.target.value);
                    setError("");
                  }}
                  placeholder="Contoh: SPM/001/BKAD/2025"
                  className={
                    error || checkResult?.exists
                      ? "border-destructive pr-10"
                      : checkResult?.exists === false && nomorSpm
                      ? "border-primary pr-10"
                      : "pr-10"
                  }
                  disabled={isSubmitting}
                />
                {isCheckingDuplicate && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {!isCheckingDuplicate && nomorSpm && checkResult?.exists === false && (
                  <Check className="absolute right-3 top-3 h-4 w-4 text-primary" />
                )}
                {!isCheckingDuplicate && checkResult?.exists && (
                  <X className="absolute right-3 top-3 h-4 w-4 text-destructive" />
                )}
              </div>
              {error && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {error}
                </p>
              )}
              {!error && checkResult?.exists && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Nomor SPM sudah digunakan
                </p>
              )}
              {!error && checkResult?.exists === false && nomorSpm && (
                <p className="text-sm text-primary flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Nomor SPM tersedia
                </p>
              )}
            </div>
          )}

          {autoGenerate && nomorSpm && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Nomor yang Di-generate:</p>
              </div>
              <p className="text-lg font-bold text-primary font-mono">{nomorSpm}</p>
            </div>
          )}

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">Tips Penomoran:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Gunakan format yang konsisten dan mudah dilacak</li>
              <li>• Sertakan tahun untuk memudahkan identifikasi</li>
              <li>• Pastikan nomor tidak duplikat dengan SPM lain</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-primary">
        <div className="space-y-4">
          <h4 className="font-semibold">Catatan Penting</h4>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-sm font-medium">Status: Draft</p>
            <p className="text-xs text-muted-foreground mt-1">
              SPM akan disimpan dengan status "Draft". Setelah tersimpan, Anda dapat mengajukannya untuk verifikasi dari halaman daftar SPM.
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-between gap-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBack}
          disabled={isSubmitting}
        >
          Kembali
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            isCheckingDuplicate ||
            !nomorSpm ||
            checkResult?.exists === true
          }
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan SPM"
          )}
        </Button>
      </div>
    </div>
  );
};
