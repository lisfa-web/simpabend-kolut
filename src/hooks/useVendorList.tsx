import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useVendorList = () => {
  return useQuery({
    queryKey: ["vendor-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendor")
        .select("*")
        .eq("is_active", true)
        .order("nama_vendor");

      if (error) throw error;
      return data;
    },
  });
};
