import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ArsipSpmFilters {
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const useArsipSpmList = (filters?: ArsipSpmFilters) => {
  return useQuery({
    queryKey: ["arsip-spm-list", filters],
    queryFn: async () => {
      let query = supabase
        .from("arsip_spm")
        .select("*, opd:opd_id(nama_opd)")
        .order("tanggal_spm", { ascending: false });

      if (filters?.startDate) {
        query = query.gte("tanggal_spm", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("tanggal_spm", filters.endDate);
      }
      if (filters?.search) {
        query = query.or(
          `nomor_spm.ilike.%${filters.search}%,nama_penerima.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};
