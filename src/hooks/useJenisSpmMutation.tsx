import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useJenisSpmMutation = () => {
  const queryClient = useQueryClient();

  const createJenisSpm = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from("jenis_spm")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jenis-spm-list"] });
      toast.success("Jenis SPM berhasil ditambahkan");
    },
    onError: (error) => {
      console.error("Error creating jenis SPM:", error);
      toast.error("Gagal menambahkan jenis SPM");
    },
  });

  const updateJenisSpm = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { data: result, error } = await supabase
        .from("jenis_spm")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jenis-spm-list"] });
      queryClient.invalidateQueries({ queryKey: ["jenis-spm"] });
      toast.success("Jenis SPM berhasil diperbarui");
    },
    onError: (error) => {
      console.error("Error updating jenis SPM:", error);
      toast.error("Gagal memperbarui jenis SPM");
    },
  });

  const deleteJenisSpm = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("jenis_spm")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jenis-spm-list"] });
      toast.success("Jenis SPM berhasil dihapus");
    },
    onError: (error) => {
      console.error("Error deleting jenis SPM:", error);
      toast.error("Gagal menghapus jenis SPM");
    },
  });

  return {
    createJenisSpm,
    updateJenisSpm,
    deleteJenisSpm,
  };
};
