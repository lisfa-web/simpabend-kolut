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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useConfigSistem } from "@/hooks/useConfigSistem";

interface Sp2dVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (otp: string) => void;
  loading?: boolean;
}

export const Sp2dVerificationDialog = ({
  open,
  onOpenChange,
  onVerify,
  loading = false,
}: Sp2dVerificationDialogProps) => {
  const [otp, setOtp] = useState("");
  const { data: configData } = useConfigSistem();
  
  const isTestMode = configData?.find(c => c.key === "otp_test_mode")?.value === "true";
  const testOtpCode = configData?.find(c => c.key === "otp_test_code")?.value || "123456";

  const handleSubmit = () => {
    if (otp.length === 6) {
      onVerify(otp);
      setOtp("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verifikasi OTP</DialogTitle>
          <DialogDescription>
            Masukkan kode OTP 6 digit yang telah dikirimkan untuk memverifikasi SP2D
          </DialogDescription>
        </DialogHeader>

        {isTestMode && (
          <Alert className="mt-4">
            <AlertDescription>
              🧪 <strong>Mode Testing:</strong> Gunakan OTP <strong>{testOtpCode}</strong>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Kode OTP</Label>
            <Input
              id="otp"
              type="text"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="text-center text-2xl tracking-widest"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOtp("");
              onOpenChange(false);
            }}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={otp.length !== 6 || loading}
          >
            {loading ? "Memverifikasi..." : "Verifikasi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
