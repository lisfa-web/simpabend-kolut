import { Badge } from "@/components/ui/badge";
import { Database } from "@/integrations/supabase/types";

type StatusSp2d = Database["public"]["Enums"]["status_sp2d"];

interface Sp2dStatusBadgeProps {
  status: StatusSp2d;
}

export const Sp2dStatusBadge = ({ status }: Sp2dStatusBadgeProps) => {
  const statusConfig: Record<StatusSp2d, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: "Pending", variant: "outline" },
    diproses: { label: "Diproses", variant: "secondary" },
    diterbitkan: { label: "Diterbitkan", variant: "default" },
    diuji_bank: { label: "Uji Bank", variant: "secondary" },
    cair: { label: "Dicairkan", variant: "default" },
    gagal: { label: "Gagal", variant: "destructive" },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
};
