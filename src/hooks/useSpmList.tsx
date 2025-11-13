import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface SpmListFilters {
  search?: string;
  jenis_spm_id?: string;
  status?: string | string[];
  opd_id?: string;
  tanggal_dari?: string;
  tanggal_sampai?: string;
  page?: number;
  pageSize?: number;
}

export const useSpmList = (filters?: SpmListFilters) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["spm-list", user?.id, filters],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from("spm")
        .select(`
          *,
          opd:opd_id(nama_opd, kode_opd),
          jenis_spm:jenis_spm_id(nama_jenis, ada_pajak, deskripsi)
        `, { count: "exact" })
        .order("created_at", { ascending: false });

      // Apply search filter - search in nomor_spm, uraian, and nama_penerima
      if (filters?.search) {
        query = query.or(`nomor_spm.ilike.%${filters.search}%,uraian.ilike.%${filters.search}%,nama_penerima.ilike.%${filters.search}%`);
      }

      // Apply jenis SPM filter
      if (filters?.jenis_spm_id) {
        query = query.eq("jenis_spm_id", filters.jenis_spm_id);
      }

      // Apply status filter
      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          query = query.in("status", filters.status as any);
        } else {
          query = query.eq("status", filters.status as any);
        }
      }

      // Apply OPD filter
      if (filters?.opd_id) {
        query = query.eq("opd_id", filters.opd_id);
      }

      // Apply date range filters
      if (filters?.tanggal_dari) {
        query = query.gte("tanggal_ajuan", filters.tanggal_dari);
      }

      if (filters?.tanggal_sampai) {
        query = query.lte("tanggal_ajuan", filters.tanggal_sampai);
      }

      // Apply pagination
      if (filters?.page && filters?.pageSize) {
        const from = (filters.page - 1) * filters.pageSize;
        const to = from + filters.pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      return { data: data || [], count: count || 0 };
    },
    enabled: !!user?.id,
  });
};
