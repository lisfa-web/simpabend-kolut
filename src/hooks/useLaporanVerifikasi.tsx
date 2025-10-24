import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface LaporanVerifikasiFilters {
  tanggal_dari?: string;
  tanggal_sampai?: string;
}

export const useLaporanVerifikasi = (filters?: LaporanVerifikasiFilters) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["laporan-verifikasi", user?.id, filters],
    queryFn: async () => {
      if (!user?.id) return [];

      try {
        let query = supabase
          .from("spm")
          .select(`
            *,
            opd:opd_id(nama_opd),
            bendahara:profiles!spm_bendahara_id_fkey(full_name)
          `)
          .order("tanggal_ajuan", { ascending: false });

        // Apply filters
        if (filters?.tanggal_dari) {
          query = query.gte("tanggal_ajuan", filters.tanggal_dari);
        }

        if (filters?.tanggal_sampai) {
          query = query.lte("tanggal_ajuan", filters.tanggal_sampai);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching laporan verifikasi:", error);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error("Error in useLaporanVerifikasi:", error);
        return [];
      }
    },
    enabled: !!user?.id,
  });
};
