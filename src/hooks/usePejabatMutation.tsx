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
      const { error } = await supabase.from("pejabat").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pejabat"] });
      toast({
        title: "Berhasil",
        description: "Data pejabat berhasil dihapus",
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
    uploadSignature,
  };
};
