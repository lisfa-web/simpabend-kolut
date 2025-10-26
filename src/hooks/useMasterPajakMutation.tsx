import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { MasterPajak } from "./useMasterPajakList";

type CreatePajakInput = Omit<MasterPajak, "id" | "created_at" | "updated_at">;
type UpdatePajakInput = Partial<CreatePajakInput>;

export const useMasterPajakMutation = () => {
  const queryClient = useQueryClient();

  const createPajak = useMutation({
    mutationFn: async (data: CreatePajakInput) => {
      const { data: result, error } = await (supabase as any)
        .from("master_pajak")
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-pajak"] });
      toast.success("Master pajak berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(`Gagal menambahkan master pajak: ${error.message}`);
    },
  });

  const updatePajak = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePajakInput }) => {
      const { data: result, error } = await (supabase as any)
        .from("master_pajak")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-pajak"] });
      toast.success("Master pajak berhasil diperbarui");
    },
    onError: (error) => {
      toast.error(`Gagal memperbarui master pajak: ${error.message}`);
    },
  });

  const deletePajak = useMutation({
    mutationFn: async (id: string) => {
      // Check dependencies first
      const { data: deps, error: depsError } = await (supabase as any)
        .rpc("check_pajak_dependencies", { pajak_id_param: id });
      
      if (depsError) throw depsError;
      
      const dependencies = deps as any;
      if (!dependencies.can_deactivate) {
        throw new Error(
          `Tidak dapat menghapus pajak ini karena masih digunakan di ${dependencies.spm_count || 0} SPM dan ${dependencies.sp2d_count || 0} SP2D`
        );
      }

      const { error } = await (supabase as any)
        .from("master_pajak")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-pajak"] });
      toast.success("Master pajak berhasil dihapus");
    },
    onError: (error) => {
      toast.error(`Gagal menghapus master pajak: ${error.message}`);
    },
  });

  return {
    createPajak,
    updatePajak,
    deletePajak,
  };
};
