import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface VendorFilters {
  is_active?: boolean;
  enabled?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const useVendorList = (filters?: VendorFilters) => {
  return useQuery({
    queryKey: ["vendor-list", filters],
    enabled: filters?.enabled !== false,
    queryFn: async () => {
      let query = supabase
        .from("vendor")
        .select("*", { count: "exact" })
        .order("nama_vendor");

      if (filters?.search) {
        query = query.or(
          `nama_vendor.ilike.%${filters.search}%,npwp.ilike.%${filters.search}%`
        );
      }

      if (filters?.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active);
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
