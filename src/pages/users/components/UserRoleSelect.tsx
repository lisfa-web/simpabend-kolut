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

type AppRole = Database["public"]["Enums"]["app_role"] | 'super_admin' | 'demo_admin';

interface UserRole {
  role: AppRole;
  opd_id?: string;
}

interface UserRoleSelectProps {
  value: UserRole[];
  onChange: (roles: UserRole[]) => void;
  isSuperAdmin?: boolean;
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

export const UserRoleSelect = ({ value, onChange, isSuperAdmin = false }: UserRoleSelectProps) => {
  const [selectedRole, setSelectedRole] = useState<AppRole | "">("");

  // SECURITY: Add super_admin and demo_admin to available roles only for super admins
  // Regular admins should never see or be able to assign these privileged roles
  // EDGE CASE: This prevents privilege escalation where regular admin creates super admin
  const availableRoles = isSuperAdmin 
    ? [...AVAILABLE_ROLES, "super_admin" as AppRole, "demo_admin" as AppRole]
    : AVAILABLE_ROLES;

  const handleAddRole = () => {
    if (!selectedRole) return;

    // VALIDATION: Prevent duplicate roles - each user can only have a role once
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
    // DATA INTEGRITY: Allow removal even if it's the last role
    // Form validation at parent level will prevent submitting without roles
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
            {availableRoles.map((role) => (
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
              className="hover:text-destructive disabled:opacity-50"
              disabled={value.length <= 1}
              aria-disabled={value.length <= 1}
              title={value.length <= 1 ? "Minimal 1 role wajib ada" : "Hapus role"}
            >
              {/* UX: Visual feedback that button is disabled when only 1 role remains */}
              {/* VALIDATION: Form-level validation enforces minimum 1 role requirement */}
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};
