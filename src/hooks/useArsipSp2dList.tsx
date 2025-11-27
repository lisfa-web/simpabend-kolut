import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ArsipSp2dFilters {
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const useArsipSp2dList = (filters?: ArsipSp2dFilters) => {
  return useQuery({
    queryKey: ["arsip-sp2d-list", filters],
    queryFn: async () => {
      let query = supabase
        .from("arsip_sp2d")
        .select("*, opd:opd_id(nama_opd)")
        .order("tanggal_sp2d", { ascending: false });

      if (filters?.startDate) {
        query = query.gte("tanggal_sp2d", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("tanggal_sp2d", filters.endDate);
      }
      if (filters?.search) {
        query = query.ilike("nomor_sp2d", `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};
