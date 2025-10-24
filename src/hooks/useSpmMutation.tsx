import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export const useSpmMutation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createSpm = useMutation({
    mutationFn: async (data: any) => {
      const { data: spm, error } = await supabase
        .from("spm")
        .insert({
          ...data,
          bendahara_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return spm;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spm-list"] });
      toast({
        title: "Berhasil",
        description: "SPM berhasil disimpan",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSpm = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { data: spm, error } = await supabase
        .from("spm")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Send notification if status changed to diajukan
      if (data.status === 'diajukan') {
        try {
          await supabase.functions.invoke('send-workflow-notification', {
            body: {
              type: 'spm',
              documentId: id,
              action: 'submitted',
            },
          });
        } catch (notifError) {
          console.error('Failed to send notification:', notifError);
        }
      }

      return spm;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spm-list"] });
      queryClient.invalidateQueries({ queryKey: ["spm-detail"] });
      toast({
        title: "Berhasil",
        description: "SPM berhasil diupdate",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteSpm = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("spm").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spm-list"] });
      toast({
        title: "Berhasil",
        description: "SPM berhasil dihapus",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadFile = async (
    file: File,
    spmId: string,
    jenisLampiran: string
  ) => {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${user?.id}/${spmId}/${fileName}`;

    const { data, error: uploadError } = await supabase.storage
      .from("spm-documents")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: lampiran, error: insertError } = await supabase
      .from("lampiran_spm")
      .insert([{
        spm_id: spmId,
        jenis_lampiran: jenisLampiran as any,
        nama_file: file.name,
        file_url: data.path,
        file_size: file.size,
        uploaded_by: user?.id,
      }])
      .select()
      .single();

    if (insertError) throw insertError;
    return lampiran;
  };

  const deleteFile = async (lampiranId: string, fileUrl: string) => {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("spm-documents")
      .remove([fileUrl]);

    if (storageError) throw storageError;

    // Delete from database
    const { error: dbError } = await supabase
      .from("lampiran_spm")
      .delete()
      .eq("id", lampiranId);

    if (dbError) throw dbError;
  };

  return {
    createSpm,
    updateSpm,
    deleteSpm,
    uploadFile,
    deleteFile,
  };
};
