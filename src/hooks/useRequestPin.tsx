import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RequestPinData {
  userId: string;
  spmId?: string;
}

export const useRequestPin = () => {
  return useMutation({
    mutationFn: async (data: RequestPinData) => {
      const { data: result, error } = await supabase.functions.invoke("send-pin", {
        body: {
          userId: data.userId,
          spmId: data.spmId,
        },
      });

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      console.log("PIN sent:", data);
      toast.success("PIN telah dikirim via Email & WhatsApp");
    },
    onError: (error: any) => {
      console.error("Request PIN error:", error);
      toast.error(error.message || "Gagal mengirim PIN");
    },
  });
};
