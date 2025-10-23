import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProgramData {
  kode_program: string;
  nama_program: string;
  tahun_anggaran: number;
  is_active?: boolean;
}

export const useProgramMutation = () => {
  const queryClient = useQueryClient();

  const createProgram = useMutation({
    mutationFn: async (data: ProgramData) => {
      const { error } = await supabase.from("program").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program-list"] });
      toast.success("Program berhasil dibuat");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal membuat program");
    },
  });

  const updateProgram = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProgramData }) => {
      const { error } = await supabase.from("program").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program-list"] });
      toast.success("Program berhasil diupdate");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal mengupdate program");
    },
  });

  const deleteProgram = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("program").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program-list"] });
      toast.success("Program berhasil dihapus");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal menghapus program");
    },
  });

  return { createProgram, updateProgram, deleteProgram };
};
