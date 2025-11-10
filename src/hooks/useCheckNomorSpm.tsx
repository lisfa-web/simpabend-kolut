import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCheckNomorSpmExists = (nomor: string, excludeId?: string) => {
  return useQuery({
    queryKey: ["check-nomor-spm", nomor, excludeId],
    queryFn: async () => {
      if (!nomor || nomor.trim().length === 0) {
        return { exists: false };
      }

      let query = supabase
        .from("spm")
        .select("id, nomor_spm")
        .eq("nomor_spm", nomor.trim())
        .limit(1);

      if (excludeId) {
        query = query.neq("id", excludeId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        exists: data && data.length > 0,
        existingId: data?.[0]?.id,
      };
    },
    enabled: !!nomor && nomor.trim().length > 0,
    // Debounce by using staleTime
    staleTime: 500,
  });
};
