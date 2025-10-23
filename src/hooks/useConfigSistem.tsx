import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useConfigSistem = () => {
  return useQuery({
    queryKey: ["config-sistem"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("config_sistem")
        .select("*")
        .order("key");

      if (error) throw error;
      return data;
    },
  });
};

export const useConfigMutation = () => {
  const queryClient = useQueryClient();

  const updateConfig = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from("config_sistem")
        .upsert({ key, value }, { onConflict: "key" });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config-sistem"] });
      toast.success("Konfigurasi berhasil diperbarui");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal memperbarui konfigurasi");
    },
  });

  return { updateConfig };
};
