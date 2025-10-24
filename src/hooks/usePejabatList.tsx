import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PejabatFilters {
  opd_id?: string;
  is_active?: boolean;
  search?: string;
}

export const usePejabatList = (filters?: PejabatFilters) => {
  return useQuery({
    queryKey: ["pejabat", filters],
    queryFn: async () => {
      console.log("Fetching pejabat with filters:", filters);
      
      let query = supabase
        .from("pejabat")
        .select(`
          *,
          opd:opd_id (
            id,
            nama_opd,
            kode_opd
          )
        `)
        .order("nama_lengkap", { ascending: true });

      if (filters?.opd_id) {
        query = query.eq("opd_id", filters.opd_id);
      }

      if (filters?.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active);
      }

      if (filters?.search) {
        query = query.or(
          `nama_lengkap.ilike.%${filters.search}%,nip.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching pejabat:", error);
        throw error;
      }
      
      console.log("Pejabat data fetched:", data);
      return data;
    },
  });
};
