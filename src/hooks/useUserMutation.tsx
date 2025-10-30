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
      // Don't fail the main operation if audit logging fails
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
      'Missing authorization header': 'Sesi Anda telah berakhir. Silakan login kembali.',
    };

    for (const [key, value] of Object.entries(errorMap)) {
      if (errorMessage.includes(key)) {
        return value;
      }
    }

    return errorMessage || 'Terjadi kesalahan. Silakan coba lagi atau hubungi administrator.';
  };

  const createUser = useMutation({
    mutationFn: async (data: CreateUserData) => {
      // Call edge function to create user with service role
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

      // Log audit trail: User creation
      await logAudit('create', result.user.id, null, {
        email: data.email,
        full_name: data.full_name,
        roles: data.roles,
      });

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
      // Get old data for audit trail before update
      const { data: oldProfile } = await supabase
        .from("profiles")
        .select("full_name, phone, is_active")
        .eq("id", data.id)
        .single();

      const { data: oldRoles } = await supabase
        .from("user_roles")
        .select("role, opd_id")
        .eq("user_id", data.id);

      // Update profile
      console.log("[UserUpdate] Starting update", data);
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          phone: data.phone,
          is_active: data.is_active,
        })
        .eq("id", data.id);

      if (profileError) {
        console.error("[UserUpdate] Profile update error", profileError);
        throw profileError;
      }
      console.log("[UserUpdate] Profile updated");

      // Delete existing roles
      const { error: deleteRolesError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", data.id);

      if (deleteRolesError) throw deleteRolesError;

      // Insert new roles
      if (data.roles.length > 0) {
        const rolesData = data.roles.map((r) => ({
          user_id: data.id,
          role: r.role,
          opd_id: r.opd_id || null,
        }));

        const { error: rolesError } = await supabase
          .from("user_roles")
          .insert(rolesData);

        if (rolesError) throw rolesError;

        // Log audit trail: User profile and roles update
        await logAudit('update', data.id, {
          profile: oldProfile,
          roles: oldRoles,
        }, {
          profile: { full_name: data.full_name, phone: data.phone, is_active: data.is_active },
          roles: rolesData,
        });
      }

      return data;
    },
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
      }
      toast.success("User berhasil diupdate");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  const resetPassword = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      // Call edge function to reset password with service role
      const { data: result, error } = await supabase.functions.invoke("reset-user-password", {
        body: { userId, newPassword },
      });

      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      if (!result?.success) throw new Error("Password reset failed");

      // Log audit trail: Password reset
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
      // Get old status for audit trail
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

      // Log audit trail: Status toggle (activate/deactivate user)
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
      // Get old email for audit trail
      const { data: oldProfile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .single();

      // Call edge function to update email with service role
      const { data: result, error } = await supabase.functions.invoke("update-user-email", {
        body: { userId, newEmail },
      });

      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      if (!result?.success) throw new Error("Email update failed");

      // Log audit trail: Email update (critical security event)
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

  return {
    createUser,
    updateUser,
    resetPassword,
    toggleUserStatus,
    updateEmail,
  };
};
