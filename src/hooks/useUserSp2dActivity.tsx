import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useUserRole } from "./useUserRole";

interface UseUserSp2dActivityOptions {
  search?: string;
  status?: string;
}

export const useUserSp2dActivity = (options: UseUserSp2dActivityOptions = {}) => {
  const { user } = useAuth();
  const { roles } = useUserRole();

  return useQuery({
    queryKey: ["userSp2dActivity", user?.id, options],
    queryFn: async () => {
      if (!user?.id) return null;

      // Build OR conditions based on user roles and involvement
      const conditions: string[] = [];
      
      conditions.push(`created_by.eq.${user.id}`);
      conditions.push(`verified_by.eq.${user.id}`);
      conditions.push(`kuasa_bud_id.eq.${user.id}`);

      let query = supabase
        .from("sp2d")
        .select("*, spm(nomor_spm, bendahara_id)", { count: "exact" })
        .or(conditions.join(","));

      // Apply filters
      if (options.status) {
        query = query.eq("status", options.status as any);
      }

      if (options.search) {
        query = query.or(`nomor_sp2d.ilike.%${options.search}%`);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      // Also include SP2D where user is bendahara of the SPM
      let additionalData: any[] = [];
      if (roles.some(r => r.role === "bendahara_opd")) {
        const { data: spmSp2dData } = await supabase
          .from("sp2d")
          .select("*, spm!inner(nomor_spm, bendahara_id)")
          .eq("spm.bendahara_id", user.id);
        
        if (spmSp2dData) {
          // Filter out duplicates
          const existingIds = new Set(data?.map(d => d.id));
          additionalData = spmSp2dData.filter(d => !existingIds.has(d.id));
        }
      }

      const allData = [...(data || []), ...additionalData];

      // Calculate by status
      const byStatus: Record<string, number> = {};
      allData.forEach((sp2d) => {
        byStatus[sp2d.status] = (byStatus[sp2d.status] || 0) + 1;
      });

      return {
        data: allData,
        totalCount: allData.length,
        byStatus,
      };
    },
    enabled: !!user?.id,
  });
};
