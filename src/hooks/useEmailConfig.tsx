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
        .single();

      if (error && error.code !== "PGRST116") throw error;
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
      const { data: existing } = await supabase
        .from("email_config")
        .select("id")
        .single();

      if (existing?.id) {
        const { error } = await supabase
          .from("email_config")
          .update(config)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("email_config").insert(config);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-config"] });
      toast.success("Konfigurasi email berhasil disimpan");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal menyimpan konfigurasi email");
    },
  });

  return { upsertConfig };
};
