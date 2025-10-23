import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTestEmail = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase.functions.invoke("test-email", {
        body: { email },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Test email berhasil! Email terkirim ke " + data.email);
      } else {
        toast.error(data.message || "Test email gagal");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal melakukan test email");
    },
  });
};
