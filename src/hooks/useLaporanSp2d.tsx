import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface LaporanSp2dFilters {
  tanggal_dari?: string;
  tanggal_sampai?: string;
  status?: string;
  opd_id?: string;
  page?: number;
  pageSize?: number;
}

export const useLaporanSp2d = (filters?: LaporanSp2dFilters) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["laporan-sp2d", user?.id, filters],
    queryFn: async () => {
      if (!user?.id) return { data: [], count: 0 };

      try {
        const page = filters?.page || 1;
        const pageSize = filters?.pageSize || 10;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
          .from("sp2d")
          .select(`
            *,
            creator:profiles!sp2d_created_by_fkey(full_name),
            verifier:profiles!sp2d_verified_by_fkey(full_name),
            spm:spm!sp2d_spm_id_fkey(
              nomor_spm,
              opd:opd_id(nama_opd, kode_opd, id),
              bendahara:profiles!spm_bendahara_id_fkey(full_name)
            )
          `, { count: 'exact' })
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

        if (filters?.opd_id && filters.opd_id !== "all") {
          // Filter by OPD through SPM relation - need to fetch SPM IDs first
          const { data: spmIds } = await supabase
            .from("spm")
            .select("id")
            .eq("opd_id", filters.opd_id);
          
          if (spmIds && spmIds.length > 0) {
            query = query.in("spm_id", spmIds.map(s => s.id));
          }
        }

        // Apply pagination
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
          console.error("Error fetching laporan SP2D:", error);
          throw error;
        }

        return { data: data || [], count: count || 0 };
      } catch (error) {
        console.error("Error in useLaporanSp2d:", error);
        return { data: [], count: 0 };
      }
    },
    enabled: !!user?.id,
  });
};
