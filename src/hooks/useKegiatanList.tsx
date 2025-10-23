import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useKegiatanList = (programId?: string) => {
  return useQuery({
    queryKey: ["kegiatan-list", programId],
    queryFn: async () => {
      if (!programId) return [];

      const { data, error } = await supabase
        .from("kegiatan")
        .select("*")
        .eq("program_id", programId)
        .eq("is_active", true)
        .order("nama_kegiatan");

      if (error) throw error;
      return data;
    },
    enabled: !!programId,
  });
};
