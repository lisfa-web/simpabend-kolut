import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BendaharaPengeluaranFilters {
  is_active?: boolean;
  enabled?: boolean;
}

export const useBendaharaPengeluaranList = (filters?: BendaharaPengeluaranFilters) => {
  return useQuery({
    queryKey: ["bendahara-pengeluaran-list", filters],
    enabled: filters?.enabled !== false,
    queryFn: async () => {
      let query = supabase
        .from("bendahara_pengeluaran")
        .select("*")
        .order("nama_bendahara");

      if (filters?.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
};
