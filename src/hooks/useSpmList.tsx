import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface SpmListFilters {
  search?: string;
  jenis_spm_id?: string;
  status?: string | string[];
  tanggal_dari?: string;
  tanggal_sampai?: string;
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
          opd:opd_id(nama_opd),
          jenis_spm:jenis_spm_id(nama_jenis, ada_pajak, deskripsi)
        `)
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters?.search) {
        query = query.or(`nomor_spm.ilike.%${filters.search}%,uraian.ilike.%${filters.search}%`);
      }

      if (filters?.jenis_spm_id) {
        query = query.eq("jenis_spm_id", filters.jenis_spm_id);
      }

      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          query = query.in("status", filters.status as any);
        } else {
          query = query.eq("status", filters.status as any);
        }
      }

      if (filters?.tanggal_dari) {
        query = query.gte("tanggal_ajuan", filters.tanggal_dari);
      }

      if (filters?.tanggal_sampai) {
        query = query.lte("tanggal_ajuan", filters.tanggal_sampai);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
};
