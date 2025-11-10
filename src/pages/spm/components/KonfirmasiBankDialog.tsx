import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface KonfirmasiBankDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { nomorReferensi: string; tanggalKonfirmasi: Date }) => void;
  loading: boolean;
}

export function KonfirmasiBankDialog({
  open,
  onOpenChange,
  onSubmit,
  loading,
}: KonfirmasiBankDialogProps) {
  const [nomorReferensi, setNomorReferensi] = useState("");
  const [tanggalKonfirmasi, setTanggalKonfirmasi] = useState<Date>(new Date());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomorReferensi.trim()) {
      return;
    }
    onSubmit({
      nomorReferensi: nomorReferensi.trim(),
      tanggalKonfirmasi,
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setNomorReferensi("");
        setTanggalKonfirmasi(new Date());
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Konfirmasi dari Bank</DialogTitle>
          <DialogDescription>
            Masukkan nomor referensi bank sebagai bukti konfirmasi
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nomor-referensi">
                Nomor Referensi Bank <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nomor-referensi"
                placeholder="Contoh: REF-2024-001"
                value={nomorReferensi}
                onChange={(e) => setNomorReferensi(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Tanggal Konfirmasi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !tanggalKonfirmasi && "text-muted-foreground"
                    )}
                    disabled={loading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {tanggalKonfirmasi ? (
                      format(tanggalKonfirmasi, "dd MMMM yyyy", { locale: id })
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={tanggalKonfirmasi}
                    onSelect={(date) => setTanggalKonfirmasi(date || new Date())}
                    initialFocus
                    locale={id}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading || !nomorReferensi.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Konfirmasi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
