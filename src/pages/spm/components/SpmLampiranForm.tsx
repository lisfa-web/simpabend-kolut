import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUploadCard } from "./FileUploadCard";
import { useConfigSistem } from "@/hooks/useConfigSistem";

interface SpmLampiranFormProps {
  jenisSpm?: string;
  files: {
    dokumen_spm: File[];
    tbk: File[];
    spj: File[];
    lainnya: File[];
  };
  onFilesChange: (files: {
    dokumen_spm: File[];
    tbk: File[];
    spj: File[];
    lainnya: File[];
  }) => void;
  onNext: () => void;
  onBack: () => void;
}

export const SpmLampiranForm = ({
  jenisSpm,
  files,
  onFilesChange,
  onNext,
  onBack,
}: SpmLampiranFormProps) => {
  const isLsType = jenisSpm?.startsWith("ls_");
  const { data: configs } = useConfigSistem();

  // Get max file sizes from config
  const getMaxSize = (key: string, defaultValue: number) => {
    const config = configs?.find((c) => c.key === key);
    return config ? parseFloat(config.value) : defaultValue;
  };

  const maxSizeDokumen = getMaxSize('max_file_size_dokumen_spm', 5);
  const maxSizeTbk = getMaxSize('max_file_size_tbk', 5);
  const maxSizeSpj = getMaxSize('max_file_size_spj', 5);
  const maxSizeLainnya = getMaxSize('max_file_size_lainnya', 10);

  const handleNext = () => {
    // Validasi: dokumen_spm wajib
    if (files.dokumen_spm.length === 0) {
      alert("Dokumen SPM wajib diupload");
      return;
    }

    // Validasi: TBK wajib untuk LS
    if (isLsType && files.tbk.length === 0) {
      alert("TBK/Kuitansi wajib diupload untuk SPM LS");
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      <FileUploadCard
        jenisLampiran="dokumen_spm"
        label="Dokumen SPM"
        required
        files={files.dokumen_spm}
        onFilesChange={(newFiles) =>
          onFilesChange({ ...files, dokumen_spm: newFiles })
        }
        maxSizeMB={maxSizeDokumen}
      />

      {isLsType && (
        <FileUploadCard
          jenisLampiran="tbk"
          label="Tanda Bukti Kuitansi (TBK)"
          required
          files={files.tbk}
          onFilesChange={(newFiles) =>
            onFilesChange({ ...files, tbk: newFiles })
          }
          maxSizeMB={maxSizeTbk}
        />
      )}

      <FileUploadCard
        jenisLampiran="spj"
        label="Lampiran SPJ (Opsional)"
        files={files.spj}
        onFilesChange={(newFiles) =>
          onFilesChange({ ...files, spj: newFiles })
        }
        maxSizeMB={maxSizeSpj}
      />

      <FileUploadCard
        jenisLampiran="lainnya"
        label="Lampiran Lainnya (Opsional)"
        files={files.lainnya}
        onFilesChange={(newFiles) =>
          onFilesChange({ ...files, lainnya: newFiles })
        }
        maxSizeMB={maxSizeLainnya}
      />

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Kembali
        </Button>
        <Button type="button" onClick={handleNext}>
          Selanjutnya
        </Button>
      </div>
    </div>
  );
};
