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
      const { error } = await supabase.from("kegiatan").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kegiatan-list"] });
      toast.success("Kegiatan berhasil dihapus");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal menghapus kegiatan");
    },
  });

  return { createKegiatan, updateKegiatan, deleteKegiatan };
};
