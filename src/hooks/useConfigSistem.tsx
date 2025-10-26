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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Helper untuk parse file size config (e.g., "1024" atau "5")
export const parseFileSizeConfig = (value: string, unit: string = "MB"): { angka: number; satuan: string } => {
  const angka = parseFloat(value) || 0;
  return { angka, satuan: unit };
};

// Helper untuk konversi file size ke MB
export const getFileSizeInMB = (configs: any[] | undefined): number => {
  if (!configs) return 5; // default 5MB
  
  const sizeConfig = configs.find(c => c.key === 'max_file_size');
  const unitConfig = configs.find(c => c.key === 'max_file_size_unit');
  
  if (!sizeConfig) return 5;
  
  const value = parseFloat(sizeConfig.value) || 5;
  const unit = unitConfig?.value || 'MB';
  
  // Konversi ke MB
  if (unit === 'KB') {
    return value / 1024;
  }
  
  return value;
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
