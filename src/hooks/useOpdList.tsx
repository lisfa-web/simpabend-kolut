import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface OpdFilters {
  is_active?: boolean;
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

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
};
