import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface LaporanSp2dFilters {
  tanggal_dari?: string;
  tanggal_sampai?: string;
  status?: string;
  opd_id?: string;
}

export const useLaporanSp2d = (filters?: LaporanSp2dFilters) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["laporan-sp2d", user?.id, filters],
    queryFn: async () => {
      if (!user?.id) return [];

      try {
        let query = supabase
          .from("sp2d")
          .select(`
            *,
            creator:created_by(full_name),
            verifier:verified_by(full_name),
            spm:spm_id(
              nomor_spm,
              opd:opd_id(nama_opd, kode_opd, id),
              bendahara:profiles!spm_bendahara_id_fkey(full_name)
            )
          `)
          .order("tanggal_sp2d", { ascending: false });

        // Apply filters
        if (filters?.tanggal_dari) {
          query = query.gte("tanggal_sp2d", filters.tanggal_dari);
        }

        if (filters?.tanggal_sampai) {
          query = query.lte("tanggal_sp2d", filters.tanggal_sampai);
        }

        if (filters?.status && filters.status !== "all") {
          query = query.eq("status", filters.status as any);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching laporan SP2D:", error);
          throw error;
        }

        // Filter by OPD if needed
        let filteredData = data || [];
        if (filters?.opd_id && filters.opd_id !== "all") {
          filteredData = filteredData.filter(
            (item: any) => item.spm?.opd?.id === filters.opd_id
          );
        }

        return filteredData;
      } catch (error) {
        console.error("Error in useLaporanSp2d:", error);
        return [];
      }
    },
    enabled: !!user?.id,
  });
};
