import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { getRoleDisplayName } from "@/lib/auth";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserRole {
  role: AppRole;
  opd_id?: string;
}

interface UserRoleSelectProps {
  value: UserRole[];
  onChange: (roles: UserRole[]) => void;
}

const AVAILABLE_ROLES: AppRole[] = [
  "administrator",
  "bendahara_opd",
  "resepsionis",
  "pbmd",
  "akuntansi",
  "perbendaharaan",
  "kepala_bkad",
  "kuasa_bud",
];

export const UserRoleSelect = ({ value, onChange }: UserRoleSelectProps) => {
  const [selectedRole, setSelectedRole] = useState<AppRole | "">("");

  const handleAddRole = () => {
    if (!selectedRole) return;

    const roleExists = value.some((r) => r.role === selectedRole);
    if (roleExists) {
      return;
    }

    const newRole: UserRole = {
      role: selectedRole,
    };

    onChange([...value, newRole]);
    setSelectedRole("");
  };

  const handleRemoveRole = (roleToRemove: AppRole) => {
    onChange(value.filter((r) => r.role !== roleToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Pilih Role" />
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {getRoleDisplayName(role)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          onClick={handleAddRole}
          disabled={!selectedRole}
          size="icon"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {value.map((userRole) => (
          <Badge key={userRole.role} variant="secondary" className="gap-2">
            <span>{getRoleDisplayName(userRole.role)}</span>
            <button
              type="button"
              onClick={() => handleRemoveRole(userRole.role)}
              className="hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};
