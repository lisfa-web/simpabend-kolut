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

      return result.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User berhasil dibuat");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal membuat user");
    },
  });

  const updateUser = useMutation({
    mutationFn: async (data: UpdateUserData) => {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          phone: data.phone,
          is_active: data.is_active,
        })
        .eq("id", data.id);

      if (profileError) throw profileError;

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
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User berhasil diupdate");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal mengupdate user");
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

      return userId;
    },
    onSuccess: () => {
      toast.success("Password berhasil direset");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal reset password");
    },
  });

  const toggleUserStatus = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: isActive })
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Status user berhasil diubah");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal mengubah status user");
    },
  });

  const updateEmail = useMutation({
    mutationFn: async ({ userId, newEmail }: { userId: string; newEmail: string }) => {
      // Call edge function to update email with service role
      const { data: result, error } = await supabase.functions.invoke("update-user-email", {
        body: { userId, newEmail },
      });

      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      if (!result?.success) throw new Error("Email update failed");

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Email berhasil diubah. User harus login dengan email baru.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal mengubah email");
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
