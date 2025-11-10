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
            opd:opd_id(
              nama_opd, 
              kode_opd
            ),
            jenis_spm:jenis_spm_id(
              nama_jenis, 
              ada_pajak
            ),
            bendahara:bendahara_id(
              full_name, 
              email, 
              phone
            )
          ),
          created_by_user:created_by(
            full_name,
            email
          ),
          verified_by_user:verified_by(
            full_name,
            email
          )
        `)
        .eq("id", sp2dId)
        .single();

      if (error) {
        console.error("Error fetching SP2D detail:", error);
        throw error;
      }
      
      if (!data) {
        console.warn("SP2D not found:", sp2dId);
        return null;
      }

      console.log("SP2D detail loaded:", data);
      return data;
    },
    enabled: !!sp2dId,
    retry: 1,
  });
};
