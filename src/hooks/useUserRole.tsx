import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"] | 'super_admin';

export const useUserRole = () => {
  const { user } = useAuth();

  const { data: roles = [], ...rest } = useQuery({
    queryKey: ["userRoles", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("user_roles")
        .select("role, opd_id")
        .eq("user_id", user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const hasRole = (role: AppRole): boolean => {
    return roles.some((r) => r.role === role);
  };

  const isAdmin = (): boolean => {
    return hasRole("administrator") || hasRole("kepala_bkad");
  };

  const isSuperAdmin = (): boolean => {
    return hasRole("super_admin");
  };

  const isRegularAdmin = (): boolean => {
    return hasRole("administrator") && !hasRole("super_admin");
  };

  return {
    roles,
    hasRole,
    isAdmin,
    isSuperAdmin,
    isRegularAdmin,
    ...rest,
  };
};
