import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  roles: { role: AppRole; opd_id?: string }[];
}

interface UpdateUserData {
  id: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
  roles: { role: AppRole; opd_id?: string }[];
}

interface RoleChangeAudit {
  added: { role: string; opd_id?: string | null }[];
  removed: { role: string; opd_id?: string | null }[];
  unchanged: { role: string; opd_id?: string | null }[];
}

export const useUserMutation = () => {
  const queryClient = useQueryClient();

  // Helper: Log audit trail for user management actions
  const logAudit = async (action: string, resourceId: string, oldData?: any, newData?: any) => {
    try {
      await supabase.from('audit_log').insert({
        action,
        resource: 'user',
        resource_id: resourceId,
        old_data: oldData || null,
        new_data: newData || null,
      });
    } catch (error) {
      console.error('Failed to log audit:', error);
    }
  };

  // Helper: Log specific role changes with detailed diff
  const logRoleChanges = async (
    userId: string, 
    oldRoles: { role: string; opd_id?: string | null }[], 
    newRoles: { role: string; opd_id?: string | null }[]
  ) => {
    try {
      // Calculate role changes
      const oldRoleKeys = new Set(oldRoles.map(r => `${r.role}:${r.opd_id || ''}`));
      const newRoleKeys = new Set(newRoles.map(r => `${r.role}:${r.opd_id || ''}`));
      
      const roleChanges: RoleChangeAudit = {
        added: newRoles.filter(r => !oldRoleKeys.has(`${r.role}:${r.opd_id || ''}`)),
        removed: oldRoles.filter(r => !newRoleKeys.has(`${r.role}:${r.opd_id || ''}`)),
        unchanged: newRoles.filter(r => oldRoleKeys.has(`${r.role}:${r.opd_id || ''}`)),
      };

      // Only log if there are actual changes
      if (roleChanges.added.length > 0 || roleChanges.removed.length > 0) {
        await supabase.from('audit_log').insert([{
          action: 'role_change',
          resource: 'user_roles',
          resource_id: userId,
          old_data: { roles: oldRoles } as any,
          new_data: { 
            roles: newRoles,
            changes: {
              added: roleChanges.added,
              removed: roleChanges.removed,
              unchanged: roleChanges.unchanged,
            },
          } as any,
        }]);
        console.log('[Audit] Role changes logged:', roleChanges);
      }
    } catch (error) {
      console.error('Failed to log role changes audit:', error);
    }
  };

  // Helper: Map error codes to user-friendly Indonesian messages
  const getErrorMessage = (error: any): string => {
    const errorMessage = error?.message || '';
    
    const errorMap: Record<string, string> = {
      'Email sudah terdaftar di sistem': 'Email ini sudah terdaftar di sistem',
      'Email sudah digunakan': 'Email ini sudah terdaftar di sistem',
      'User with this email already exists': 'Email ini sudah terdaftar di sistem',
      'Invalid email': 'Format email tidak valid',
      'Password too short': 'Password terlalu pendek, minimal 8 karakter',
      'Unauthorized': 'Anda tidak memiliki akses untuk melakukan operasi ini',
      'Demo admin tidak dapat': 'Akun demo tidak dapat melakukan perubahan data',
      'Failed to create user': 'Gagal membuat user. Pastikan semua data sudah benar.',
      'Failed to update user': 'Gagal mengubah data user. Silakan coba lagi.',
      'Failed to reset password': 'Gagal mereset password. Silakan coba lagi.',
      'Failed to delete user': 'Gagal menghapus user. Silakan coba lagi.',
      'Tidak dapat menghapus akun sendiri': 'Anda tidak dapat menghapus akun sendiri',
      'Hanya super admin yang dapat menghapus user super admin': 'Hanya super admin yang dapat menghapus user super admin',
      'Missing authorization header': 'Sesi Anda telah berakhir. Silakan login kembali.',
      'row-level security': 'Anda tidak memiliki izin untuk melakukan operasi ini. Hubungi administrator.',
      'violates row-level security policy': 'Gagal menyimpan role. Anda tidak memiliki izin yang cukup.',
    };

    for (const [key, value] of Object.entries(errorMap)) {
      if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    return errorMessage || 'Terjadi kesalahan. Silakan coba lagi atau hubungi administrator.';
  };

  const createUser = useMutation({
    mutationFn: async (data: CreateUserData) => {
      const { data: result, error } = await supabase.functions.invoke("create-user", {
        body: {
          email: data.email,
          password: data.password,
          full_name: data.full_name,
          phone: data.phone,
          roles: data.roles,
        },
      });

      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      if (!result?.success) throw new Error("User creation failed");

      // Log audit trail
      await logAudit('create', result.user.id, null, {
        email: data.email,
        full_name: data.full_name,
        roles: data.roles,
      });

      // Log role assignment for new user
      await logRoleChanges(result.user.id, [], data.roles.map(r => ({ 
        role: r.role, 
        opd_id: r.opd_id || null 
      })));

      return result.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User berhasil dibuat");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  const updateUser = useMutation({
    mutationFn: async (data: UpdateUserData) => {
      console.log("[UserUpdate] Starting update for user:", data.id);
      
      // Get old data for audit trail and potential rollback
      const { data: oldProfile, error: fetchProfileError } = await supabase
        .from("profiles")
        .select("full_name, phone, is_active")
        .eq("id", data.id)
        .single();

      if (fetchProfileError) {
        console.error("[UserUpdate] Failed to fetch old profile:", fetchProfileError);
        throw new Error("Gagal mengambil data user yang akan diupdate");
      }

      const { data: oldRoles, error: fetchRolesError } = await supabase
        .from("user_roles")
        .select("role, opd_id")
        .eq("user_id", data.id);

      if (fetchRolesError) {
        console.error("[UserUpdate] Failed to fetch old roles:", fetchRolesError);
        throw new Error("Gagal mengambil role user yang akan diupdate");
      }

      // Store backup for rollback
      const backupRoles = oldRoles?.map(r => ({ ...r })) || [];
      console.log("[UserUpdate] Backup roles:", backupRoles);

      // Step 1: Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          phone: data.phone,
          is_active: data.is_active,
        })
        .eq("id", data.id);

      if (profileError) {
        console.error("[UserUpdate] Profile update error:", profileError);
        throw new Error(`Gagal update profil: ${profileError.message}`);
      }
      console.log("[UserUpdate] Profile updated successfully");

      // Step 2: Delete existing roles
      const { error: deleteRolesError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", data.id);

      if (deleteRolesError) {
        console.error("[UserUpdate] Delete roles error:", deleteRolesError);
        // Rollback profile changes
        await supabase.from("profiles").update({
          full_name: oldProfile?.full_name,
          phone: oldProfile?.phone,
          is_active: oldProfile?.is_active,
        }).eq("id", data.id);
        throw new Error(`Gagal menghapus role lama: ${deleteRolesError.message}`);
      }
      console.log("[UserUpdate] Old roles deleted");

      // Step 3: Insert new roles with validation and rollback
      if (data.roles.length > 0) {
        const rolesData = data.roles.map((r) => ({
          user_id: data.id,
          role: r.role,
          opd_id: r.opd_id || null,
        }));

        console.log("[UserUpdate] Inserting new roles:", rolesData);

        const { error: rolesError } = await supabase
          .from("user_roles")
          .insert(rolesData);

        if (rolesError) {
          console.error("[UserUpdate] Insert roles error:", rolesError);
          
          // ROLLBACK: Restore old roles
          console.log("[UserUpdate] Rolling back - restoring old roles:", backupRoles);
          if (backupRoles.length > 0) {
            const rollbackRoles = backupRoles.map(r => ({
              user_id: data.id,
              role: r.role,
              opd_id: r.opd_id || null,
            }));
            
            const { error: rollbackError } = await supabase
              .from("user_roles")
              .insert(rollbackRoles);
            
            if (rollbackError) {
              console.error("[UserUpdate] Rollback failed:", rollbackError);
              // Log critical failure
              await logAudit('rollback_failed', data.id, { 
                attempted_roles: rolesData,
                backup_roles: backupRoles,
                error: rollbackError.message 
              }, null);
            } else {
              console.log("[UserUpdate] Rollback successful");
            }
          }

          // Rollback profile changes
          await supabase.from("profiles").update({
            full_name: oldProfile?.full_name,
            phone: oldProfile?.phone,
            is_active: oldProfile?.is_active,
          }).eq("id", data.id);

          throw new Error(`Gagal menyimpan role baru: ${getErrorMessage(rolesError)}`);
        }

        console.log("[UserUpdate] New roles inserted successfully");

        // Log detailed role changes
        await logRoleChanges(
          data.id, 
          backupRoles.map(r => ({ role: r.role as string, opd_id: r.opd_id })), 
          rolesData.map(r => ({ role: r.role as string, opd_id: r.opd_id }))
        );

        // Log general audit trail
        await logAudit('update', data.id, {
          profile: oldProfile,
          roles: backupRoles,
        }, {
          profile: { full_name: data.full_name, phone: data.phone, is_active: data.is_active },
          roles: rolesData,
        });
      } else {
        // No roles to insert, just log the profile update
        await logAudit('update', data.id, {
          profile: oldProfile,
          roles: backupRoles,
        }, {
          profile: { full_name: data.full_name, phone: data.phone, is_active: data.is_active },
          roles: [],
        });
      }

      return data;
    },
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
        queryClient.invalidateQueries({ queryKey: ["userRoles", variables.id] });
      }
      toast.success("User berhasil diupdate");
    },
    onError: (error: any) => {
      console.error("[UserUpdate] Final error:", error);
      toast.error(getErrorMessage(error));
    },
  });

  const resetPassword = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      const { data: result, error } = await supabase.functions.invoke("reset-user-password", {
        body: { userId, newPassword },
      });

      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      if (!result?.success) throw new Error("Password reset failed");

      await logAudit('update', userId, null, {
        action: 'password_reset',
        timestamp: new Date().toISOString(),
      });

      return userId;
    },
    onSuccess: () => {
      toast.success("Password berhasil direset");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  const toggleUserStatus = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { data: oldProfile } = await supabase
        .from("profiles")
        .select("is_active")
        .eq("id", userId)
        .single();

      const { error } = await supabase
        .from("profiles")
        .update({ is_active: isActive })
        .eq("id", userId);

      if (error) throw error;

      await logAudit('update', userId, {
        is_active: oldProfile?.is_active,
      }, {
        is_active: isActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Status user berhasil diubah");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  const updateEmail = useMutation({
    mutationFn: async ({ userId, newEmail }: { userId: string; newEmail: string }) => {
      const { data: oldProfile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .single();

      const { data: result, error } = await supabase.functions.invoke("update-user-email", {
        body: { userId, newEmail },
      });

      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      if (!result?.success) throw new Error("Email update failed");

      await logAudit('update', userId, {
        email: oldProfile?.email,
      }, {
        email: newEmail,
      });

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Email berhasil diubah. User harus login dengan email baru.");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", userId)
        .single();

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role, opd_id")
        .eq("user_id", userId);

      const { data: result, error } = await supabase.functions.invoke("delete-user", {
        body: { userId },
      });

      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      if (!result?.success) throw new Error("User deletion failed");

      await logAudit('delete', userId, {
        profile,
        roles,
      }, null);

      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User berhasil dihapus");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  return {
    createUser,
    updateUser,
    resetPassword,
    toggleUserStatus,
    updateEmail,
    deleteUser,
  };
};
