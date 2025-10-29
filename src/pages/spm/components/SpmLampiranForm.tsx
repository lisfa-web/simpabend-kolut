import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUploadCard } from "./FileUploadCard";
import { useConfigSistem, getFileSizeInMB } from "@/hooks/useConfigSistem";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useSpmMutation } from "@/hooks/useSpmMutation";
import { toast } from "@/hooks/use-toast";
import { getFileValidationRule, validateFile } from "@/lib/fileValidation";

interface ExistingLampiran {
  id: string;
  jenis_lampiran: string;
  nama_file: string;
  file_url: string; // storage path
  file_size?: number;
}

interface SpmLampiranFormProps {
  jenisSpm?: string;
  spmId?: string;
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

// Normalisasi tipe lampiran agar kompatibel dengan berbagai nilai di database
const normalizeJenisLampiran = (jenis: string) => {
  const j = (jenis || '').toLowerCase().trim().replace(/\s+/g, "_");
  if (j === "spm" || j === "dokumen" || j === "dokumen_spm") return "dokumen_spm";
  if (j === "tbk" || j === "kuitansi" || j === "tbk_kuitansi") return "tbk";
  if (j === "spj") return "spj";
  if (j === "lainnya" || j === "lain_lain" || j === "other") return "lainnya";
  return j; // fallback: pakai apa adanya
};

export const SpmLampiranForm = ({
  jenisSpm,
  spmId,
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

  const { uploadFile, deleteFile } = useSpmMutation();
  const [existing, setExisting] = useState<ExistingLampiran[]>(existingLampiran || []);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    setExisting(existingLampiran || []);
  }, [existingLampiran]);

  const openSignedUrl = async (path: string) => {
    const { data, error } = await supabase.storage
      .from("spm-documents")
      .createSignedUrl(path, 60);
    if (!error && data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  };

  const handleDelete = async (l: ExistingLampiran) => {
    setBusyId(l.id);
    try {
      await deleteFile(l.id, l.file_url);
      setExisting((prev) => prev.filter((x) => x.id !== l.id));
      toast({ title: "Lampiran dihapus" });
    } catch (e: any) {
      toast({ title: "Gagal menghapus lampiran", description: e.message, variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const handleReplace = async (l: ExistingLampiran, file?: File) => {
    if (!file) return;
    if (!spmId) {
      toast({ title: "Tidak ada ID SPM", description: "Tidak bisa mengganti lampiran tanpa ID SPM", variant: "destructive" });
      return;
    }
    const rule = getFileValidationRule(normalizeJenisLampiran(l.jenis_lampiran), maxSizeInMB);
    const validation = validateFile(file, rule);
    if (!validation.valid) {
      toast({ title: "File tidak valid", description: validation.error, variant: "destructive" });
      return;
    }

    setBusyId(l.id);
    try {
      // Delete old file from storage AND database FIRST
      await deleteFile(l.id, l.file_url);
      
      // Then upload new file (creates new database record)
      const newLamp: any = await uploadFile(file, spmId, l.jenis_lampiran);
      
      // Update state: remove old and add new
      setExisting((prev) => {
        const filtered = prev.filter((x) => x.id !== l.id);
        return [...filtered, newLamp];
      });
      
      toast({ title: "Lampiran diganti" });
    } catch (e: any) {
      toast({ title: "Gagal mengganti lampiran", description: e.message, variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const handleNext = () => {
    const hasExisting = (jenis: string) => existing.some((l) => normalizeJenisLampiran(l.jenis_lampiran) === jenis);

    // Validasi lampiran wajib dengan toast yang lebih baik
    if (files.dokumen_spm.length === 0 && !hasExisting("dokumen_spm")) {
      toast({
        title: "Lampiran Tidak Lengkap",
        description: "Dokumen SPM wajib dilampirkan sebelum melanjutkan",
        variant: "destructive",
      });
      return;
    }

    if (isLsType && files.tbk.length === 0 && !hasExisting("tbk")) {
      toast({
        title: "Lampiran Tidak Lengkap", 
        description: "TBK/Kwitansi wajib dilampirkan untuk jenis SPM LS",
        variant: "destructive",
      });
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Lampiran yang sudah diunggah */}
      {existing && existing.length > 0 && (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="text-sm font-medium">Lampiran tersimpan</div>
            {(["dokumen_spm", "tbk", "spj", "lainnya"] as const).map((jenis) => {
              const list = existing.filter((l) => normalizeJenisLampiran(l.jenis_lampiran) === jenis);
              if (list.length === 0) return null;
              return (
                <div key={jenis} className="space-y-2">
                  <div className="text-xs text-muted-foreground uppercase">{jenis.replace(/_/g, " ")}</div>
                  <div className="space-y-2">
                    {list.map((l) => {
                      const normalized = normalizeJenisLampiran(l.jenis_lampiran);
                      const accept = getFileValidationRule(normalized, maxSizeInMB).allowedTypes.join(",");
                      return (
                        <div key={l.id} className="flex items-center justify-between rounded-md border bg-muted/50 p-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{l.nama_file}</p>
                            {typeof l.file_size === "number" && (
                              <p className="text-xs text-muted-foreground">{(l.file_size / 1024 / 1024).toFixed(1)} MB</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              id={`replace-${l.id}`}
                              type="file"
                              className="hidden"
                              accept={accept}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                e.currentTarget.value = "";
                                handleReplace(l, file);
                              }}
                            />
                            <Button type="button" size="sm" variant="outline" onClick={() => openSignedUrl(l.file_url)}>
                              Lihat/Unduh
                            </Button>
                            <Button type="button" size="sm" variant="secondary" disabled={busyId === l.id} onClick={() => document.getElementById(`replace-${l.id}`)?.click()}>
                              Ganti
                            </Button>
                            <Button type="button" size="sm" variant="destructive" disabled={busyId === l.id} onClick={() => handleDelete(l)}>
                              Hapus
                            </Button>
                          </div>
                        </div>
                      );
                    })}
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
