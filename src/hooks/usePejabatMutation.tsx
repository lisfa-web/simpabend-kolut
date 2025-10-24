import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface PejabatData {
  nip: string;
  nama_lengkap: string;
  jabatan: string;
  opd_id?: string;
  ttd_url?: string;
  is_active: boolean;
}

export const usePejabatMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createPejabat = useMutation({
    mutationFn: async (data: PejabatData) => {
      const { data: result, error } = await supabase
        .from("pejabat")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pejabat"] });
      toast({
        title: "Berhasil",
        description: "Data pejabat berhasil ditambahkan",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePejabat = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PejabatData> }) => {
      const { data: result, error } = await supabase
        .from("pejabat")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pejabat"] });
      toast({
        title: "Berhasil",
        description: "Data pejabat berhasil diperbarui",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePejabat = useMutation({
    mutationFn: async (id: string) => {
      // Check dependencies before deactivating
      const { data: dependencies, error: depsError } = await supabase
        .rpc("check_pejabat_dependencies", { pejabat_id_param: id });

      if (depsError) throw depsError;

      const deps = dependencies as any;
      if (!deps.can_deactivate) {
        throw new Error(
          `Tidak dapat menonaktifkan pejabat. Masih digunakan di: ${deps.surat_count} surat`
        );
      }

      // Soft delete (set is_active to false)
      const { error } = await supabase
        .from("pejabat")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pejabat"] });
      toast({
        title: "Berhasil",
        description: "Data pejabat berhasil dinonaktifkan",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const activatePejabat = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pejabat")
        .update({ is_active: true })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pejabat"] });
      toast({
        title: "Berhasil",
        description: "Data pejabat berhasil diaktifkan",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadSignature = useMutation({
    mutationFn: async ({ file, pejabatId }: { file: File; pejabatId: string }) => {
      const fileExt = file.name.split(".").pop();
      const fileName = `${pejabatId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("ttd-pejabat")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("ttd-pejabat")
        .getPublicUrl(filePath);

      return publicUrl;
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal upload",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    createPejabat,
    updatePejabat,
    deletePejabat,
    activatePejabat,
    uploadSignature,
  };
};
