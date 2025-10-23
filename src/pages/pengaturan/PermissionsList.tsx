import { useState } from "react";
import { Loader2, Shield } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { usePermissions, usePermissionsMutation } from "@/hooks/usePermissions";
import { Database } from "@/integrations/supabase/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

type AppRole = Database["public"]["Enums"]["app_role"];
type Permission = Database["public"]["Tables"]["permissions"]["Row"];

const PermissionsList = () => {
  const [selectedRole, setSelectedRole] = useState<AppRole | "all">("all");
  const { data: permissions, isLoading } = usePermissions(
    selectedRole !== "all" ? { role: selectedRole } : undefined
  );
  const { updatePermissions } = usePermissionsMutation();
  const [changes, setChanges] = useState<Map<string, Partial<Permission>>>(new Map());

  const roles: AppRole[] = [
    "administrator",
    "kepala_bkad",
    "kuasa_bud",
    "perbendaharaan",
    "akuntansi",
    "pbmd",
    "resepsionis",
    "bendahara_opd",
    "publik",
  ];

  const getRoleLabel = (role: AppRole): string => {
    const labels: Record<AppRole, string> = {
      administrator: "Administrator",
      kepala_bkad: "Kepala BKAD",
      kuasa_bud: "Kuasa BUD",
      perbendaharaan: "Perbendaharaan",
      akuntansi: "Akuntansi",
      pbmd: "PBMD",
      resepsionis: "Resepsionis",
      bendahara_opd: "Bendahara OPD",
      publik: "Publik",
    };
    return labels[role];
  };

  const handlePermissionChange = (
    permissionId: string,
    field: keyof Pick<Permission, "can_read" | "can_create" | "can_update" | "can_delete">,
    value: boolean
  ) => {
    setChanges((prev) => {
      const newChanges = new Map(prev);
      const existing = newChanges.get(permissionId) || {};
      newChanges.set(permissionId, { ...existing, [field]: value });
      return newChanges;
    });
  };

  const handleSave = () => {
    const updates = Array.from(changes.entries()).map(([id, change]) => ({
      id,
      ...change,
    }));
    updatePermissions.mutate(updates, {
      onSuccess: () => setChanges(new Map()),
    });
  };

  const getPermissionValue = (permission: Permission, field: keyof Permission): boolean => {
    const change = changes.get(permission.id);
    if (change && field in change) {
      return change[field] as boolean;
    }
    return permission[field] as boolean;
  };

  const filteredPermissions = permissions;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hak Akses</h1>
          <p className="text-muted-foreground mt-2">
            Kelola permissions per role untuk setiap resource
          </p>
        </div>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Administrator memiliki akses penuh ke semua resource dan tidak dapat diubah.
            Perubahan permissions akan mempengaruhi akses user dengan role terkait.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Matrix Permissions</CardTitle>
                <CardDescription>
                  Atur hak akses Read, Create, Update, Delete per resource
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label>Filter Role:</Label>
                  <Select
                    value={selectedRole}
                    onValueChange={(value) => setSelectedRole(value as AppRole | "all")}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Role</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {getRoleLabel(role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {changes.size > 0 && (
                  <Button onClick={handleSave} disabled={updatePermissions.isPending}>
                    {updatePermissions.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Simpan Perubahan ({changes.size})
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredPermissions && filteredPermissions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold">Role</th>
                      <th className="text-left p-4 font-semibold">Resource</th>
                      <th className="text-center p-4 font-semibold">Read</th>
                      <th className="text-center p-4 font-semibold">Create</th>
                      <th className="text-center p-4 font-semibold">Update</th>
                      <th className="text-center p-4 font-semibold">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPermissions.map((permission) => {
                      const isAdmin = permission.role === "administrator";
                      return (
                        <tr key={permission.id} className="border-b hover:bg-muted/50">
                          <td className="p-4 font-medium">
                            {getRoleLabel(permission.role)}
                          </td>
                          <td className="p-4 capitalize">{permission.resource}</td>
                          <td className="p-4 text-center">
                            <Checkbox
                              checked={getPermissionValue(permission, "can_read")}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(
                                  permission.id,
                                  "can_read",
                                  checked as boolean
                                )
                              }
                              disabled={isAdmin}
                            />
                          </td>
                          <td className="p-4 text-center">
                            <Checkbox
                              checked={getPermissionValue(permission, "can_create")}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(
                                  permission.id,
                                  "can_create",
                                  checked as boolean
                                )
                              }
                              disabled={isAdmin}
                            />
                          </td>
                          <td className="p-4 text-center">
                            <Checkbox
                              checked={getPermissionValue(permission, "can_update")}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(
                                  permission.id,
                                  "can_update",
                                  checked as boolean
                                )
                              }
                              disabled={isAdmin}
                            />
                          </td>
                          <td className="p-4 text-center">
                            <Checkbox
                              checked={getPermissionValue(permission, "can_delete")}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(
                                  permission.id,
                                  "can_delete",
                                  checked as boolean
                                )
                              }
                              disabled={isAdmin}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada permissions
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PermissionsList;
