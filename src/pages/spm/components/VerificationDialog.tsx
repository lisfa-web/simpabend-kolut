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
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
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
      if (showNomorAntrian && !nomorAntrian.trim()) {
        toast.error("Nomor Antrian harus diisi");
        return;
      }
      if (showNomorBerkas && !nomorBerkas.trim()) {
        toast.error("Nomor Berkas harus diisi");
        return;
      }
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
      if (showNomorAntrian && !nomorAntrian.trim()) return true;
      if (showNomorBerkas && !nomorBerkas.trim()) return true;
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
              {showNomorAntrian && action === "approve" && (
                <div className="space-y-2">
                  <Label htmlFor="nomorAntrian">
                    Nomor Antrian <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nomorAntrian"
                    placeholder="Contoh: A-001"
                    value={nomorAntrian}
                    onChange={(e) => setNomorAntrian(e.target.value)}
                    required
                  />
                </div>
              )}

              {showNomorBerkas && action === "approve" && (
                <div className="space-y-2">
                  <Label htmlFor="nomorBerkas">
                    Nomor Berkas <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nomorBerkas"
                    placeholder="Contoh: 001/SPM/2025"
                    value={nomorBerkas}
                    onChange={(e) => setNomorBerkas(e.target.value)}
                    required
                  />
                </div>
              )}

              {showPin && action === "approve" && (
                <div className="space-y-2">
                  <Label htmlFor="pin">
                    PIN Verifikasi <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="pin"
                    type="password"
                    placeholder="Masukkan PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    maxLength={6}
                    required
                  />
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
