import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type PihakKetigaInsert = Database["public"]["Tables"]["pihak_ketiga"]["Insert"];
type PihakKetigaUpdate = Database["public"]["Tables"]["pihak_ketiga"]["Update"];

export const usePihakKetigaMutation = () => {
  const queryClient = useQueryClient();

  const createPihakKetiga = useMutation({
    mutationFn: async (data: PihakKetigaInsert) => {
      // Check for duplicate
      const { data: existing } = await supabase
        .from("pihak_ketiga")
        .select("id")
        .ilike("nama_pihak_ketiga", data.nama_pihak_ketiga)
        .single();
      
      if (existing) {
        throw new Error("Pihak ketiga dengan nama tersebut sudah ada");
      }

      const { data: result, error } = await supabase
        .from("pihak_ketiga")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pihak-ketiga-list"] });
    },
  });

  const updatePihakKetiga = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PihakKetigaUpdate }) => {
      const { data: result, error } = await supabase
        .from("pihak_ketiga")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pihak-ketiga-list"] });
    },
  });

  const deletePihakKetiga = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pihak_ketiga")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pihak-ketiga-list"] });
    },
  });

  return {
    createPihakKetiga,
    updatePihakKetiga,
    deletePihakKetiga,
  };
};
