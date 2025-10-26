import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PajakPerJenisSpmInput {
  jenis_spm: string;
  master_pajak_id: string;
  tarif_khusus?: number;
  uraian_template?: string;
  is_default: boolean;
  urutan: number;
}

export const usePajakPerJenisSpmMutation = () => {
  const queryClient = useQueryClient();

  const createMapping = useMutation({
    mutationFn: async (mapping: PajakPerJenisSpmInput) => {
      const { data, error } = await (supabase as any)
        .from("pajak_per_jenis_spm")
        .insert([mapping])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pajak-per-jenis-spm"] });
      queryClient.invalidateQueries({ queryKey: ["jenis-spm-tax-info"] });
      queryClient.invalidateQueries({ queryKey: ["suggested-taxes-spm"] });
      toast({
        title: "Berhasil",
        description: "Mapping pajak berhasil ditambahkan",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.message || "Gagal menambahkan mapping pajak",
      });
    },
  });

  const updateMapping = useMutation({
    mutationFn: async ({ id, mapping }: { id: string; mapping: PajakPerJenisSpmInput }) => {
      const { data, error } = await (supabase as any)
        .from("pajak_per_jenis_spm")
        .update(mapping)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pajak-per-jenis-spm"] });
      queryClient.invalidateQueries({ queryKey: ["jenis-spm-tax-info"] });
      queryClient.invalidateQueries({ queryKey: ["suggested-taxes-spm"] });
      toast({
        title: "Berhasil",
        description: "Mapping pajak berhasil diperbarui",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.message || "Gagal memperbarui mapping pajak",
      });
    },
  });

  const deleteMapping = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("pajak_per_jenis_spm")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pajak-per-jenis-spm"] });
      queryClient.invalidateQueries({ queryKey: ["jenis-spm-tax-info"] });
      queryClient.invalidateQueries({ queryKey: ["suggested-taxes-spm"] });
      toast({
        title: "Berhasil",
        description: "Mapping pajak berhasil dihapus",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.message || "Gagal menghapus mapping pajak",
      });
    },
  });

  const reorderMappings = useMutation({
    mutationFn: async (mappings: Array<{ id: string; urutan: number }>) => {
      const promises = mappings.map(({ id, urutan }) =>
        (supabase as any)
          .from("pajak_per_jenis_spm")
          .update({ urutan })
          .eq("id", id)
      );
      const results = await Promise.all(promises);
      const errors = results.filter((r) => r.error);
      if (errors.length > 0) throw new Error("Gagal mengubah urutan");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pajak-per-jenis-spm"] });
      queryClient.invalidateQueries({ queryKey: ["jenis-spm-tax-info"] });
      toast({
        title: "Berhasil",
        description: "Urutan mapping berhasil diperbarui",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.message || "Gagal mengubah urutan mapping",
      });
    },
  });

  return { createMapping, updateMapping, deleteMapping, reorderMappings };
};
