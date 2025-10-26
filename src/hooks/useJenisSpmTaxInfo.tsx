import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TaxInfoItem {
  id: string;
  jenis: string;
  kode: string;
  nama: string;
  rekening: string;
  tarif: number;
  uraian?: string;
  is_default: boolean;
}

export interface JenisSpmTaxMapping {
  [key: string]: TaxInfoItem[];
}

export const useJenisSpmTaxInfo = () => {
  return useQuery({
    queryKey: ["jenis-spm-tax-info", "v2"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("pajak_per_jenis_spm")
        .select(`
          *,
          master_pajak:master_pajak_id!inner (
            id,
            kode_pajak,
            nama_pajak,
            jenis_pajak,
            rekening_pajak,
            tarif_default,
            deskripsi,
            is_active
          )
        `)
        .eq("master_pajak.is_active", true)
        .order("jenis_spm")
        .order("urutan");

      if (error) throw error;

      // Group by jenis_spm
      const grouped: JenisSpmTaxMapping = {};
      
      data?.forEach((item: any) => {
        const jenis = item.jenis_spm;
        if (!grouped[jenis]) {
          grouped[jenis] = [];
        }

        if (item.master_pajak) {
          grouped[jenis].push({
            id: item.id,
            jenis: item.master_pajak.jenis_pajak,
            kode: item.master_pajak.kode_pajak,
            nama: item.master_pajak.nama_pajak,
            rekening: item.master_pajak.rekening_pajak,
            tarif: item.tarif_khusus || item.master_pajak.tarif_default,
            uraian: item.uraian_template || item.master_pajak.deskripsi,
            is_default: item.is_default,
          });
        }
      });

      return grouped;
    },
  });
};

// Helper function to get tax labels
export const getJenisSpmLabel = (jenis: string): string => {
  const labels: Record<string, string> = {
    up: "UP (Uang Persediaan)",
    gu: "GU (Ganti Uang)",
    tu: "TU (Tambah Uang)",
    ls_gaji: "LS Gaji",
    ls_barang: "LS Barang",
    ls_jasa: "LS Jasa",
    ls_honorarium: "LS Honorarium",
    ls_jasa_konstruksi: "LS Jasa Konstruksi",
    ls_sewa: "LS Sewa",
    ls_barang_jasa: "LS Barang & Jasa",
    ls_belanja_modal: "LS Belanja Modal",
  };
  return labels[jenis] || jenis.toUpperCase().replace(/_/g, ' ');
};
