import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { formatFileSize } from "@/lib/fileValidation";
import { SpmDataFormValues } from "@/schemas/spmSchema";
import { Calculator } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { terbilangRupiah } from "@/lib/formatHelpers";

interface SpmReviewFormProps {
  formData: SpmDataFormValues;
  files: {
    dokumen_spm: File[];
    tbk: File[];
    spj: File[];
    lainnya: File[];
  };
  potonganPajak?: any[];
  opdName?: string;
  jenisSpmLabel?: string;
  onNext: () => void;
  onBack: () => void;
}

export const SpmReviewForm = ({
  formData,
  files,
  potonganPajak = [],
  opdName,
  jenisSpmLabel,
  onNext,
  onBack,
}: SpmReviewFormProps) => {

  const totalPotongan = potonganPajak.reduce((sum, p) => sum + (p.jumlah_pajak || 0), 0);
  const nilaiBersih = formData.nilai_spm - totalPotongan;

  const jenisSpmLabels: Record<string, string> = {
    up: "UP (Uang Persediaan)",
    gu: "GU (Ganti Uang)",
    tu: "TU (Tambah Uang)",
    ls_gaji: "LS Gaji",
    ls_barang_jasa: "LS Barang & Jasa",
    ls_belanja_modal: "LS Belanja Modal",
  };

  const allFiles = [
    ...files.dokumen_spm.map((f) => ({ file: f, jenis: "Dokumen SPM" })),
    ...files.tbk.map((f) => ({ file: f, jenis: "TBK" })),
    ...files.spj.map((f) => ({ file: f, jenis: "SPJ" })),
    ...files.lainnya.map((f) => ({ file: f, jenis: "Lainnya" })),
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Data Dasar SPM</h3>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-muted-foreground">OPD</dt>
            <dd className="font-medium">{opdName}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Jenis SPM</dt>
            <dd className="font-medium">{jenisSpmLabel}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Nilai SPM</dt>
            <dd className="font-medium text-lg">{formatCurrency(formData.nilai_spm)}</dd>
          </div>
          {formData.nama_penerima && (
            <div className="col-span-2">
              <dt className="text-sm text-muted-foreground">Penerima</dt>
              <dd className="font-medium">{formData.nama_penerima} ({formData.tipe_penerima})</dd>
            </div>
          )}
          <div className="col-span-2">
            <dt className="text-sm text-muted-foreground">Uraian</dt>
            <dd className="font-medium">{formData.uraian}</dd>
          </div>
        </dl>
      </Card>

      {/* Potongan Pajak */}
      {potonganPajak && potonganPajak.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Potongan Pajak
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jenis Pajak</TableHead>
                <TableHead>Nilai SPM</TableHead>
                <TableHead className="text-right">Potongan Pajak</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {potonganPajak.map((pajak, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{pajak.nama_pajak || pajak.jenis_pajak}</TableCell>
                  <TableCell>{formatCurrency(pajak.dasar_pengenaan)}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(pajak.jumlah_pajak)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator className="my-4" />
          
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <div className="flex justify-between">
              <span>Nilai SPM (Bruto):</span>
              <span className="font-bold">{formatCurrency(formData.nilai_spm)}</span>
            </div>
            <div className="flex justify-between text-destructive">
              <span>Total Potongan:</span>
              <span className="font-bold">-{formatCurrency(totalPotongan)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Nilai Bersih (Netto):</span>
              <span className="font-bold text-primary">{formatCurrency(nilaiBersih)}</span>
            </div>
            <p className="text-xs text-muted-foreground italic mt-2">
              <span className="font-medium">Terbilang:</span> {terbilangRupiah(nilaiBersih)}
            </p>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Lampiran ({allFiles.length} file)</h3>
        <div className="space-y-2">
          {allFiles.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div>
                <p className="font-medium text-sm">{item.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.jenis} • {formatFileSize(item.file.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 border-primary">
        <div className="space-y-4">
          <h3 className="font-semibold">Review Selesai</h3>
          <p className="text-sm text-muted-foreground">
            Pastikan semua data sudah benar sebelum melanjutkan ke tahap input nomor SPM.
          </p>
        </div>
      </Card>

      <div className="flex justify-between gap-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Kembali
        </Button>
        <Button type="button" onClick={onNext}>
          Lanjut ke Input Nomor SPM
        </Button>
      </div>
    </div>
  );
};
