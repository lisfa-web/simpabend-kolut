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
      const { error } = await supabase.from("subkegiatan").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subkegiatan-list"] });
      toast.success("Sub Kegiatan berhasil dihapus");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal menghapus sub kegiatan");
    },
  });

  return { createSubkegiatan, updateSubkegiatan, deleteSubkegiatan };
};
