import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface LaporanKeuanganFilters {
  tanggal_dari?: string;
  tanggal_sampai?: string;
  opd_id?: string;
  page?: number;
  pageSize?: number;
}

export const useLaporanKeuangan = (filters?: LaporanKeuanganFilters) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["laporan-keuangan", user?.id, filters],
    queryFn: async () => {
      if (!user?.id) return { spm: { data: [], count: 0 }, sp2d: { data: [], count: 0 } };

      try {
        const page = filters?.page || 1;
        const pageSize = filters?.pageSize || 10;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        // Fetch SPM data with pagination
        let spmQuery = supabase
          .from("spm")
          .select(`
            *,
            opd:opd_id(nama_opd, id),
            jenis_spm:jenis_spm_id(nama_jenis)
          `, { count: 'exact' });

        if (filters?.tanggal_dari) {
          spmQuery = spmQuery.gte("tanggal_ajuan", filters.tanggal_dari);
        }

        if (filters?.tanggal_sampai) {
          spmQuery = spmQuery.lte("tanggal_ajuan", filters.tanggal_sampai);
        }

        if (filters?.opd_id && filters.opd_id !== "all") {
          spmQuery = spmQuery.eq("opd_id", filters.opd_id);
        }

        spmQuery = spmQuery.range(from, to);

        const { data: spmData, error: spmError, count: spmCount } = await spmQuery;

        if (spmError) {
          console.error("Error fetching SPM for laporan keuangan:", spmError);
          throw spmError;
        }

        // Fetch SP2D data with pagination
        let sp2dQuery = supabase
          .from("sp2d")
          .select(`
            *,
            spm:spm_id(
              opd:opd_id(nama_opd, id)
            )
          `, { count: 'exact' });

        if (filters?.tanggal_dari) {
          sp2dQuery = sp2dQuery.gte("tanggal_sp2d", filters.tanggal_dari);
        }

        if (filters?.tanggal_sampai) {
          sp2dQuery = sp2dQuery.lte("tanggal_sp2d", filters.tanggal_sampai);
        }

        sp2dQuery = sp2dQuery.range(from, to);

        const { data: sp2dData, error: sp2dError, count: sp2dCount } = await sp2dQuery;

        if (sp2dError) {
          console.error("Error fetching SP2D for laporan keuangan:", sp2dError);
          throw sp2dError;
        }

        return {
          spm: { data: spmData || [], count: spmCount || 0 },
          sp2d: { data: sp2dData || [], count: sp2dCount || 0 },
        };
      } catch (error) {
        console.error("Error in useLaporanKeuangan:", error);
        return { spm: { data: [], count: 0 }, sp2d: { data: [], count: 0 } };
      }
    },
    enabled: !!user?.id,
  });
};