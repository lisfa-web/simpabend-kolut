import { Badge } from "@/components/ui/badge";
import { Database } from "@/integrations/supabase/types";

type StatusSpm = Database["public"]["Enums"]["status_spm"];

interface SpmStatusBadgeProps {
  status: StatusSpm;
  className?: string;
}

const statusConfig: Record<StatusSpm, { label: string; variant: string }> = {
  draft: { label: "Draft", variant: "secondary" },
  diajukan: { label: "Diajukan", variant: "default" },
  resepsionis_verifikasi: { label: "Di Resepsionis", variant: "default" },
  pbmd_verifikasi: { label: "Verifikasi PBMD", variant: "default" },
  akuntansi_validasi: { label: "Validasi Akuntansi", variant: "default" },
  perbendaharaan_verifikasi: { label: "Verifikasi Perbendaharaan", variant: "default" },
  kepala_bkad_review: { label: "Review Kepala BKAD", variant: "default" },
  disetujui: { label: "Disetujui", variant: "default" },
  perlu_revisi: { label: "Perlu Revisi", variant: "destructive" },
};

export const SpmStatusBadge = ({ status, className }: SpmStatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant as any} className={className}>
      {config.label}
    </Badge>
  );
};
