import { Badge } from "@/components/ui/badge";

interface UserStatusBadgeProps {
  isActive: boolean;
}

export const UserStatusBadge = ({ isActive }: UserStatusBadgeProps) => {
  return (
    <Badge variant={isActive ? "default" : "secondary"}>
      {isActive ? "Aktif" : "Nonaktif"}
    </Badge>
  );
};
