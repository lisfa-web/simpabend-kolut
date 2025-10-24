import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VendorData {
  nama_vendor: string;
  npwp?: string;
  alamat?: string;
  telepon?: string;
  email?: string;
  nama_bank?: string;
  nomor_rekening?: string;
  nama_rekening?: string;
  is_active?: boolean;
}

export const useVendorMutation = () => {
  const queryClient = useQueryClient();

  const createVendor = useMutation({
    mutationFn: async (data: VendorData) => {
      const { error } = await supabase.from("vendor").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-list"] });
      toast.success("Vendor berhasil dibuat");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal membuat vendor");
    },
  });

  const updateVendor = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: VendorData }) => {
      const { error } = await supabase.from("vendor").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-list"] });
      toast.success("Vendor berhasil diupdate");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal mengupdate vendor");
    },
  });

  const deleteVendor = useMutation({
    mutationFn: async (id: string) => {
      // Check dependencies first
      const { data: dependencies } = await supabase.rpc('check_vendor_dependencies', { vendor_id_param: id });
      const deps = dependencies as any;
      
      if (deps && !deps.can_deactivate) {
        const messages = [];
        if (deps.spm_count > 0) messages.push(`${deps.spm_count} SPM`);
        throw new Error(`Tidak dapat menonaktifkan Vendor. Masih digunakan oleh: ${messages.join(', ')}`);
      }
      
      // Soft delete: set is_active to false
      const { error } = await supabase.from("vendor").update({ is_active: false }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-list"] });
      toast.success("Vendor berhasil dinonaktifkan");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal menonaktifkan vendor");
    },
  });

  const activateVendor = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vendor").update({ is_active: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-list"] });
      toast.success("Vendor berhasil diaktifkan");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal mengaktifkan vendor");
    },
  });

  return { createVendor, updateVendor, deleteVendor, activateVendor };
};
