import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useWaGateway = () => {
  return useQuery({
    queryKey: ["wa-gateway"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wa_gateway")
        .select("*")
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });
};

export const useWaGatewayMutation = () => {
  const queryClient = useQueryClient();

  const upsertGateway = useMutation({
    mutationFn: async (data: {
      api_key: string;
      sender_id: string;
      is_active: boolean;
    }) => {
      // Check if config already exists
      const { data: existing } = await supabase
        .from("wa_gateway")
        .select("id")
        .limit(1)
        .single();

      if (existing?.id) {
        // Update existing config
        const { error } = await supabase
          .from("wa_gateway")
          .update({
            api_key: data.api_key,
            sender_id: data.sender_id,
            is_active: data.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        
        if (error) throw error;
      } else {
        // Insert new config
        const { error } = await supabase
          .from("wa_gateway")
          .insert(data);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wa-gateway"] });
      toast.success("Konfigurasi WhatsApp Gateway berhasil disimpan");
    },
    onError: (error: any) => {
      console.error("Save WA Gateway error:", error);
      toast.error(error.message || "Gagal menyimpan konfigurasi");
    },
  });

  return { upsertGateway };
};
