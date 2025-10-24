import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProgramFilters {
  tahun_anggaran?: number;
  is_active?: boolean;
}

export const useProgramList = (filters?: ProgramFilters) => {
  return useQuery({
    queryKey: ["program-list", filters],
    queryFn: async () => {
      let query = supabase
        .from("program")
        .select("*")
        .order("nama_program");

      if (filters?.tahun_anggaran) {
        query = query.eq("tahun_anggaran", filters.tahun_anggaran);
      }

      if (filters?.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
};
