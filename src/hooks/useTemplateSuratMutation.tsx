import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface TemplateSuratData {
  nama_template: string;
  jenis_surat: string;
  konten_html: string;
  kop_surat_url?: string;
  variables?: Record<string, string>;
  is_active: boolean;
}

export const useTemplateSuratMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createTemplate = useMutation({
    mutationFn: async (data: TemplateSuratData) => {
      const { data: result, error } = await supabase
        .from("template_surat")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["template_surat"] });
      toast({
        title: "Berhasil",
        description: "Template surat berhasil ditambahkan",
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

  const updateTemplate = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TemplateSuratData> }) => {
      const { data: result, error } = await supabase
        .from("template_surat")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["template_surat"] });
      toast({
        title: "Berhasil",
        description: "Template surat berhasil diperbarui",
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

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("template_surat").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["template_surat"] });
      toast({
        title: "Berhasil",
        description: "Template surat berhasil dihapus",
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

  const duplicateTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { data: original, error: fetchError } = await supabase
        .from("template_surat")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const { data: result, error } = await supabase
        .from("template_surat")
        .insert({
          nama_template: `${original.nama_template} (Copy)`,
          jenis_surat: original.jenis_surat,
          konten_html: original.konten_html,
          variables: original.variables,
          is_active: false,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["template_surat"] });
      toast({
        title: "Berhasil",
        description: "Template berhasil diduplikasi",
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

  return {
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
  };
};
