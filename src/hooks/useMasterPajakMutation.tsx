import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { MasterPajak } from "./useMasterPajakList";

export const useMasterPajakMutation = () => {
  const queryClient = useQueryClient();

  const createPajak = useMutation({
    mutationFn: async (pajak: Omit<MasterPajak, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("master_pajak")
        .insert([pajak])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-pajak"] });
      toast.success("Master pajak berhasil ditambahkan");
    },
    onError: (error: any) => {
      toast.error(`Gagal menambahkan master pajak: ${error.message}`);
    },
  });

  const updatePajak = useMutation({
    mutationFn: async ({ id, ...pajak }: Partial<MasterPajak> & { id: string }) => {
      const { data, error } = await supabase
        .from("master_pajak")
        .update(pajak)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-pajak"] });
      toast.success("Master pajak berhasil diupdate");
    },
    onError: (error: any) => {
      toast.error(`Gagal mengupdate master pajak: ${error.message}`);
    },
  });

  const deletePajak = useMutation({
    mutationFn: async (id: string) => {
      // Check dependencies first
      const { data: deps } = await supabase.rpc("check_pajak_dependencies", {
        pajak_id_param: id,
      });

      if (deps && !deps.can_deactivate) {
        throw new Error(
          `Pajak tidak dapat dihapus karena masih digunakan di ${deps.spm_count} SPM dan ${deps.sp2d_count} SP2D`
        );
      }

      const { error } = await supabase
        .from("master_pajak")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-pajak"] });
      toast.success("Master pajak berhasil dihapus");
    },
    onError: (error: any) => {
      toast.error(`Gagal menghapus master pajak: ${error.message}`);
    },
  });

  return {
    createPajak,
    updatePajak,
    deletePajak,
  };
};
