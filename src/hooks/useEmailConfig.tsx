import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useEmailConfig = () => {
  return useQuery({
    queryKey: ["email-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_config")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
};

export const useEmailConfigMutation = () => {
  const queryClient = useQueryClient();

  const upsertConfig = useMutation({
    mutationFn: async (config: {
      smtp_host: string;
      smtp_port: number;
      smtp_user: string;
      smtp_password: string;
      from_email: string;
      from_name: string;
      is_active: boolean;
    }) => {
      // Check if config already exists
      const { data: existing } = await supabase
        .from("email_config")
        .select("id")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        // Update existing config
        const { error } = await supabase
          .from("email_config")
          .update({
            ...config,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        // Insert new config
        const { error } = await supabase.from("email_config").insert(config);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-config"] });
      toast.success("Konfigurasi email berhasil disimpan");
    },
    onError: (error: any) => {
      console.error("Save email config error:", error);
      toast.error(error.message || "Gagal menyimpan konfigurasi email");
    },
  });

  return { upsertConfig };
};
