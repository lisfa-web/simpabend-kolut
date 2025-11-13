import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface JenisSpmListFilters {
  is_active?: boolean;
  page?: number;
  pageSize?: number;
}

export const useJenisSpmList = (filters?: JenisSpmListFilters) => {
  return useQuery({
    queryKey: ["jenis-spm-list", filters],
    queryFn: async () => {
      let query = supabase
        .from("jenis_spm")
        .select("*", { count: "exact" })
        .order("nama_jenis", { ascending: true });

      if (filters?.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active);
      }

      // Apply pagination
      if (filters?.page && filters?.pageSize) {
        const from = (filters.page - 1) * filters.pageSize;
        const to = from + filters.pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      return { data: data || [], count: count || 0 };
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
