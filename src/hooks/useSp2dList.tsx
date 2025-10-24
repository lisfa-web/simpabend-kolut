import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Sp2dListFilters {
  search?: string;
  status?: string;
  tanggal_dari?: string;
  tanggal_sampai?: string;
}

export const useSp2dList = (filters?: Sp2dListFilters) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sp2d-list", user?.id, filters],
    queryFn: async () => {
      if (!user?.id) return [];

      try {
        let query = supabase
          .from("sp2d")
          .select(`
            *,
            spm:spm_id(
              nomor_spm,
              opd:opd_id(nama_opd),
              bendahara:profiles!spm_bendahara_id_fkey(full_name)
            ),
            kuasa_bud:profiles!sp2d_kuasa_bud_id_fkey(full_name)
          `)
          .order("created_at", { ascending: false });

        // Apply filters
        if (filters?.search) {
          query = query.or(`nomor_sp2d.ilike.%${filters.search}%,spm.nomor_spm.ilike.%${filters.search}%`);
        }

        if (filters?.status && filters.status !== "" && filters.status !== "all") {
          query = query.eq("status", filters.status as any);
        }

        if (filters?.tanggal_dari) {
          query = query.gte("tanggal_sp2d", filters.tanggal_dari);
        }

        if (filters?.tanggal_sampai) {
          query = query.lte("tanggal_sp2d", filters.tanggal_sampai);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching SP2D list:", error);
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error("Error in useSp2dList:", error);
        return [];
      }
    },
    enabled: !!user?.id,
  });
};
