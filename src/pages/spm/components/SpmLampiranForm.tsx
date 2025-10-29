import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUploadCard } from "./FileUploadCard";
import { useConfigSistem, getFileSizeInMB } from "@/hooks/useConfigSistem";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface ExistingLampiran {
  id: string;
  jenis_lampiran: string;
  nama_file: string;
  file_url: string; // storage path
  file_size?: number;
}

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
  existingLampiran?: ExistingLampiran[];
}

export const SpmLampiranForm = ({
  jenisSpm,
  files,
  onFilesChange,
  onNext,
  onBack,
  existingLampiran,
}: SpmLampiranFormProps) => {
  const normalizedJenis = (jenisSpm || "").toLowerCase().replace(/\s+/g, "_");
  const isLsType = normalizedJenis.startsWith("ls_") || normalizedJenis === "ls";
  const { data: configs } = useConfigSistem();

  // Gunakan getFileSizeInMB untuk mendapatkan ukuran file dalam MB (auto-sync dari max_file_size)
  const maxSizeInMB = getFileSizeInMB(configs);

  const openSignedUrl = async (path: string) => {
    const { data, error } = await supabase.storage
      .from("spm-documents")
      .createSignedUrl(path, 60);
    if (!error && data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  };
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
      {/* Lampiran yang sudah diunggah */}
      {existingLampiran && existingLampiran.length > 0 && (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="text-sm font-medium">Lampiran tersimpan</div>
            {(["dokumen_spm", "tbk", "spj", "lainnya"] as const).map((jenis) => {
              const list = existingLampiran.filter((l) => l.jenis_lampiran === jenis);
              if (list.length === 0) return null;
              return (
                <div key={jenis} className="space-y-2">
                  <div className="text-xs text-muted-foreground uppercase">{jenis.replace(/_/g, " ")}</div>
                  <div className="space-y-2">
                    {list.map((l) => (
                      <div key={l.id} className="flex items-center justify-between rounded-md border bg-muted/50 p-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{l.nama_file}</p>
                          {typeof l.file_size === "number" && (
                            <p className="text-xs text-muted-foreground">{(l.file_size / 1024 / 1024).toFixed(1)} MB</p>
                          )}
                        </div>
                        <Button type="button" size="sm" variant="outline" onClick={() => openSignedUrl(l.file_url)}>
                          Lihat/Unduh
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <FileUploadCard
        jenisLampiran="dokumen_spm"
        label="Dokumen SPM"
        required
        files={files.dokumen_spm}
        onFilesChange={(newFiles) =>
          onFilesChange({ ...files, dokumen_spm: newFiles })
        }
        maxSizeMB={maxSizeInMB}
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
          maxSizeMB={maxSizeInMB}
        />
      )}

      <FileUploadCard
        jenisLampiran="spj"
        label="Lampiran SPJ (Opsional)"
        files={files.spj}
        onFilesChange={(newFiles) =>
          onFilesChange({ ...files, spj: newFiles })
        }
        maxSizeMB={maxSizeInMB}
      />

      <FileUploadCard
        jenisLampiran="lainnya"
        label="Lampiran Lainnya (Opsional)"
        files={files.lainnya}
        onFilesChange={(newFiles) =>
          onFilesChange({ ...files, lainnya: newFiles })
        }
        maxSizeMB={maxSizeInMB}
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
