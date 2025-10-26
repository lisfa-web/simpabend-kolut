import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MasterPajak {
  id: string;
  kode_pajak: string;
  nama_pajak: string;
  jenis_pajak: "pph_21" | "pph_22" | "pph_23" | "pph_4_ayat_2" | "ppn";
  rekening_pajak: string;
  tarif_default: number;
  deskripsi?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useMasterPajakList = () => {
  return useQuery({
    queryKey: ["master-pajak"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("master_pajak")
        .select("*")
        .order("kode_pajak", { ascending: true });

      if (error) throw error;
      return data as MasterPajak[];
    },
  });
};

export const useMasterPajakByJenis = (jenisSpm?: string) => {
  return useQuery({
    queryKey: ["master-pajak-by-jenis", jenisSpm],
    queryFn: async () => {
      if (!jenisSpm) return [];

      const { data, error } = await supabase
        .from("pajak_per_jenis_spm")
        .select(`
          *,
          master_pajak:master_pajak_id (*)
        `)
        .eq("jenis_spm", jenisSpm)
        .order("urutan", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!jenisSpm,
  });
};
