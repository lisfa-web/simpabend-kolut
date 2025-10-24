import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTestWaGateway = () => {
  return useMutation({
    mutationFn: async (phone: string) => {
      const { data, error } = await supabase.functions.invoke("test-wa-gateway", {
        body: { phone },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Gagal memanggil fungsi test");
      }

      // Check if response indicates failure
      if (data && !data.success) {
        throw new Error(data.message || "Test koneksi gagal");
      }

      return data;
    },
    onSuccess: (data) => {
      if (data?.success) {
        toast.success(data.message || "Test koneksi WhatsApp berhasil! Pesan terkirim.");
      }
    },
    onError: (error: any) => {
      console.error("Test WA Gateway error:", error);
      toast.error(error.message || "Gagal melakukan test koneksi");
    },
  });
};
