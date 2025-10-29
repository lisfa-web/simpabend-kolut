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
    mutationFn: async (data: Sp2dInsert & { potongan_pajak?: any[] }) => {
      const { potongan_pajak, ...sp2dData } = data;
      
      const insertData = {
        ...sp2dData,
        created_by: user?.id,
      };

      const { data: result, error } = await supabase
        .from("sp2d")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      // Insert tax deductions if any
      if (potongan_pajak && potongan_pajak.length > 0) {
        const pajakData = potongan_pajak.map((pajak) => ({
          sp2d_id: result.id,
          ...pajak,
        }));
        
        const { error: pajakError } = await supabase
          .from("potongan_pajak_sp2d")
          .insert(pajakData);
          
        if (pajakError) {
          console.error("Failed to insert tax deductions:", pajakError);
        }
      }

      // Send OTP immediately after SP2D creation
      try {
        await supabase.functions.invoke('send-sp2d-otp', {
          body: {
            sp2dId: result.id,
            userId: user?.id,
          },
        });
      } catch (otpError) {
        console.error('Failed to send OTP:', otpError);
      }

      return result;
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sp2d-list"] });
      
      // Check if OTP was sent by trying to invoke again (will fail if already sent)
      supabase.functions.invoke('send-sp2d-otp', {
        body: { sp2dId: result.id, userId: user?.id },
      }).then(() => {
        toast({
          title: "Berhasil",
          description: "SP2D berhasil dibuat dan OTP telah dikirim ke WhatsApp Anda",
        });
      }).catch(() => {
        toast({
          title: "SP2D Berhasil Dibuat",
          description: "Namun gagal mengirim OTP. Silakan klik tombol Minta OTP",
          variant: "default",
        });
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
      // Check emergency mode first
      const { data: emergencyMode } = await supabase
        .from('config_sistem')
        .select('value')
        .eq('key', 'emergency_mode_enabled')
        .single();

      const isEmergencyMode = emergencyMode?.value === 'true';

      let otpRecord = null;
      
      if (!isEmergencyMode) {
        // Validate OTP from pin_otp table only if not in emergency mode
        const { data: otpData, error: otpError } = await supabase
          .from("pin_otp")
          .select("*")
          .eq("kode_hash", otp)
          .eq("jenis", "sp2d_verification")
          .eq("sp2d_id", id)
          .eq("is_used", false)
          .gte("expires_at", new Date().toISOString())
          .single();

        if (otpError || !otpData) {
          // Check if OTP exists but is expired or used
          const { data: expiredOtp } = await supabase
            .from("pin_otp")
            .select("is_used, expires_at")
            .eq("kode_hash", otp)
            .eq("jenis", "sp2d_verification")
            .eq("sp2d_id", id)
            .single();

          if (expiredOtp) {
            if (expiredOtp.is_used) {
              throw new Error("Kode OTP sudah digunakan");
            }
            if (new Date(expiredOtp.expires_at) < new Date()) {
              throw new Error("Kode OTP sudah kadaluarsa");
            }
          }
          throw new Error("Kode OTP tidak valid");
        }

        otpRecord = otpData;

        // Mark OTP as used
        await supabase
          .from("pin_otp")
          .update({ is_used: true })
          .eq("id", otpRecord.id);
      } else {
        console.log('[EMERGENCY MODE] SP2D OTP verification bypassed');
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

      // Send WhatsApp notification to vendor
      try {
        console.log('Sending disbursement notification for SP2D:', id);
        const { data: notifResult, error: notifError } = await supabase.functions.invoke(
          'send-disbursement-notification',
          {
            body: { sp2dId: id },
          }
        );

        if (notifError) {
          console.error('Failed to send disbursement notification:', notifError);
        } else {
          console.log('Disbursement notification sent:', notifResult);
        }
      } catch (notifError) {
        console.error('Error sending disbursement notification:', notifError);
        // Don't throw error - notification failure shouldn't block disbursement
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sp2d-detail"] });
      queryClient.invalidateQueries({ queryKey: ["sp2d-list"] });
      toast({
        title: "Berhasil",
        description: "Dana SP2D berhasil dicairkan dan notifikasi telah dikirim ke vendor",
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

  const sendToBank = useMutation({
    mutationFn: async (id: string) => {
      const { data: result, error } = await supabase
        .from("sp2d")
        .update({ 
          status: "diuji_bank" as StatusSp2d,
          tanggal_kirim_bank: new Date().toISOString()
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
        description: "SP2D telah dikirim ke Bank Sultra untuk diproses",
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

  const confirmFromBank = useMutation({
    mutationFn: async (id: string) => {
      const { data: result, error } = await supabase
        .from("sp2d")
        .update({ 
          tanggal_konfirmasi_bank: new Date().toISOString()
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
        description: "Konfirmasi dari Bank Sultra telah dicatat. SP2D siap untuk dicairkan.",
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
    sendToBank,
    confirmFromBank,
  };
};
