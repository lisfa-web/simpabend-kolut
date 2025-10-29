import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Sp2dListFilters {
  search?: string;
  status?: string | string[];
  tanggal_dari?: string;
  tanggal_sampai?: string;
  opd_id?: string;
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
            )
          `)
          .order("created_at", { ascending: false });

        // Apply filters
        if (filters?.search) {
          query = query.ilike("nomor_sp2d", `%${filters.search}%`);
        }

        if (filters?.status) {
          if (Array.isArray(filters.status)) {
            query = query.in("status", filters.status as any);
          } else if (filters.status !== "" && filters.status !== "all") {
            query = query.eq("status", filters.status as any);
          }
        }

        if (filters?.opd_id) {
          query = query.eq("spm.opd_id", filters.opd_id);
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
