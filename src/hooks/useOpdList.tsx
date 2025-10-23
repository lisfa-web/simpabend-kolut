import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useOpdList = () => {
  return useQuery({
    queryKey: ["opd-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opd")
        .select("*")
        .eq("is_active", true)
        .order("nama_opd");

      if (error) throw error;
      return data;
    },
  });
};
