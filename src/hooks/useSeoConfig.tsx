import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SeoConfig {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const useSeoConfig = () => {
  return useQuery({
    queryKey: ["seo-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seo_config")
        .select("*")
        .order("key");

      if (error) throw error;
      return data as SeoConfig[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useSeoConfigByKey = (key: string) => {
  const { data: configs } = useSeoConfig();
  return configs?.find((c) => c.key === key)?.value || null;
};

export const useSeoConfigMap = () => {
  const { data: configs, isLoading, error } = useSeoConfig();
  
  const configMap: Record<string, string> = {};
  configs?.forEach((c) => {
    if (c.value) configMap[c.key] = c.value;
  });
  
  return { configMap, isLoading, error };
};

export const useSeoMutation = () => {
  const queryClient = useQueryClient();

  const updateConfig = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from("seo_config")
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-config"] });
      toast.success("Konfigurasi SEO berhasil diperbarui");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal memperbarui konfigurasi SEO");
    },
  });

  const updateMultiple = useMutation({
    mutationFn: async (configs: { key: string; value: string }[]) => {
      const updates = configs.map((c) => ({
        key: c.key,
        value: c.value,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("seo_config")
        .upsert(updates, { onConflict: "key" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-config"] });
      toast.success("Konfigurasi SEO berhasil diperbarui");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal memperbarui konfigurasi SEO");
    },
  });

  return { updateConfig, updateMultiple };
};
