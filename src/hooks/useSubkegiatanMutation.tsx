import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubkegiatanData {
  kode_subkegiatan: string;
  nama_subkegiatan: string;
  kegiatan_id: string;
  is_active?: boolean;
}

export const useSubkegiatanMutation = () => {
  const queryClient = useQueryClient();

  const createSubkegiatan = useMutation({
    mutationFn: async (data: SubkegiatanData) => {
      const { error } = await supabase.from("subkegiatan").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subkegiatan-list"] });
      toast.success("Sub Kegiatan berhasil dibuat");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal membuat sub kegiatan");
    },
  });

  const updateSubkegiatan = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SubkegiatanData }) => {
      const { error } = await supabase
        .from("subkegiatan")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subkegiatan-list"] });
      toast.success("Sub Kegiatan berhasil diupdate");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal mengupdate sub kegiatan");
    },
  });

  const deleteSubkegiatan = useMutation({
    mutationFn: async (id: string) => {
      // Check dependencies first
      const { data: dependencies } = await supabase.rpc('check_subkegiatan_dependencies', { subkegiatan_id_param: id });
      const deps = dependencies as any;
      
      if (deps && !deps.can_deactivate) {
        const messages = [];
        if (deps.spm_count > 0) messages.push(`${deps.spm_count} SPM`);
        throw new Error(`Tidak dapat menonaktifkan Sub Kegiatan. Masih digunakan oleh: ${messages.join(', ')}`);
      }
      
      // Soft delete: set is_active to false
      const { error } = await supabase
        .from("subkegiatan")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subkegiatan-list"] });
      toast.success("Sub Kegiatan berhasil dinonaktifkan");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal menonaktifkan sub kegiatan");
    },
  });

  const activateSubkegiatan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("subkegiatan")
        .update({ is_active: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subkegiatan-list"] });
      toast.success("Sub Kegiatan berhasil diaktifkan");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal mengaktifkan sub kegiatan");
    },
  });

  return { createSubkegiatan, updateSubkegiatan, deleteSubkegiatan, activateSubkegiatan };
};
