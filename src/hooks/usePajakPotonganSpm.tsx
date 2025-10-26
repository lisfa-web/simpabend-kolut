import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Hook to fetch master pajak options from database with categorization
export const useMasterPajakOptions = () => {
  return useQuery({
    queryKey: ["master-pajak-options"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("master_pajak")
        .select("*")
        .eq("is_active", true)
        .order("kode_pajak", { ascending: true });
      
      if (error) throw error;
      
      // Transform to match format
      return (data || []).map((pajak: any) => ({
        value: pajak.jenis_pajak,
        label: pajak.nama_pajak,
        rekening: pajak.rekening_pajak,
        kode: pajak.kode_pajak,
        tarif_default: pajak.tarif_default,
      }));
    },
  });
};

// Hook to get suggested taxes for a specific SPM type from database
export const useSuggestedTaxes = (jenisSpm: string | null) => {
  return useQuery({
    queryKey: ["suggested-taxes-spm", jenisSpm],
    queryFn: async () => {
      if (!jenisSpm) return [];
      
      const { data, error } = await supabase
        .from("pajak_per_jenis_spm")
        .select(`
          *,
          master_pajak:master_pajak_id!inner (*)
        `)
        .eq("jenis_spm", jenisSpm)
        .eq("is_default", true)
        .order("urutan");
      
      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        jenis: item.master_pajak.jenis_pajak,
        tarif: item.tarif_khusus || item.master_pajak.tarif_default,
        uraian: item.uraian_template || item.master_pajak.nama_pajak,
        rekening: item.master_pajak.rekening_pajak,
        kode: item.master_pajak.kode_pajak,
      }));
    },
    enabled: !!jenisSpm,
  });
};

// Keep backward compatibility - deprecated, use hooks above instead
export const JENIS_PAJAK_OPTIONS = [
  { value: "pph_21", label: "PPh Pasal 21", rekening: "411121" },
  { value: "pph_22", label: "PPh Pasal 22", rekening: "411122" },
  { value: "pph_23", label: "PPh Pasal 23", rekening: "411124" },
  { value: "pph_4_ayat_2", label: "PPh Pasal 4 Ayat 2", rekening: "411128" },
  { value: "ppn", label: "PPN", rekening: "411211" },
];

export const getSuggestedTaxes = (jenisSpm: string): Array<{ jenis: string; tarif: number; uraian: string }> => {
  // Deprecated - use useSuggestedTaxes hook instead
  switch (jenisSpm) {
    case "ls_gaji":
      return [
        { jenis: "pph_21", tarif: 5, uraian: "PPh 21 atas Gaji dan Tunjangan" },
      ];
    case "ls_barang_jasa":
      return [
        { jenis: "pph_22", tarif: 1.5, uraian: "PPh 22 atas Pembelian Barang" },
        { jenis: "ppn", tarif: 11, uraian: "PPN atas Pembelian Barang dan Jasa" },
      ];
    case "ls_belanja_modal":
      return [
        { jenis: "pph_4_ayat_2", tarif: 2.65, uraian: "PPh 4(2) atas Jasa Konstruksi" },
        { jenis: "ppn", tarif: 11, uraian: "PPN atas Belanja Modal" },
      ];
    default:
      return [];
  }
};

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
