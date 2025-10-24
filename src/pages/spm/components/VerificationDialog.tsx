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
import { CheckCircle2, XCircle, AlertCircle, KeyRound } from "lucide-react";
import { toast } from "sonner";

interface VerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    action: "approve" | "reject" | "revise";
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
}: VerificationDialogProps) => {
  const [action, setAction] = useState<"approve" | "reject" | "revise" | null>(null);
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

    // Validasi catatan wajib untuk reject dan revise
    if ((action === "reject" || action === "revise") && !catatan.trim()) {
      toast.error("Catatan wajib diisi untuk penolakan/revisi");
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

    if ((action === "reject" || action === "revise") && !catatan.trim()) {
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
          {!action && (
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                className="flex-col h-auto py-4"
                onClick={() => setAction("approve")}
              >
                <CheckCircle2 className="h-6 w-6 text-green-600 mb-2" />
                <span className="text-sm">Setujui</span>
              </Button>
              <Button
                variant="outline"
                className="flex-col h-auto py-4"
                onClick={() => setAction("revise")}
              >
                <AlertCircle className="h-6 w-6 text-orange-600 mb-2" />
                <span className="text-sm">Revisi</span>
              </Button>
              <Button
                variant="outline"
                className="flex-col h-auto py-4"
                onClick={() => setAction("reject")}
              >
                <XCircle className="h-6 w-6 text-red-600 mb-2" />
                <span className="text-sm">Tolak</span>
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
                      <p className="text-sm font-medium">Nomor Otomatis</p>
                      <p className="text-sm text-muted-foreground">
                        Nomor Antrian dan Nomor Berkas akan digenerate secara otomatis oleh sistem setelah persetujuan.
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
                  {(action === "reject" || action === "revise") && (
                    <span className="text-destructive"> *</span>
                  )}
                </Label>
                <Textarea
                  id="catatan"
                  placeholder={
                    action === "approve"
                      ? "Tambahkan catatan jika diperlukan..."
                      : "Jelaskan alasan revisi/penolakan..."
                  }
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={4}
                  required={action === "reject" || action === "revise"}
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
