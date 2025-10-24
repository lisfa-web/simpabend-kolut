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
      // Check dependencies first
      const { data: dependencies } = await supabase.rpc('check_program_dependencies', { program_id_param: id });
      const deps = dependencies as any;
      
      if (deps && !deps.can_deactivate) {
        const messages = [];
        if (deps.kegiatan_count > 0) messages.push(`${deps.kegiatan_count} kegiatan`);
        if (deps.spm_count > 0) messages.push(`${deps.spm_count} SPM`);
        throw new Error(`Tidak dapat menonaktifkan Program. Masih digunakan oleh: ${messages.join(', ')}`);
      }
      
      // Soft delete: set is_active to false
      const { error } = await supabase.from("program").update({ is_active: false }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program-list"] });
      toast.success("Program berhasil dinonaktifkan");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal menonaktifkan program");
    },
  });

  const activateProgram = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("program").update({ is_active: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program-list"] });
      toast.success("Program berhasil diaktifkan");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal mengaktifkan program");
    },
  });

  const permanentDeleteProgram = useMutation({
    mutationFn: async (id: string) => {
      // Check dependencies first
      const { data: depCheck } = await supabase
        .rpc("check_program_dependencies", { program_id_param: id });
      
      const deps = depCheck as any;
      if (deps && !deps.can_deactivate) {
        throw new Error(
          `Tidak dapat menghapus Program. Masih terdapat ${deps.kegiatan_count} kegiatan dan ${deps.spm_count} SPM terkait.`
        );
      }

      // HARD DELETE - actual deletion from database
      const { error } = await supabase
        .from("program")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program-list"] });
      toast.success("Program berhasil dihapus permanen dari database");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal menghapus Program");
    },
  });

  return {
    createProgram,
    updateProgram,
    deleteProgram,
    activateProgram,
    permanentDeleteProgram,
  };
};
