import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TemplateSuratFilters {
  jenis_surat?: string;
  is_active?: boolean;
  search?: string;
}

export const useTemplateSuratList = (filters?: TemplateSuratFilters) => {
  return useQuery({
    queryKey: ["template_surat", filters],
    queryFn: async () => {
      let query = supabase
        .from("template_surat")
        .select("*")
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

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
};
