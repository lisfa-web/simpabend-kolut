import { CheckCircle2, FileText, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

interface SuccessSpmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nomorSpm: string;
  spmId: string;
}

export const SuccessSpmDialog = ({
  open,
  onOpenChange,
  nomorSpm,
  spmId,
}: SuccessSpmDialogProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            SPM Berhasil Disimpan!
          </DialogTitle>
          <DialogDescription className="text-center space-y-4">
            <div className="rounded-lg bg-muted p-4 mt-4">
              <p className="text-sm font-medium text-foreground mb-1">
                Nomor SPM:
              </p>
              <p className="text-lg font-bold text-primary">{nomorSpm}</p>
            </div>
            <p className="text-sm">
              SPM telah disimpan sebagai <span className="font-semibold">draft</span>. 
              Silakan ajukan SPM dari halaman daftar untuk memulai proses verifikasi.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={() => navigate(`/input-spm/detail/${spmId}`)}
            className="w-full"
          >
            <FileText className="mr-2 h-4 w-4" />
            Lihat Detail SPM
          </Button>
          <Button
            onClick={() => navigate("/input-spm/buat")}
            variant="outline"
            className="w-full"
          >
            Buat SPM Baru
          </Button>
          <Button
            onClick={() => navigate("/input-spm")}
            variant="ghost"
            className="w-full"
          >
            <List className="mr-2 h-4 w-4" />
            Ke Daftar SPM
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
