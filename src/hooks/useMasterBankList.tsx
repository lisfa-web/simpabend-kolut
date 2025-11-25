import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MasterBankFilters {
  is_active?: boolean;
  enabled?: boolean;
}

export const useMasterBankList = (filters?: MasterBankFilters) => {
  return useQuery({
    queryKey: ["master-bank-list", filters],
    enabled: filters?.enabled !== false,
    queryFn: async () => {
      let query = supabase
        .from("master_bank")
        .select("*")
        .order("nama_bank");

      if (filters?.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
  });
};
