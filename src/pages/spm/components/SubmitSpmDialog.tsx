import { useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

interface SubmitSpmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  spmData: {
    nomor_spm: string;
    nilai_spm: number;
    uraian: string;
  };
  validationErrors: string[];
  isSubmitting: boolean;
}

export const SubmitSpmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  spmData,
  validationErrors,
  isSubmitting,
}: SubmitSpmDialogProps) => {
  const hasErrors = validationErrors.length > 0;

  const handleConfirm = async () => {
    if (hasErrors) return;
    await onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {hasErrors ? "SPM Belum Lengkap" : "Ajukan SPM?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {hasErrors ? (
              "SPM tidak dapat diajukan karena belum memenuhi persyaratan berikut:"
            ) : (
              <>
                SPM akan masuk ke proses verifikasi dan tidak dapat diedit lagi sampai
                disetujui atau perlu revisi.
                <div className="mt-4 space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Nomor SPM:</span> {spmData.nomor_spm || "Draft"}
                  </div>
                  <div>
                    <span className="font-medium">Uraian:</span> {spmData.uraian}
                  </div>
                </div>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {hasErrors && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 mt-2">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>
            {hasErrors ? "Tutup" : "Batal"}
          </AlertDialogCancel>
          {!hasErrors && (
            <AlertDialogAction onClick={handleConfirm} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengajukan...
                </>
              ) : (
                "Ya, Ajukan SPM"
              )}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
