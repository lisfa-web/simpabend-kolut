import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface JenisSpmListFilters {
  is_active?: boolean;
}

export const useJenisSpmList = (filters?: JenisSpmListFilters) => {
  return useQuery({
    queryKey: ["jenis-spm-list", filters],
    queryFn: async () => {
      let query = supabase
        .from("jenis_spm")
        .select("*")
        .order("nama_jenis", { ascending: true });

      if (filters?.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
};

export const useJenisSpmById = (id: string | undefined) => {
  return useQuery({
    queryKey: ["jenis-spm", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("jenis_spm")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};
