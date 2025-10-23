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
      const { error } = await supabase.from("vendor").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-list"] });
      toast.success("Vendor berhasil dihapus");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal menghapus vendor");
    },
  });

  return { createVendor, updateVendor, deleteVendor };
};
