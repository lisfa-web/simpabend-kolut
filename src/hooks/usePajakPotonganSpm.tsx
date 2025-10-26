import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PajakPotonganSpm {
  id?: string;
  spm_id: string;
  jenis_pajak: "pph_21" | "pph_22" | "pph_23" | "pph_4_ayat_2" | "ppn";
  rekening_pajak?: string;
  uraian: string;
  tarif: number;
  dasar_pengenaan: number;
  jumlah_pajak: number;
}

// Fetch JENIS_PAJAK_OPTIONS from database
export const useJenisPajakOptions = () => {
  return useQuery({
    queryKey: ["jenis-pajak-options"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("master_pajak")
        .select("jenis_pajak, nama_pajak, rekening_pajak")
        .eq("is_active", true)
        .order("jenis_pajak");

      if (error) throw error;
      
      return data.map((p) => ({
        value: p.jenis_pajak,
        label: p.nama_pajak,
        rekening: p.rekening_pajak,
      }));
    },
  });
};

// Fetch suggested taxes from database based on SPM type
export const useSuggestedTaxes = (jenisSpm?: string) => {
  return useQuery({
    queryKey: ["suggested-taxes", jenisSpm],
    queryFn: async () => {
      if (!jenisSpm) return [];

      const { data, error } = await supabase
        .from("pajak_per_jenis_spm")
        .select(`
          *,
          master_pajak:master_pajak_id (
            jenis_pajak,
            nama_pajak,
            rekening_pajak,
            tarif_default
          )
        `)
        .eq("jenis_spm", jenisSpm)
        .eq("is_default", true)
        .order("urutan");

      if (error) throw error;

      return data.map((item: any) => ({
        jenis: item.master_pajak.jenis_pajak,
        tarif: item.tarif_khusus || item.master_pajak.tarif_default,
        uraian: item.uraian_template,
        rekening: item.master_pajak.rekening_pajak,
      }));
    },
    enabled: !!jenisSpm,
  });
};

export const usePajakPotonganSpm = (spmId?: string) => {
  const queryClient = useQueryClient();

  const { data: potonganList = [], isLoading } = useQuery({
    queryKey: ["pajak-potongan-spm", spmId],
    queryFn: async () => {
      if (!spmId) return [];
      
      const { data, error } = await supabase
        .from("potongan_pajak_spm")
        .select("*")
        .eq("spm_id", spmId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!spmId,
  });

  const createPotongan = useMutation({
    mutationFn: async (potongan: PajakPotonganSpm) => {
      const { data, error } = await supabase
        .from("potongan_pajak_spm")
        .insert([potongan])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pajak-potongan-spm"] });
      queryClient.invalidateQueries({ queryKey: ["spm-detail"] });
      toast.success("Potongan pajak berhasil ditambahkan");
    },
    onError: (error: any) => {
      toast.error(`Gagal menambahkan potongan pajak: ${error.message}`);
    },
  });

  const updatePotongan = useMutation({
    mutationFn: async ({ id, ...potongan }: PajakPotonganSpm & { id: string }) => {
      const { data, error } = await supabase
        .from("potongan_pajak_spm")
        .update(potongan)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pajak-potongan-spm"] });
      queryClient.invalidateQueries({ queryKey: ["spm-detail"] });
      toast.success("Potongan pajak berhasil diupdate");
    },
    onError: (error: any) => {
      toast.error(`Gagal mengupdate potongan pajak: ${error.message}`);
    },
  });

  const deletePotongan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("potongan_pajak_spm")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pajak-potongan-spm"] });
      queryClient.invalidateQueries({ queryKey: ["spm-detail"] });
      toast.success("Potongan pajak berhasil dihapus");
    },
    onError: (error: any) => {
      toast.error(`Gagal menghapus potongan pajak: ${error.message}`);
    },
  });

  const calculateTotalPotongan = () => {
    return potonganList.reduce((sum, p) => sum + Number(p.jumlah_pajak), 0);
  };

  return {
    potonganList,
    isLoading,
    createPotongan,
    updatePotongan,
    deletePotongan,
    calculateTotalPotongan,
  };
};
