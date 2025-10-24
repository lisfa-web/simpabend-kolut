import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export const usePanduanManual = () => {
  const { roles } = useAuth();
  const queryClient = useQueryClient();

  // Fetch panduan untuk role user saat ini
  const { data: panduanList = [], isLoading } = useQuery({
    queryKey: ["panduan_manual", roles],
    queryFn: async () => {
      // Get panduan untuk semua role user
      const { data, error } = await supabase
        .from("panduan_manual")
        .select("*")
        .in("role", roles)
        .eq("is_active", true)
        .order("urutan", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: roles.length > 0,
  });

  // Fetch semua panduan (untuk admin edit)
  const { data: allPanduan = [] } = useQuery({
    queryKey: ["panduan_manual_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("panduan_manual")
        .select("*")
        .order("role", { ascending: true })
        .order("urutan", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Create/Update panduan
  const saveMutation = useMutation({
    mutationFn: async (panduan: any) => {
      if (panduan.id) {
        const { error } = await supabase
          .from("panduan_manual")
          .update({ ...panduan, updated_at: new Date().toISOString() })
          .eq("id", panduan.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("panduan_manual")
          .insert(panduan);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["panduan_manual"] });
      queryClient.invalidateQueries({ queryKey: ["panduan_manual_all"] });
      toast.success("Panduan berhasil disimpan");
    },
    onError: () => {
      toast.error("Gagal menyimpan panduan");
    },
  });

  // Delete panduan
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("panduan_manual")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["panduan_manual"] });
      queryClient.invalidateQueries({ queryKey: ["panduan_manual_all"] });
      toast.success("Panduan berhasil dihapus");
    },
  });

  return {
    panduanList,
    allPanduan,
    isLoading,
    savePanduan: saveMutation.mutate,
    deletePanduan: deleteMutation.mutate,
    isSaving: saveMutation.isPending,
  };
};
