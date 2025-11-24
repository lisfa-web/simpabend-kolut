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
import { X, Plus, Edit2 } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { getRoleDisplayName } from "@/lib/auth";
import { useOpdList } from "@/hooks/useOpdList";
import { Label } from "@/components/ui/label";

type AppRole = Database["public"]["Enums"]["app_role"] | 'super_admin' | 'demo_admin';

interface UserRole {
  role: AppRole;
  opd_id?: string | null;
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
  const [selectedOpdId, setSelectedOpdId] = useState<string>("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const { data: opdList } = useOpdList({ is_active: true });

  const availableRoles = isSuperAdmin 
    ? [...AVAILABLE_ROLES, "super_admin" as AppRole, "demo_admin" as AppRole]
    : AVAILABLE_ROLES;

  const handleAddRole = () => {
    if (!selectedRole) return;

    // Cek apakah role bendahara_opd dan OPD belum dipilih
    if (selectedRole === "bendahara_opd" && !selectedOpdId) {
      return;
    }

    // Cek duplikasi role (untuk bendahara_opd, cek juga OPD-nya)
    const roleExists = value.some((r) => {
      if (selectedRole === "bendahara_opd") {
        return r.role === selectedRole && r.opd_id === selectedOpdId;
      }
      return r.role === selectedRole;
    });
    
    if (roleExists) {
      return;
    }

    const newRole: UserRole = {
      role: selectedRole,
      opd_id: selectedRole === "bendahara_opd" ? (selectedOpdId || null) : null,
    };

    const updatedRoles = [...value, newRole];
    onChange(updatedRoles);
    setSelectedRole("");
    setSelectedOpdId("");
  };

  const handleRemoveRole = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const getOpdName = (opdId?: string | null) => {
    if (!opdId) return null;
    const opd = opdList?.find(o => o.id === opdId);
    return opd ? opd.nama_opd : null;
  };

  const handleUpdateOpdId = (index: number, opdId: string) => {
    const updatedRoles = [...value];
    updatedRoles[index] = { 
      ...updatedRoles[index], 
      opd_id: opdId || null  // Ensure null instead of empty string
    };
    onChange(updatedRoles);
    setEditingIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
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
            disabled={!selectedRole || (selectedRole === "bendahara_opd" && !selectedOpdId)}
            size="icon"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {selectedRole === "bendahara_opd" && (
          <Select value={selectedOpdId} onValueChange={setSelectedOpdId}>
            <SelectTrigger>
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
      </div>

      <div className="space-y-3">
        {value.map((userRole, index) => {
          const opdName = getOpdName(userRole.opd_id);
          const isBendahara = userRole.role === "bendahara_opd";
          const isEditing = editingIndex === index;
          
          return (
            <div key={`${userRole.role}-${index}`} className="flex items-start gap-2">
              <Badge variant="secondary" className="gap-2 flex-shrink-0">
                <span>
                  {getRoleDisplayName(userRole.role)}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveRole(index)}
                  className="hover:text-destructive"
                  title="Hapus role"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
              
              {isBendahara && (
                <div className="flex-1 space-y-1">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Select 
                        value={userRole.opd_id || ""} 
                        onValueChange={(opdId) => handleUpdateOpdId(index, opdId)}
                      >
                        <SelectTrigger className="h-8">
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingIndex(null)}
                      >
                        Selesai
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        OPD: {opdName || <span className="text-destructive">Belum dipilih</span>}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingIndex(index)}
                        title="Edit OPD"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  {!userRole.opd_id && !isEditing && (
                    <p className="text-xs text-destructive">
                      Klik tombol edit untuk memilih OPD
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};