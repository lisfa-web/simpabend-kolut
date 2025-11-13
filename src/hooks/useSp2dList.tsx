import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Sp2dListFilters {
  search?: string;
  status?: string | string[];
  tanggal_dari?: string;
  tanggal_sampai?: string;
  opd_id?: string;
  page?: number;
  pageSize?: number;
}

export const useSp2dList = (filters?: Sp2dListFilters) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sp2d-list", user?.id, filters],
    queryFn: async () => {
      if (!user?.id) return { data: [], count: 0 };

      try {
      let query = supabase
        .from("sp2d")
        .select(`
          *,
          spm:spm_id (
            id,
            nomor_spm,
            uraian,
            nilai_spm,
            nama_penerima,
            bendahara_id,
            bendahara:bendahara_id (
              nama_bendahara,
              email
            )
          ),
          opd:opd_id (
            id,
            nama_opd,
            kode_opd
          ),
          jenis_spm:jenis_spm_id (
            nama_jenis
          ),
          bendahara:bendahara_id (
            id,
            nama_bendahara,
            nip,
            nama_bank,
            nomor_rekening,
            kode_opd
          )
        `, { count: "exact" })
        .order("created_at", { ascending: false });

        // Apply search filter - search in nomor_sp2d, nomor_spm, and nama_penerima
        if (filters?.search) {
          query = query.or(`nomor_sp2d.ilike.%${filters.search}%,spm.nomor_spm.ilike.%${filters.search}%,spm.nama_penerima.ilike.%${filters.search}%`);
        }

        // Apply status filter
        if (filters?.status) {
          if (Array.isArray(filters.status)) {
            query = query.in("status", filters.status as any);
          } else if (filters.status !== "" && filters.status !== "all") {
            query = query.eq("status", filters.status as any);
          }
        }

        // Apply date range filters
        if (filters?.tanggal_dari) {
          query = query.gte("tanggal_sp2d", filters.tanggal_dari);
        }

      if (filters?.tanggal_sampai) {
        query = query.lte("tanggal_sp2d", filters.tanggal_sampai);
      }

      // Apply pagination
      if (filters?.page && filters?.pageSize) {
        const from = (filters.page - 1) * filters.pageSize;
        const to = from + filters.pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching SP2D list:", error);
        throw error;
      }
      
      // Client-side filtering for OPD since it's a nested field
      let filteredData = data || [];
      if (filters?.opd_id) {
        filteredData = filteredData.filter(
          (sp2d: any) => sp2d.spm?.opd_id === filters.opd_id
        );
      }
      
      return { data: filteredData, count: count || 0 };
      } catch (error) {
        console.error("Error in useSp2dList:", error);
        return { data: [], count: 0 };
      }
    },
    enabled: !!user?.id,
  });
};
