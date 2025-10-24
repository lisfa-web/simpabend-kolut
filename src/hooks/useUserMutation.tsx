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
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin
        .createUser({
          email: data.email,
          password: data.password,
          email_confirm: true,
          user_metadata: {
            full_name: data.full_name,
          },
        });

      if (authError) throw authError;
      if (!authData.user) throw new Error("User creation failed");

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          phone: data.phone,
        })
        .eq("id", authData.user.id);

      if (profileError) throw profileError;

      // Insert roles
      if (data.roles.length > 0) {
        const rolesData = data.roles.map((r) => ({
          user_id: authData.user.id,
          role: r.role,
          opd_id: r.opd_id || null,
        }));

        const { error: rolesError } = await supabase
          .from("user_roles")
          .insert(rolesData);

        if (rolesError) throw rolesError;
      }

      return authData.user;
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
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

      if (error) throw error;

      // Send WhatsApp notification
      try {
        await supabase.functions.invoke("send-password-reset-notification", {
          body: { userId },
        });
      } catch (notifError) {
        console.error("Error sending notification:", notifError);
        // Don't fail the whole operation if notification fails
      }

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

  return {
    createUser,
    updateUser,
    resetPassword,
    toggleUserStatus,
  };
};
