import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Loader2, Info } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useFormatNomorDetail, useFormatNomorMutation } from "@/hooks/useFormatNomor";

interface FormData {
  format: string;
  counter: number;
}

const FormatNomorForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: format, isLoading } = useFormatNomorDetail(id!);
  const { updateFormat } = useFormatNomorMutation();

  const { register, handleSubmit, watch } = useForm<FormData>({
    values: format
      ? {
          format: format.format,
          counter: format.counter || 0,
        }
      : undefined,
  });

  const watchFormat = watch("format");
  const watchCounter = watch("counter");

  const generatePreview = () => {
    if (!watchFormat) return "-";
    const now = new Date();
    const tahun = now.getFullYear();
    const bulan = String(now.getMonth() + 1).padStart(2, "0");
    const romawi = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const romawiBulan = romawi[now.getMonth()];

    return watchFormat
      .replace("{nomor}", String((watchCounter || 0) + 1).padStart(4, "0"))
      .replace("{tahun}", String(tahun))
      .replace("{bulan}", bulan)
      .replace("{romawi_bulan}", romawiBulan);
  };

  const onSubmit = (data: FormData) => {
    if (!id) return;
    updateFormat.mutate(
      { id, format: data.format, counter: data.counter },
      {
        onSuccess: () => navigate("/pengaturan/format-nomor"),
      }
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Format Nomor</h1>
          <p className="text-muted-foreground mt-2">
            Ubah format penomoran dokumen {format?.jenis_dokumen}
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Placeholder yang tersedia:</p>
              <ul className="text-sm space-y-1 mt-2">
                <li>
                  <code className="bg-muted px-1 rounded">{"{{nomor}}"}</code> - Counter otomatis (0001, 0002, ...)
                </li>
                <li>
                  <code className="bg-muted px-1 rounded">{"{{tahun}}"}</code> - Tahun (2025)
                </li>
                <li>
                  <code className="bg-muted px-1 rounded">{"{{bulan}}"}</code> - Bulan (01-12)
                </li>
                <li>
                  <code className="bg-muted px-1 rounded">{"{{romawi_bulan}}"}</code> - Bulan Romawi (I-XII)
                </li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Format</CardTitle>
              <CardDescription>Sesuaikan format penomoran</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Jenis Dokumen</Label>
                <Input value={format?.jenis_dokumen || ""} disabled />
              </div>

              <div className="space-y-2">
                <Label>Tahun</Label>
                <Input value={format?.tahun || new Date().getFullYear()} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">
                  Format <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="format"
                  {...register("format", { required: true })}
                  placeholder="Contoh: {nomor}/SPM-BKAD/{bulan}/{tahun}"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="counter">Counter Saat Ini</Label>
                <Input
                  id="counter"
                  type="number"
                  {...register("counter", { valueAsNumber: true, min: 0 })}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">
                  Nomor dokumen berikutnya akan dimulai dari counter + 1
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <Label className="text-sm text-muted-foreground">Preview Nomor</Label>
                <div className="font-mono text-lg text-primary mt-2">
                  {generatePreview()}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={updateFormat.isPending}>
              {updateFormat.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Simpan Perubahan
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/pengaturan/format-nomor")}
            >
              Batal
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default FormatNomorForm;
