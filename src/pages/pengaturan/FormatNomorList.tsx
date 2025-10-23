import { Link } from "react-router-dom";
import { Edit2, Loader2, RotateCcw } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useFormatNomor, useFormatNomorMutation } from "@/hooks/useFormatNomor";
import { useState } from "react";

const FormatNomorList = () => {
  const { data: formats, isLoading } = useFormatNomor();
  const { resetCounter } = useFormatNomorMutation();
  const [resetDialog, setResetDialog] = useState<{ open: boolean; id?: string }>({
    open: false,
  });

  const handleResetCounter = () => {
    if (resetDialog.id) {
      resetCounter.mutate(resetDialog.id, {
        onSuccess: () => setResetDialog({ open: false }),
      });
    }
  };

  const generatePreview = (format: string, counter: number) => {
    const now = new Date();
    const tahun = now.getFullYear();
    const bulan = String(now.getMonth() + 1).padStart(2, "0");
    const romawi = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const romawiBulan = romawi[now.getMonth()];

    return format
      .replace("{nomor}", String(counter + 1).padStart(4, "0"))
      .replace("{tahun}", String(tahun))
      .replace("{bulan}", bulan)
      .replace("{romawi_bulan}", romawiBulan);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Format Nomor</h1>
          <p className="text-muted-foreground mt-2">
            Kelola format penomoran otomatis dokumen
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Format Nomor</CardTitle>
            <CardDescription>
              Atur format penomoran untuk SPM, SP2D, dan Surat
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : formats && formats.length > 0 ? (
              <div className="space-y-4">
                {formats.map((format) => (
                  <div
                    key={format.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {format.jenis_dokumen.toUpperCase()}
                        </span>
                        <Badge variant="outline">Tahun {format.tahun}</Badge>
                      </div>
                      <div className="text-sm font-mono text-muted-foreground">
                        Format: {format.format}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Preview: </span>
                        <span className="font-mono text-primary">
                          {generatePreview(format.format, format.counter || 0)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Counter saat ini: {format.counter || 0}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setResetDialog({ open: true, id: format.id })}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Link to={`/pengaturan/format-nomor/${format.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada format nomor
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={resetDialog.open} onOpenChange={(open) => setResetDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Counter?</AlertDialogTitle>
            <AlertDialogDescription>
              Counter akan direset ke 0. Tindakan ini tidak dapat dibatalkan dan akan
              mempengaruhi penomoran dokumen berikutnya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetCounter}>
              Reset Counter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default FormatNomorList;
