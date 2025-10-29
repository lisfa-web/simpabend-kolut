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
import { Loader2 } from "lucide-react";

interface NomorPengujiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (nomorPenguji: string) => void;
  loading: boolean;
}

export const NomorPengujiDialog = ({
  open,
  onOpenChange,
  onSubmit,
  loading,
}: NomorPengujiDialogProps) => {
  const [nomorPenguji, setNomorPenguji] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nomorPenguji.trim()) {
      onSubmit(nomorPenguji.trim());
      setNomorPenguji("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Input Nomor Penguji</DialogTitle>
            <DialogDescription>
              Masukkan nomor penguji untuk mengirim SP2D ke Bank Sultra
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nomor_penguji">Nomor Penguji</Label>
              <Input
                id="nomor_penguji"
                placeholder="Masukkan nomor penguji"
                value={nomorPenguji}
                onChange={(e) => setNomorPenguji(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading || !nomorPenguji.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kirim ke Bank
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
