import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSubkegiatanList = (kegiatanId?: string) => {
  return useQuery({
    queryKey: ["subkegiatan-list", kegiatanId],
    queryFn: async () => {
      if (!kegiatanId) return [];

      const { data, error } = await supabase
        .from("subkegiatan")
        .select("*")
        .eq("kegiatan_id", kegiatanId)
        .eq("is_active", true)
        .order("nama_subkegiatan");

      if (error) throw error;
      return data;
    },
    enabled: !!kegiatanId,
  });
};
