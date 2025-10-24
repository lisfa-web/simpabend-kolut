import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface LaporanSpmFilters {
  tanggal_dari?: string;
  tanggal_sampai?: string;
  status?: string;
  opd_id?: string;
  jenis_spm?: string;
}

export const useLaporanSpm = (filters?: LaporanSpmFilters) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["laporan-spm", user?.id, filters],
    queryFn: async () => {
      if (!user?.id) return [];

      try {
        let query = supabase
          .from("spm")
          .select(`
            *,
            opd:opd!spm_opd_id_fkey(nama_opd, kode_opd),
            program:program!spm_program_id_fkey(nama_program),
            kegiatan:kegiatan!spm_kegiatan_id_fkey(nama_kegiatan),
            subkegiatan:subkegiatan!spm_subkegiatan_id_fkey(nama_subkegiatan),
            vendor:vendor!spm_vendor_id_fkey(nama_vendor),
            bendahara:profiles!spm_bendahara_id_fkey(full_name),
            resepsionis:profiles!spm_verified_by_resepsionis_fkey(full_name),
            pbmd:profiles!spm_verified_by_pbmd_fkey(full_name),
            akuntansi:profiles!spm_verified_by_akuntansi_fkey(full_name),
            perbendaharaan:profiles!spm_verified_by_perbendaharaan_fkey(full_name),
            kepala_bkad:profiles!spm_verified_by_kepala_bkad_fkey(full_name)
          `)
          .order("tanggal_ajuan", { ascending: false });

        // Apply filters
        if (filters?.tanggal_dari) {
          query = query.gte("tanggal_ajuan", filters.tanggal_dari);
        }

        if (filters?.tanggal_sampai) {
          query = query.lte("tanggal_ajuan", filters.tanggal_sampai);
        }

        if (filters?.status && filters.status !== "all") {
          query = query.eq("status", filters.status as any);
        }

        if (filters?.opd_id && filters.opd_id !== "all") {
          query = query.eq("opd_id", filters.opd_id);
        }

        if (filters?.jenis_spm && filters.jenis_spm !== "all") {
          query = query.eq("jenis_spm", filters.jenis_spm as any);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching laporan SPM:", error);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error("Error in useLaporanSpm:", error);
        return [];
      }
    },
    enabled: !!user?.id,
  });
};
