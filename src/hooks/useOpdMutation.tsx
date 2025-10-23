import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OpdData {
  kode_opd: string;
  nama_opd: string;
  alamat?: string;
  telepon?: string;
  email?: string;
  is_active?: boolean;
}

export const useOpdMutation = () => {
  const queryClient = useQueryClient();

  const createOpd = useMutation({
    mutationFn: async (data: OpdData) => {
      const { error } = await supabase.from("opd").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opd-list"] });
      toast.success("OPD berhasil dibuat");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal membuat OPD");
    },
  });

  const updateOpd = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: OpdData }) => {
      const { error } = await supabase.from("opd").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opd-list"] });
      toast.success("OPD berhasil diupdate");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal mengupdate OPD");
    },
  });

  const deleteOpd = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("opd").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opd-list"] });
      toast.success("OPD berhasil dihapus");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal menghapus OPD");
    },
  });

  return { createOpd, updateOpd, deleteOpd };
};
