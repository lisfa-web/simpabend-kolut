import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BendaharaPengeluaranFilters {
  is_active?: boolean;
  enabled?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const useBendaharaPengeluaranList = (filters?: BendaharaPengeluaranFilters) => {
  return useQuery({
    queryKey: ["bendahara-pengeluaran-list", filters],
    enabled: filters?.enabled !== false,
    queryFn: async () => {
      let query = supabase
        .from("bendahara_pengeluaran")
        .select("*", { count: "exact" })
        .order("nama_bendahara");

      if (filters?.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active);
      }

      if (filters?.search) {
        query = query.or(
          `nama_bendahara.ilike.%${filters.search}%,nip.ilike.%${filters.search}%`
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
