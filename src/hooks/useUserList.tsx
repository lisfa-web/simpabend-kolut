import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UseUserListParams {
  search?: string;
  role?: string;
  is_active?: boolean;
}

export const useUserList = (params: UseUserListParams = {}) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (params.search) {
        query = query.or(
          `full_name.ilike.%${params.search}%,email.ilike.%${params.search}%`
        );
      }

      if (params.is_active !== undefined) {
        query = query.eq("is_active", params.is_active);
      }

      const { data: profiles, error } = await query;

      if (error) throw error;

      // Fetch user roles for all profiles
      const profileIds = profiles?.map((p) => p.id) || [];
      
      if (profileIds.length === 0) return [];

      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role, opd_id, opd:opd_id(id, nama_opd, kode_opd)")
        .in("user_id", profileIds);

      if (rolesError) throw rolesError;

      // Combine profiles with their roles
      const usersWithRoles = profiles?.map((profile) => ({
        ...profile,
        user_roles: userRoles?.filter((ur) => ur.user_id === profile.id) || [],
      }));

      // Filter by role if specified
      if (params.role) {
        return usersWithRoles?.filter((user: any) =>
          user.user_roles?.some((ur: any) => ur.role === params.role)
        );
      }

      return usersWithRoles;
    },
  });
};
