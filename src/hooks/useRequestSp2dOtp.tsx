import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RequestSp2dOtpParams {
  sp2dId: string;
  userId: string;
}

export const useRequestSp2dOtp = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ sp2dId, userId }: RequestSp2dOtpParams) => {
      const { data, error } = await supabase.functions.invoke('send-sp2d-otp', {
        body: { sp2dId, userId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Kode OTP telah dikirim ke WhatsApp Anda",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal Mengirim OTP",
        description: error.message || "Terjadi kesalahan saat mengirim OTP",
        variant: "destructive",
      });
    },
  });
};
