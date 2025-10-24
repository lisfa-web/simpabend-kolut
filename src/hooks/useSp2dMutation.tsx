import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";
import { Database } from "@/integrations/supabase/types";

type Sp2dInsert = Database["public"]["Tables"]["sp2d"]["Insert"];
type Sp2dUpdate = Database["public"]["Tables"]["sp2d"]["Update"];
type StatusSp2d = Database["public"]["Enums"]["status_sp2d"];

export const useSp2dMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const createSp2d = useMutation({
    mutationFn: async (data: Sp2dInsert) => {
      // Add created_by field
      const insertData = {
        ...data,
        created_by: user?.id,
      };

      const { data: result, error } = await supabase
        .from("sp2d")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      // Send notification
      try {
        await supabase.functions.invoke('send-workflow-notification', {
          body: {
            type: 'sp2d',
            documentId: result.id,
            action: 'created',
          },
        });
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sp2d-list"] });
      toast({
        title: "Berhasil",
        description: "SP2D berhasil dibuat",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSp2d = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Sp2dUpdate }) => {
      const { data: result, error } = await supabase
        .from("sp2d")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Send notification if status changed to gagal (rejected)
      if (data.status === 'gagal') {
        try {
          await supabase.functions.invoke('send-workflow-notification', {
            body: {
              type: 'sp2d',
              documentId: id,
              action: 'rejected',
              notes: data.catatan || '',
            },
          });
        } catch (notifError) {
          console.error('Failed to send notification:', notifError);
        }
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sp2d-list"] });
      queryClient.invalidateQueries({ queryKey: ["sp2d-detail"] });
      toast({
        title: "Berhasil",
        description: "SP2D berhasil diupdate",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verifyOtp = useMutation({
    mutationFn: async ({ id, otp }: { id: string; otp: string }) => {
      // Check if in test mode
      const { data: testModeConfig } = await supabase
        .from("config_sistem")
        .select("value")
        .eq("key", "otp_test_mode")
        .single();

      const isTestMode = testModeConfig?.value === "true";
      let isValidOtp = false;
      let validOtpCode = "123456";

      if (isTestMode) {
        // Get static OTP from config
        const { data: testOtpConfig } = await supabase
          .from("config_sistem")
          .select("value")
          .eq("key", "otp_test_code")
          .single();
        
        validOtpCode = testOtpConfig?.value || "123456";
        isValidOtp = otp === validOtpCode;
      } else {
        // Production: validate against pin_otp table
        const { data: otpRecord } = await supabase
          .from("pin_otp")
          .select("*")
          .eq("kode_hash", otp)
          .eq("sp2d_id", id)
          .eq("is_used", false)
          .gte("expires_at", new Date().toISOString())
          .single();
        
        isValidOtp = !!otpRecord;
        
        if (isValidOtp && otpRecord) {
          // Mark OTP as used
          await supabase
            .from("pin_otp")
            .update({ is_used: true })
            .eq("id", otpRecord.id);
        }
      }

      if (!isValidOtp) {
        throw new Error(
          isTestMode 
            ? `Kode OTP tidak valid. Untuk testing, gunakan: ${validOtpCode}` 
            : "Kode OTP tidak valid atau sudah kadaluarsa"
        );
      }

      const { data: result, error } = await supabase
        .from("sp2d")
        .update({ 
          otp_verified_at: new Date().toISOString(),
          status: "diterbitkan" as StatusSp2d,
          verified_by: user?.id,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Send notification
      try {
        await supabase.functions.invoke('send-workflow-notification', {
          body: {
            type: 'sp2d',
            documentId: id,
            action: 'approved',
          },
        });
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sp2d-detail"] });
      queryClient.invalidateQueries({ queryKey: ["sp2d-list"] });
      toast({
        title: "Berhasil",
        description: "OTP berhasil diverifikasi",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const disburseSp2d = useMutation({
    mutationFn: async (id: string) => {
      const { data: result, error } = await supabase
        .from("sp2d")
        .update({ 
          status: "cair" as StatusSp2d,
          tanggal_cair: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sp2d-detail"] });
      queryClient.invalidateQueries({ queryKey: ["sp2d-list"] });
      toast({
        title: "Berhasil",
        description: "Dana SP2D berhasil dicairkan",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    createSp2d,
    updateSp2d,
    verifyOtp,
    disburseSp2d,
  };
};
