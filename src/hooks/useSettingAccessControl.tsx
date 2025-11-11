import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSettingAccessControl = () => {
  return useQuery({
    queryKey: ["setting-access-control"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("setting_access_control")
        .select("*")
        .order("setting_title");

      if (error) throw error;
      return data;
    },
  });
};

export const useSettingAccessControlMutation = () => {
  const queryClient = useQueryClient();

  const updateAccessControl = useMutation({
    mutationFn: async ({ 
      setting_key, 
      superadmin_only 
    }: { 
      setting_key: string; 
      superadmin_only: boolean 
    }) => {
      const { error } = await supabase
        .from("setting_access_control")
        .update({ 
          superadmin_only,
          updated_at: new Date().toISOString()
        })
        .eq("setting_key", setting_key);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["setting-access-control"] });
      toast.success("Kontrol akses berhasil diperbarui");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal memperbarui kontrol akses");
    },
  });

  return { updateAccessControl };
};
