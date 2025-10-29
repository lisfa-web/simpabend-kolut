import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCircle2, AlertCircle, KeyRound } from "lucide-react";
import { toast } from "sonner";

interface VerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    action: "approve" | "revise";
    catatan?: string;
    nomorAntrian?: string;
    nomorBerkas?: string;
    pin?: string;
  }) => void;
  title: string;
  showNomorAntrian?: boolean;
  showNomorBerkas?: boolean;
  showPin?: boolean;
  isLoading?: boolean;
  onRequestPin?: () => void;
  isRequestingPin?: boolean;
  spmInfo?: {
    nomor_spm?: string;
    nilai_spm?: number;
    uraian?: string;
    nama_penerima?: string;
    opd_nama?: string;
  };
}

export const VerificationDialog = ({
  open,
  onOpenChange,
  onSubmit,
  title,
  showNomorAntrian = false,
  showNomorBerkas = false,
  showPin = false,
  isLoading = false,
  onRequestPin,
  isRequestingPin = false,
  spmInfo,
}: VerificationDialogProps) => {
  const [action, setAction] = useState<"approve" | "revise" | null>(null);
  const [catatan, setCatatan] = useState("");
  const [nomorAntrian, setNomorAntrian] = useState("");
  const [nomorBerkas, setNomorBerkas] = useState("");
  const [pin, setPin] = useState("");

  const handleSubmit = () => {
    if (!action) {
      toast.error("Pilih tindakan terlebih dahulu");
      return;
    }

    // Validasi untuk action approve
    if (action === "approve") {
      if (showPin && !pin.trim()) {
        toast.error("PIN harus diisi");
        return;
      }
    }

    // Validasi catatan wajib untuk revise
    if (action === "revise" && !catatan.trim()) {
      toast.error("Catatan wajib diisi untuk revisi");
      return;
    }

    onSubmit({
      action,
      catatan: catatan || undefined,
      nomorAntrian: nomorAntrian || undefined,
      nomorBerkas: nomorBerkas || undefined,
      pin: pin || undefined,
    });

    // Reset form
    setAction(null);
    setCatatan("");
    setNomorAntrian("");
    setNomorBerkas("");
    setPin("");
  };

  // Check if submit button should be disabled
  const isSubmitDisabled = () => {
    if (!action) return true;
    if (isLoading) return true;

    if (action === "approve") {
      if (showPin && !pin.trim()) return true;
    }

    if (action === "revise" && !catatan.trim()) {
      return true;
    }

    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Pilih tindakan yang akan dilakukan untuk SPM ini
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* SPM Info */}
          {spmInfo && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium">Nomor SPM:</span>
                <span className="text-sm font-semibold">{spmInfo.nomor_spm || "DRAFT"}</span>
              </div>
              {spmInfo.opd_nama && (
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium">OPD:</span>
                  <span className="text-sm text-right">{spmInfo.opd_nama}</span>
                </div>
              )}
              {spmInfo.nama_penerima && (
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium">Penerima:</span>
                  <span className="text-sm text-right">{spmInfo.nama_penerima}</span>
                </div>
              )}
              {spmInfo.nilai_spm && (
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium">Nilai SPM:</span>
                  <span className="text-sm font-semibold">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(spmInfo.nilai_spm)}
                  </span>
                </div>
              )}
              {spmInfo.uraian && (
                <div className="pt-2 border-t">
                  <span className="text-sm font-medium block mb-1">Uraian:</span>
                  <p className="text-sm text-muted-foreground">{spmInfo.uraian}</p>
                </div>
              )}
            </div>
          )}

          {!action && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="flex-col h-auto py-6"
                onClick={() => setAction("approve")}
              >
                <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-base font-medium">Setujui</span>
              </Button>
              <Button
                variant="outline"
                className="flex-col h-auto py-6"
                onClick={() => setAction("revise")}
              >
                <AlertCircle className="h-8 w-8 text-orange-600 mb-2" />
                <span className="text-base font-medium">Revisi</span>
              </Button>
            </div>
          )}

          {action && (
            <>
              {(showNomorAntrian || showNomorBerkas) && action === "approve" && (
                <div className="rounded-lg border border-muted bg-muted/50 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Nomor Antrian Otomatis</p>
                      <p className="text-sm text-muted-foreground">
                        Nomor Antrian (contoh: 001-291025) akan digenerate otomatis dengan format: nomor-tanggal (DDMMYY), reset setiap hari.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {showPin && action === "approve" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pin">
                      PIN Verifikasi <span className="text-destructive">*</span>
                    </Label>
                    {onRequestPin && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onRequestPin}
                        disabled={isRequestingPin}
                      >
                        <KeyRound className="h-4 w-4 mr-2" />
                        {isRequestingPin ? "Mengirim..." : "Minta PIN"}
                      </Button>
                    )}
                  </div>
                  <Input
                    id="pin"
                    type="password"
                    placeholder="Masukkan PIN 6 digit"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    PIN akan dikirim via Email & WhatsApp. Berlaku 15 menit.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="catatan">
                  Catatan {action === "approve" ? "(Opsional)" : ""}
                  {action === "revise" && (
                    <span className="text-destructive"> *</span>
                  )}
                </Label>
                <Textarea
                  id="catatan"
                  placeholder={
                    action === "approve"
                      ? "Tambahkan catatan jika diperlukan..."
                      : "Jelaskan alasan revisi yang diperlukan..."
                  }
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={4}
                  required={action === "revise"}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {action && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setAction(null);
                  setCatatan("");
                  setNomorAntrian("");
                  setNomorBerkas("");
                  setPin("");
                }}
              >
                Kembali
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitDisabled()}>
                {isLoading ? "Memproses..." : "Submit"}
              </Button>
            </>
          )}
          {!action && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
