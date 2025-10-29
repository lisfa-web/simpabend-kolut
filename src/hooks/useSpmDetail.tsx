import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSpmDetail = (spmId: string | undefined) => {
  return useQuery({
    queryKey: ["spm-detail", spmId],
    queryFn: async () => {
      if (!spmId) return null;

      const { data, error } = await supabase
        .from("spm")
        .select(`
          *,
          opd:opd_id(nama_opd, kode_opd),
          jenis_spm:jenis_spm_id(nama_jenis, ada_pajak, deskripsi),
          bendahara:profiles!spm_bendahara_id_fkey(full_name, email),
          lampiran_spm(*),
          potongan_pajak_spm(*)
        `)
        .eq("id", spmId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!spmId,
  });
};
