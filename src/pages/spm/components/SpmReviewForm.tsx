import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/currency";
import { formatFileSize } from "@/lib/fileValidation";
import { SpmDataFormValues } from "@/schemas/spmSchema";
import { Loader2 } from "lucide-react";

interface SpmReviewFormProps {
  formData: SpmDataFormValues;
  files: {
    dokumen_spm: File[];
    tbk: File[];
    spj: File[];
    lainnya: File[];
  };
  opdName?: string;
  programName?: string;
  kegiatanName?: string;
  subkegiatanName?: string;
  vendorName?: string;
  onSubmit: (isDraft: boolean) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export const SpmReviewForm = ({
  formData,
  files,
  opdName,
  programName,
  kegiatanName,
  subkegiatanName,
  vendorName,
  onSubmit,
  onBack,
  isSubmitting = false,
}: SpmReviewFormProps) => {
  const [verified, setVerified] = useState(false);

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
            <dt className="text-sm text-muted-foreground">Program</dt>
            <dd className="font-medium">{programName}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Kegiatan</dt>
            <dd className="font-medium">{kegiatanName}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Sub Kegiatan</dt>
            <dd className="font-medium">{subkegiatanName}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Jenis SPM</dt>
            <dd className="font-medium">{jenisSpmLabels[formData.jenis_spm]}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Nilai SPM</dt>
            <dd className="font-medium text-lg">{formatCurrency(formData.nilai_spm)}</dd>
          </div>
          {vendorName && (
            <div className="col-span-2">
              <dt className="text-sm text-muted-foreground">Vendor</dt>
              <dd className="font-medium">{vendorName}</dd>
            </div>
          )}
          <div className="col-span-2">
            <dt className="text-sm text-muted-foreground">Uraian</dt>
            <dd className="font-medium">{formData.uraian}</dd>
          </div>
        </dl>
      </Card>

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
          <h3 className="font-semibold">Verifikasi Data</h3>
          <div className="flex items-start space-x-3">
            <Checkbox
              id="verify"
              checked={verified}
              onCheckedChange={(checked) => setVerified(checked as boolean)}
            />
            <label
              htmlFor="verify"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Saya menyatakan bahwa data yang saya input sudah benar dan lampiran yang
              diupload sudah lengkap. Saya bertanggung jawab atas kebenaran data ini.
            </label>
          </div>
        </div>
      </Card>

      <div className="flex justify-between gap-4">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          Kembali
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onSubmit(true)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan sebagai Draft"
            )}
          </Button>
          <Button
            type="button"
            onClick={() => onSubmit(false)}
            disabled={!verified || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              "Submit untuk Verifikasi"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
