import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SubkegiatanFilters {
  kegiatan_id?: string;
  is_active?: boolean;
}

export const useSubkegiatanList = (filters?: SubkegiatanFilters) => {
  return useQuery({
    queryKey: ["subkegiatan-list", filters],
    queryFn: async () => {
      if (!filters?.kegiatan_id) return [];

      let query = supabase
        .from("subkegiatan")
        .select("*")
        .eq("kegiatan_id", filters.kegiatan_id)
        .order("nama_subkegiatan");

      if (filters?.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!filters?.kegiatan_id,
  });
};
