import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface LaporanKeuanganFilters {
  tanggal_dari?: string;
  tanggal_sampai?: string;
  opd_id?: string;
  program_id?: string;
}

export const useLaporanKeuangan = (filters?: LaporanKeuanganFilters) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["laporan-keuangan", user?.id, filters],
    queryFn: async () => {
      if (!user?.id) return { spm: [], sp2d: [] };

      try {
        // Fetch SPM data
        let spmQuery = supabase
          .from("spm")
          .select(`
            *,
            opd:opd_id(nama_opd, id),
            program:program_id(nama_program, id),
            kegiatan:kegiatan_id(nama_kegiatan),
            subkegiatan:subkegiatan_id(nama_subkegiatan)
          `);

        if (filters?.tanggal_dari) {
          spmQuery = spmQuery.gte("tanggal_ajuan", filters.tanggal_dari);
        }

        if (filters?.tanggal_sampai) {
          spmQuery = spmQuery.lte("tanggal_ajuan", filters.tanggal_sampai);
        }

        if (filters?.opd_id && filters.opd_id !== "all") {
          spmQuery = spmQuery.eq("opd_id", filters.opd_id);
        }

        if (filters?.program_id && filters.program_id !== "all") {
          spmQuery = spmQuery.eq("program_id", filters.program_id);
        }

        const { data: spmData, error: spmError } = await spmQuery;

        if (spmError) {
          console.error("Error fetching SPM for laporan keuangan:", spmError);
          throw spmError;
        }

        // Fetch SP2D data
        let sp2dQuery = supabase
          .from("sp2d")
          .select(`
            *,
            spm:spm_id(
              opd:opd_id(nama_opd, id),
              program:program_id(nama_program, id)
            )
          `);

        if (filters?.tanggal_dari) {
          sp2dQuery = sp2dQuery.gte("tanggal_sp2d", filters.tanggal_dari);
        }

        if (filters?.tanggal_sampai) {
          sp2dQuery = sp2dQuery.lte("tanggal_sp2d", filters.tanggal_sampai);
        }

        const { data: sp2dData, error: sp2dError } = await sp2dQuery;

        if (sp2dError) {
          console.error("Error fetching SP2D for laporan keuangan:", sp2dError);
          throw sp2dError;
        }

        return {
          spm: spmData || [],
          sp2d: sp2dData || [],
        };
      } catch (error) {
        console.error("Error in useLaporanKeuangan:", error);
        return { spm: [], sp2d: [] };
      }
    },
    enabled: !!user?.id,
  });
};
