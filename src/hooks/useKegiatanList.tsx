import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface KegiatanFilters {
  program_id?: string;
  is_active?: boolean;
}

export const useKegiatanList = (filters?: KegiatanFilters) => {
  return useQuery({
    queryKey: ["kegiatan-list", filters],
    queryFn: async () => {
      if (!filters?.program_id) return [];

      let query = supabase
        .from("kegiatan")
        .select("*")
        .eq("program_id", filters.program_id)
        .order("nama_kegiatan");

      if (filters?.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!filters?.program_id,
  });
};
