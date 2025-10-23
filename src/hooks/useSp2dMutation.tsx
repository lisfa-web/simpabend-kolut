import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type Sp2dInsert = Database["public"]["Tables"]["sp2d"]["Insert"];
type Sp2dUpdate = Database["public"]["Tables"]["sp2d"]["Update"];

export const useSp2dMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createSp2d = useMutation({
    mutationFn: async (data: Sp2dInsert) => {
      const { data: result, error } = await supabase
        .from("sp2d")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
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
      // Here you would typically validate the OTP against pin_otp table
      // For now, we'll just update the otp_verified_at timestamp
      const { data: result, error } = await supabase
        .from("sp2d")
        .update({ 
          otp_verified_at: new Date().toISOString(),
          status: "diterbitkan" as any
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
          status: "cair" as any,
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
