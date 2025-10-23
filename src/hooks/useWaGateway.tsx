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
      const { error } = await supabase.from("wa_gateway").upsert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wa-gateway"] });
      toast.success("Konfigurasi WhatsApp Gateway berhasil disimpan");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal menyimpan konfigurasi");
    },
  });

  return { upsertGateway };
};
