import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SpmNomorFormProps {
  initialNomor?: string;
  onSubmit: (nomor: string, isDraft: boolean) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export const SpmNomorForm = ({
  initialNomor,
  onSubmit,
  onBack,
  isSubmitting = false,
}: SpmNomorFormProps) => {
  const [nomorSpm, setNomorSpm] = useState(initialNomor || "");
  const [error, setError] = useState("");

  const handleSubmit = (isDraft: boolean) => {
    if (!nomorSpm.trim()) {
      setError("Nomor SPM harus diisi");
      return;
    }
    setError("");
    onSubmit(nomorSpm.trim(), isDraft);
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

          <div className="space-y-2">
            <Label htmlFor="nomor_spm">
              Nomor SPM <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nomor_spm"
              value={nomorSpm}
              onChange={(e) => {
                setNomorSpm(e.target.value);
                setError("");
              }}
              placeholder="Contoh: SPM/001/BKAD/2025"
              className={error ? "border-destructive" : ""}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

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
          <h4 className="font-semibold">Status Setelah Submit</h4>
          <div className="grid gap-3">
            <div className="p-3 bg-secondary/50 rounded-lg">
              <p className="text-sm font-medium">Simpan sebagai Draft</p>
              <p className="text-xs text-muted-foreground mt-1">
                SPM akan disimpan dengan status "Draft". Anda masih bisa mengedit dan mengajukan nanti.
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium">Ajukan untuk Verifikasi</p>
              <p className="text-xs text-muted-foreground mt-1">
                SPM akan langsung diajukan untuk verifikasi oleh Resepsionis. Tidak bisa diedit setelah diajukan.
              </p>
            </div>
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
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan sebagai Draft"
            )}
          </Button>
          <Button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengajukan...
              </>
            ) : (
              "Ajukan untuk Verifikasi"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
