import { useState, useEffect } from "react";
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
import { RefreshCw } from "lucide-react";
import { useRequestSp2dOtp } from "@/hooks/useRequestSp2dOtp";

interface Sp2dVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (otp: string) => void;
  loading?: boolean;
  sp2dId: string;
  userId: string;
}

export const Sp2dVerificationDialog = ({
  open,
  onOpenChange,
  onVerify,
  loading = false,
  sp2dId,
  userId,
}: Sp2dVerificationDialogProps) => {
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);
  
  const requestOtp = useRequestSp2dOtp();

  // Countdown timer - only runs when countdown > 0
  useEffect(() => {
    if (countdown <= 0) return;
    
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  const handleSubmit = () => {
    if (otp.length === 6) {
      onVerify(otp);
      setOtp("");
    }
  };

  const handleRequestOtp = () => {
    requestOtp.mutate(
      { sp2dId, userId },
      {
        onSuccess: () => {
          setCountdown(60);
          setCanResend(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
      <DialogHeader>
        <DialogTitle>Verifikasi OTP</DialogTitle>
        <DialogDescription>
          Masukkan kode OTP 6 digit yang telah dikirimkan ke WhatsApp Anda
        </DialogDescription>
      </DialogHeader>

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
        
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleRequestOtp}
          disabled={!canResend || requestOtp.isPending || loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${requestOtp.isPending ? 'animate-spin' : ''}`} />
          {requestOtp.isPending 
            ? "Mengirim..." 
            : canResend 
            ? "Minta OTP" 
            : `Minta OTP (${countdown}s)`}
        </Button>
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
