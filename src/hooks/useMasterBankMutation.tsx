import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MasterBankData {
  kode_bank: string;
  nama_bank: string;
  is_active?: boolean;
}

export const useMasterBankMutation = () => {
  const queryClient = useQueryClient();

  const createBank = useMutation({
    mutationFn: async (data: MasterBankData) => {
      const { error } = await supabase.from("master_bank").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-bank-list"] });
      toast.success("Bank berhasil dibuat");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal membuat bank");
    },
  });

  const updateBank = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: MasterBankData }) => {
      const { error } = await supabase.from("master_bank").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-bank-list"] });
      toast.success("Bank berhasil diupdate");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal mengupdate bank");
    },
  });

  const deleteBank = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("master_bank").update({ is_active: false }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-bank-list"] });
      toast.success("Bank berhasil dinonaktifkan");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal menonaktifkan bank");
    },
  });

  const activateBank = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("master_bank").update({ is_active: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-bank-list"] });
      toast.success("Bank berhasil diaktifkan");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal mengaktifkan bank");
    },
  });

  return {
    createBank,
    updateBank,
    deleteBank,
    activateBank,
  };
};
