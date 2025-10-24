import { Check, Clock } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Database } from "@/integrations/supabase/types";

type StatusSpm = Database["public"]["Enums"]["status_spm"];

interface TimelineStep {
  status: StatusSpm;
  label: string;
  timestamp?: string | null;
  catatan?: string | null;
}

interface SpmTimelineProps {
  currentStatus: StatusSpm;
  spm: any;
}

export const SpmTimeline = ({ currentStatus, spm }: SpmTimelineProps) => {
  const steps: TimelineStep[] = [
    { status: "draft", label: "Draft", timestamp: spm.created_at },
    { status: "diajukan", label: "Diajukan", timestamp: spm.tanggal_ajuan },
    { status: "resepsionis_verifikasi", label: "Resepsionis", timestamp: spm.tanggal_resepsionis, catatan: spm.catatan_resepsionis },
    { status: "pbmd_verifikasi", label: "PBMD", timestamp: spm.tanggal_pbmd, catatan: spm.catatan_pbmd },
    { status: "akuntansi_validasi", label: "Akuntansi", timestamp: spm.tanggal_akuntansi, catatan: spm.catatan_akuntansi },
    { status: "perbendaharaan_verifikasi", label: "Perbendaharaan", timestamp: spm.tanggal_perbendaharaan, catatan: spm.catatan_perbendaharaan },
    { status: "kepala_bkad_review", label: "Kepala BKAD", timestamp: spm.tanggal_kepala_bkad, catatan: spm.catatan_kepala_bkad },
    { status: "disetujui", label: "Disetujui", timestamp: spm.tanggal_disetujui },
  ];

  const statusOrder: StatusSpm[] = [
    "draft",
    "diajukan",
    "resepsionis_verifikasi",
    "pbmd_verifikasi",
    "akuntansi_validasi",
    "perbendaharaan_verifikasi",
    "kepala_bkad_review",
    "disetujui",
  ];

  const currentIndex = statusOrder.indexOf(currentStatus);

  const getStepStatus = (index: number) => {
    if (currentStatus === "ditolak" || currentStatus === "perlu_revisi") {
      return index <= currentIndex ? "completed" : "pending";
    }
    if (index < currentIndex) return "completed";
    if (index === currentIndex) return "active";
    return "pending";
  };

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const stepStatus = getStepStatus(index);

        return (
          <div key={step.status} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  stepStatus === "completed"
                    ? "border-primary bg-primary text-primary-foreground"
                    : stepStatus === "active"
                    ? "border-primary bg-background text-primary"
                    : "border-muted bg-background text-muted-foreground"
                }`}
              >
                {stepStatus === "completed" ? (
                  <Check className="h-4 w-4" />
                ) : stepStatus === "active" ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-12 w-0.5 ${
                    stepStatus === "completed" ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
            <div className="flex-1 pb-8">
              <p
                className={`font-medium ${
                  stepStatus === "completed" || stepStatus === "active"
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </p>
              {step.timestamp && (
                <p className="text-sm text-muted-foreground">
                  {format(new Date(step.timestamp), "dd MMM yyyy HH:mm", { locale: id })}
                </p>
              )}
              {step.catatan && (
                <div className="mt-2 text-sm bg-destructive/10 text-destructive p-3 rounded-md border border-destructive/20">
                  <strong>Catatan:</strong> {step.catatan}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
