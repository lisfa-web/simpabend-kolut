import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type BendaharaPengeluaranInsert = Database["public"]["Tables"]["bendahara_pengeluaran"]["Insert"];
type BendaharaPengeluaranUpdate = Database["public"]["Tables"]["bendahara_pengeluaran"]["Update"];

export const useBendaharaPengeluaranMutation = () => {
  const queryClient = useQueryClient();

  const createBendaharaPengeluaran = useMutation({
    mutationFn: async (data: BendaharaPengeluaranInsert) => {
      const { data: result, error } = await supabase
        .from("bendahara_pengeluaran")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bendahara-pengeluaran-list"] });
    },
  });

  const updateBendaharaPengeluaran = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BendaharaPengeluaranUpdate }) => {
      const { data: result, error } = await supabase
        .from("bendahara_pengeluaran")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bendahara-pengeluaran-list"] });
    },
  });

  const deleteBendaharaPengeluaran = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("bendahara_pengeluaran")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bendahara-pengeluaran-list"] });
    },
  });

  return {
    createBendaharaPengeluaran,
    updateBendaharaPengeluaran,
    deleteBendaharaPengeluaran,
  };
};
