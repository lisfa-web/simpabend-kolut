import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface KegiatanData {
  kode_kegiatan: string;
  nama_kegiatan: string;
  program_id: string;
  is_active?: boolean;
}

export const useKegiatanMutation = () => {
  const queryClient = useQueryClient();

  const createKegiatan = useMutation({
    mutationFn: async (data: KegiatanData) => {
      const { error } = await supabase.from("kegiatan").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kegiatan-list"] });
      toast.success("Kegiatan berhasil dibuat");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal membuat kegiatan");
    },
  });

  const updateKegiatan = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: KegiatanData }) => {
      const { error } = await supabase.from("kegiatan").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kegiatan-list"] });
      toast.success("Kegiatan berhasil diupdate");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal mengupdate kegiatan");
    },
  });

  const deleteKegiatan = useMutation({
    mutationFn: async (id: string) => {
      // Check dependencies first
      const { data: dependencies } = await supabase.rpc('check_kegiatan_dependencies', { kegiatan_id_param: id });
      const deps = dependencies as any;
      
      if (deps && !deps.can_deactivate) {
        const messages = [];
        if (deps.subkegiatan_count > 0) messages.push(`${deps.subkegiatan_count} sub kegiatan`);
        if (deps.spm_count > 0) messages.push(`${deps.spm_count} SPM`);
        throw new Error(`Tidak dapat menonaktifkan Kegiatan. Masih digunakan oleh: ${messages.join(', ')}`);
      }
      
      // Soft delete: set is_active to false
      const { error } = await supabase.from("kegiatan").update({ is_active: false }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kegiatan-list"] });
      toast.success("Kegiatan berhasil dinonaktifkan");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal menonaktifkan kegiatan");
    },
  });

  const activateKegiatan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("kegiatan").update({ is_active: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kegiatan-list"] });
      toast.success("Kegiatan berhasil diaktifkan");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal mengaktifkan kegiatan");
    },
  });

  return { createKegiatan, updateKegiatan, deleteKegiatan, activateKegiatan };
};
