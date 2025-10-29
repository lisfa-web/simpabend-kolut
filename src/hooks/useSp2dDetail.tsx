import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSp2dDetail = (sp2dId: string | undefined) => {
  return useQuery({
    queryKey: ["sp2d-detail", sp2dId],
    queryFn: async () => {
      if (!sp2dId) return null;

      const { data, error } = await supabase
        .from("sp2d")
        .select(`
          *,
          spm:spm_id(
            *,
            opd:opd_id(nama_opd, kode_opd),
            jenis_spm:jenis_spm_id(nama_jenis, ada_pajak),
            bendahara:profiles!spm_bendahara_id_fkey(full_name, email)
          )
        `)
        .eq("id", sp2dId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!sp2dId,
  });
};
