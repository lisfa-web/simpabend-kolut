import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface OpdFilters {
  is_active?: boolean;
  search?: string;
}

export const useOpdList = (filters?: OpdFilters) => {
  return useQuery({
    queryKey: ["opd-list", filters],
    queryFn: async () => {
      let query = supabase
        .from("opd")
        .select("*")
        .order("nama_opd");

      if (filters?.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active);
      }

      if (filters?.search) {
        query = query.or(
          `nama_opd.ilike.%${filters.search}%,kode_opd.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
  });
};
