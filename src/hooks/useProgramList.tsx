import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProgramList = (tahunAnggaran?: number) => {
  return useQuery({
    queryKey: ["program-list", tahunAnggaran],
    queryFn: async () => {
      let query = supabase
        .from("program")
        .select("*")
        .eq("is_active", true)
        .order("nama_program");

      if (tahunAnggaran) {
        query = query.eq("tahun_anggaran", tahunAnggaran);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
};
