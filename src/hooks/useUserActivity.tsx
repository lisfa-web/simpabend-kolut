import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useUserRole } from "./useUserRole";

interface UseUserActivityOptions {
  search?: string;
  status?: string;
}

export const useUserActivity = (options: UseUserActivityOptions = {}) => {
  const { user } = useAuth();
  const { roles } = useUserRole();

  return useQuery({
    queryKey: ["userActivity", user?.id, options],
    queryFn: async () => {
      if (!user?.id) return null;

      // Build OR conditions based on user roles
      const conditions: string[] = [];
      
      roles.forEach((roleObj) => {
        const role = roleObj.role;
        if (role === "bendahara_opd") conditions.push(`bendahara_id.eq.${user.id}`);
        if (role === "resepsionis") conditions.push(`verified_by_resepsionis.eq.${user.id}`);
        if (role === "pbmd") conditions.push(`verified_by_pbmd.eq.${user.id}`);
        if (role === "akuntansi") conditions.push(`verified_by_akuntansi.eq.${user.id}`);
        if (role === "perbendaharaan") conditions.push(`verified_by_perbendaharaan.eq.${user.id}`);
        if (role === "kepala_bkad") conditions.push(`verified_by_kepala_bkad.eq.${user.id}`);
      });

      // If no conditions (shouldn't happen), return empty
      if (conditions.length === 0) {
        return { data: [], totalCount: 0, byStatus: {} };
      }

      let query = supabase
        .from("spm")
        .select("*, opd(nama_opd), program(nama_program), vendor(nama_vendor)", { count: "exact" })
        .or(conditions.join(","));

      // Apply filters
      if (options.status) {
        query = query.eq("status", options.status as any);
      }

      if (options.search) {
        query = query.or(`nomor_spm.ilike.%${options.search}%,uraian.ilike.%${options.search}%`);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      // Calculate by status
      const byStatus: Record<string, number> = {};
      data?.forEach((spm) => {
        byStatus[spm.status] = (byStatus[spm.status] || 0) + 1;
      });

      return {
        data: data || [],
        totalCount: count || 0,
        byStatus,
      };
    },
    enabled: !!user?.id,
  });
};
