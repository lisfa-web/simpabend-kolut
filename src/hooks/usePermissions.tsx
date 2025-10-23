import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface PermissionFilters {
  role?: AppRole;
}

export const usePermissions = (filters?: PermissionFilters) => {
  return useQuery({
    queryKey: ["permissions", filters],
    queryFn: async () => {
      let query = supabase.from("permissions").select("*").order("resource");

      if (filters?.role) {
        query = query.eq("role", filters.role);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const usePermissionsMutation = () => {
  const queryClient = useQueryClient();

  const updatePermissions = useMutation({
    mutationFn: async (
      updates: Array<{
        id: string;
        can_read?: boolean;
        can_create?: boolean;
        can_update?: boolean;
        can_delete?: boolean;
      }>
    ) => {
      const promises = updates.map((update) =>
        supabase.from("permissions").update(update).eq("id", update.id)
      );

      const results = await Promise.all(promises);
      const errors = results.filter((r) => r.error);
      if (errors.length > 0) throw errors[0].error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("Permissions berhasil diperbarui");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal memperbarui permissions");
    },
  });

  return { updatePermissions };
};
