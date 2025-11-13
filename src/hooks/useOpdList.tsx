import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface OpdFilters {
  is_active?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const useOpdList = (filters?: OpdFilters) => {
  return useQuery({
    queryKey: ["opd-list", filters],
    queryFn: async () => {
      let query = supabase
        .from("opd")
        .select("*", { count: "exact" })
        .order("nama_opd");

      if (filters?.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active);
      }

      if (filters?.search) {
        query = query.or(
          `nama_opd.ilike.%${filters.search}%,kode_opd.ilike.%${filters.search}%`
        );
      }

      // Apply pagination
      if (filters?.page && filters?.pageSize) {
        const from = (filters.page - 1) * filters.pageSize;
        const to = from + filters.pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      return { data: data || [], count: count || 0 };
    },
  });
};
