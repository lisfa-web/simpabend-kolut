import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PihakKetigaFilters {
  is_active?: boolean;
  enabled?: boolean;
}

export const usePihakKetigaList = (filters?: PihakKetigaFilters) => {
  return useQuery({
    queryKey: ["pihak-ketiga-list", filters],
    enabled: filters?.enabled !== false,
    queryFn: async () => {
      let query = supabase
        .from("pihak_ketiga")
        .select("*")
        .order("nama_pihak_ketiga");

      if (filters?.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
};
