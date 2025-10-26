import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PajakPerJenisSpm {
  id: string;
  jenis_spm: string;
  master_pajak_id: string;
  tarif_khusus?: number;
  uraian_template?: string;
  is_default: boolean;
  urutan: number;
  created_at: string;
  updated_at: string;
  master_pajak?: {
    id: string;
    kode_pajak: string;
    nama_pajak: string;
    jenis_pajak: string;
    rekening_pajak: string;
    tarif_default: number;
    kategori?: string;
    deskripsi?: string;
    is_active: boolean;
  };
}

interface UsePajakPerJenisSpmListFilters {
  jenis_spm?: string;
  is_default?: boolean;
}

export const usePajakPerJenisSpmList = (filters?: UsePajakPerJenisSpmListFilters) => {
  return useQuery({
    queryKey: ["pajak-per-jenis-spm", filters],
    queryFn: async () => {
      let query = (supabase as any)
        .from("pajak_per_jenis_spm")
        .select(`
          *,
          master_pajak:master_pajak_id (*)
        `)
        .order("jenis_spm")
        .order("urutan");

      if (filters?.jenis_spm) {
        query = query.eq("jenis_spm", filters.jenis_spm);
      }
      if (filters?.is_default !== undefined) {
        query = query.eq("is_default", filters.is_default);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PajakPerJenisSpm[];
    },
  });
};

export const usePajakPerJenisSpmById = (id?: string) => {
  return useQuery({
    queryKey: ["pajak-per-jenis-spm", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await (supabase as any)
        .from("pajak_per_jenis_spm")
        .select(`
          *,
          master_pajak:master_pajak_id (*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as PajakPerJenisSpm;
    },
    enabled: !!id,
  });
};
