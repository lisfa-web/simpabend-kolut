import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TemplateSuratFilters {
  jenis_surat?: string;
  is_active?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const useTemplateSuratList = (filters?: TemplateSuratFilters) => {
  return useQuery({
    queryKey: ["template_surat", filters],
    queryFn: async () => {
      let query = supabase
        .from("template_surat")
        .select("*", { count: "exact" })
        .order("nama_template", { ascending: true });

      if (filters?.jenis_surat) {
        query = query.eq("jenis_surat", filters.jenis_surat);
      }

      if (filters?.is_active !== undefined) {
        query = query.eq("is_active", filters.is_active);
      }

      if (filters?.search) {
        query = query.ilike("nama_template", `%${filters.search}%`);
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
