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
import { useOpdList } from "@/hooks/useOpdList";

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

const ROLES_REQUIRING_OPD: AppRole[] = ["bendahara_opd"];

export const UserRoleSelect = ({ value, onChange }: UserRoleSelectProps) => {
  const [selectedRole, setSelectedRole] = useState<AppRole | "">("");
  const [selectedOpd, setSelectedOpd] = useState<string>("");
  const { data: opdList } = useOpdList();

  const handleAddRole = () => {
    if (!selectedRole) return;

    const roleExists = value.some((r) => r.role === selectedRole);
    if (roleExists) {
      return;
    }

    const newRole: UserRole = {
      role: selectedRole,
      ...(ROLES_REQUIRING_OPD.includes(selectedRole) && selectedOpd
        ? { opd_id: selectedOpd }
        : {}),
    };

    onChange([...value, newRole]);
    setSelectedRole("");
    setSelectedOpd("");
  };

  const handleRemoveRole = (roleToRemove: AppRole) => {
    onChange(value.filter((r) => r.role !== roleToRemove));
  };

  const getOpdName = (opdId?: string) => {
    if (!opdId) return null;
    const opd = opdList?.find((o) => o.id === opdId);
    return opd?.nama_opd;
  };

  const requiresOpd = selectedRole && ROLES_REQUIRING_OPD.includes(selectedRole);

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

        {requiresOpd && (
          <Select value={selectedOpd} onValueChange={setSelectedOpd}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Pilih OPD" />
            </SelectTrigger>
            <SelectContent>
              {opdList?.map((opd) => (
                <SelectItem key={opd.id} value={opd.id}>
                  {opd.nama_opd}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button
          type="button"
          onClick={handleAddRole}
          disabled={!selectedRole || (requiresOpd && !selectedOpd)}
          size="icon"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {value.map((userRole) => {
          const opdName = getOpdName(userRole.opd_id);
          return (
            <Badge key={userRole.role} variant="secondary" className="gap-2">
              <span>
                {getRoleDisplayName(userRole.role)}
                {opdName && ` - ${opdName}`}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveRole(userRole.role)}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}
      </div>
    </div>
  );
};
