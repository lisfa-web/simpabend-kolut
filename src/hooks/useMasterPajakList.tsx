import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MasterPajakFilters {
  is_active?: boolean;
}

export interface MasterPajak {
  id: string;
  kode_pajak: string;
  nama_pajak: string;
  jenis_pajak: 'pph_21' | 'pph_22' | 'pph_23' | 'pph_4_ayat_2' | 'ppn';
  rekening_pajak: string;
  tarif_default: number;
  deskripsi?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useMasterPajakList = (filters?: MasterPajakFilters) => {
  return useQuery({
    queryKey: ["master-pajak", filters],
    queryFn: async () => {
      let query = (supabase as any)
        .from("master_pajak")
        .select("*")
        .order("kode_pajak");

      if (filters?.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as MasterPajak[];
    },
  });
};

export const useMasterPajakById = (id?: string) => {
  return useQuery({
    queryKey: ["master-pajak", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await (supabase as any)
        .from("master_pajak")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data as MasterPajak;
    },
    enabled: !!id,
  });
};
