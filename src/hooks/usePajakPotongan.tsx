import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Hook to fetch master pajak options from database (reuse from usePajakPotonganSpm)
export const useMasterPajakOptions = () => {
  return useQuery({
    queryKey: ["master-pajak-options"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("master_pajak")
        .select("*")
        .eq("is_active", true)
        .order("kode_pajak");
      
      if (error) throw error;
      
      return (data || []).map(pajak => ({
        value: pajak.jenis_pajak,
        label: pajak.nama_pajak,
        rekening: pajak.rekening_pajak,
        kode: pajak.kode_pajak,
        tarif_default: pajak.tarif_default,
      }));
    },
  });
};

// Hook to get suggested taxes for SP2D based on SPM type
export const useSuggestedTaxes = (jenisSpm: string | null) => {
  return useQuery({
    queryKey: ["suggested-taxes-sp2d", jenisSpm],
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
  { value: "pph_21", label: "PPh Pasal 21 - Gaji/Honorarium", rekening: "4.1.1.01" },
  { value: "pph_22", label: "PPh Pasal 22 - Pembelian Barang", rekening: "4.1.1.02" },
  { value: "pph_23", label: "PPh Pasal 23 - Jasa", rekening: "4.1.1.03" },
  { value: "pph_4_ayat_2", label: "PPh Pasal 4 Ayat 2 (Final)", rekening: "4.1.1.04" },
  { value: "ppn", label: "PPN - Pajak Pertambahan Nilai", rekening: "4.1.2.01" },
];

export const getSuggestedTaxes = (jenisSpm: string) => {
  // Deprecated - use useSuggestedTaxes hook instead
  const suggestions: Array<{ jenis: string; tarif: number; uraian: string }> = [];
  
  switch (jenisSpm) {
    case "ls_gaji":
      suggestions.push({ jenis: "pph_21", tarif: 5, uraian: "PPh 21 Gaji Pegawai" });
      break;
    case "ls_barang_jasa":
      suggestions.push({ jenis: "pph_22", tarif: 1.5, uraian: "PPh 22 Pembelian Barang" });
      suggestions.push({ jenis: "ppn", tarif: 11, uraian: "PPN 11%" });
      break;
    case "ls_belanja_modal":
      suggestions.push({ jenis: "pph_4_ayat_2", tarif: 2.5, uraian: "PPh Final Konstruksi" });
      suggestions.push({ jenis: "ppn", tarif: 11, uraian: "PPN 11%" });
      break;
  }
  
  return suggestions;
};

export interface PajakPotongan {
  id?: string;
  sp2d_id: string;
  jenis_pajak: "pph_21" | "pph_22" | "pph_23" | "pph_4_ayat_2" | "ppn";
  rekening_pajak?: string;
  uraian: string;
  tarif: number; // Percentage
  dasar_pengenaan: number;
  jumlah_pajak: number;
}


export const usePajakPotongan = (sp2dId?: string) => {
  const queryClient = useQueryClient();

  const { data: potonganList = [], isLoading } = useQuery({
    queryKey: ["pajak-potongan", sp2dId],
    queryFn: async () => {
      if (!sp2dId) return [];
      
      const { data, error } = await supabase
        .from("potongan_pajak_sp2d")
        .select("*")
        .eq("sp2d_id", sp2dId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!sp2dId,
  });

  const createPotongan = useMutation({
    mutationFn: async (potongan: PajakPotongan) => {
      const { data, error } = await supabase
        .from("potongan_pajak_sp2d")
        .insert([potongan])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pajak-potongan"] });
      queryClient.invalidateQueries({ queryKey: ["sp2d-detail"] });
      toast.success("Potongan pajak berhasil ditambahkan");
    },
    onError: (error: any) => {
      toast.error(`Gagal menambahkan potongan pajak: ${error.message}`);
    },
  });

  const updatePotongan = useMutation({
    mutationFn: async ({ id, ...potongan }: PajakPotongan & { id: string }) => {
      const { data, error } = await supabase
        .from("potongan_pajak_sp2d")
        .update(potongan)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pajak-potongan"] });
      queryClient.invalidateQueries({ queryKey: ["sp2d-detail"] });
      toast.success("Potongan pajak berhasil diupdate");
    },
    onError: (error: any) => {
      toast.error(`Gagal mengupdate potongan pajak: ${error.message}`);
    },
  });

  const deletePotongan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("potongan_pajak_sp2d")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pajak-potongan"] });
      queryClient.invalidateQueries({ queryKey: ["sp2d-detail"] });
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
