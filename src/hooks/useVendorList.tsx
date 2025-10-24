import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface VendorFilters {
  is_active?: boolean;
}

export const useVendorList = (filters?: VendorFilters) => {
  return useQuery({
    queryKey: ["vendor-list", filters],
    queryFn: async () => {
      let query = supabase
        .from("vendor")
        .select("*")
        .order("nama_vendor");

      if (filters?.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
};
