import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OpdData {
  kode_opd: string;
  nama_opd: string;
  alamat?: string;
  telepon?: string;
  email?: string;
  is_active?: boolean;
}

export const useOpdMutation = () => {
  const queryClient = useQueryClient();

  const createOpd = useMutation({
    mutationFn: async (data: OpdData) => {
      const { error } = await supabase.from("opd").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opd-list"] });
      toast.success("OPD berhasil dibuat");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal membuat OPD");
    },
  });

  const updateOpd = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: OpdData }) => {
      const { error } = await supabase.from("opd").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opd-list"] });
      toast.success("OPD berhasil diupdate");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal mengupdate OPD");
    },
  });

  const deleteOpd = useMutation({
    mutationFn: async (id: string) => {
      // Check dependencies first
      const { data: dependencies } = await supabase.rpc('check_opd_dependencies', { opd_id_param: id });
      const deps = dependencies as any;
      
      if (deps && !deps.can_deactivate) {
        const messages = [];
        if (deps.user_count > 0) messages.push(`${deps.user_count} user`);
        if (deps.spm_count > 0) messages.push(`${deps.spm_count} SPM`);
        if (deps.pejabat_count > 0) messages.push(`${deps.pejabat_count} pejabat`);
        throw new Error(`Tidak dapat menonaktifkan OPD. Masih digunakan oleh: ${messages.join(', ')}`);
      }
      
      // Soft delete: set is_active to false
      const { error } = await supabase.from("opd").update({ is_active: false }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opd-list"] });
      toast.success("OPD berhasil dinonaktifkan");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal menonaktifkan OPD");
    },
  });

  const activateOpd = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("opd").update({ is_active: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opd-list"] });
      toast.success("OPD berhasil diaktifkan");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal mengaktifkan OPD");
    },
  });

  return { createOpd, updateOpd, deleteOpd, activateOpd };
};
