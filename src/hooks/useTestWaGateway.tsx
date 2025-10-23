import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTestWaGateway = () => {
  return useMutation({
    mutationFn: async (phone: string) => {
      const { data, error } = await supabase.functions.invoke("test-wa-gateway", {
        body: { phone },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Test koneksi WhatsApp berhasil! Pesan terkirim.");
      } else {
        toast.error(data.message || "Test koneksi WhatsApp gagal");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal melakukan test koneksi");
    },
  });
};
