import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useFormatNomor = () => {
  return useQuery({
    queryKey: ["format-nomor"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("format_nomor")
        .select("*")
        .order("jenis_dokumen");

      if (error) throw error;
      return data;
    },
  });
};

export const useFormatNomorDetail = (id: string) => {
  return useQuery({
    queryKey: ["format-nomor", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("format_nomor")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useFormatNomorMutation = () => {
  const queryClient = useQueryClient();

  const updateFormat = useMutation({
    mutationFn: async ({ id, format, counter }: { id: string; format: string; counter?: number }) => {
      const updateData: any = { format };
      if (counter !== undefined) {
        updateData.counter = counter;
      }
      
      const { error } = await supabase
        .from("format_nomor")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["format-nomor"] });
      toast.success("Format nomor berhasil diperbarui");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal memperbarui format nomor");
    },
  });

  const resetCounter = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("format_nomor")
        .update({ counter: 0 })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["format-nomor"] });
      toast.success("Counter berhasil direset");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal mereset counter");
    },
  });

  return { updateFormat, resetCounter };
};
