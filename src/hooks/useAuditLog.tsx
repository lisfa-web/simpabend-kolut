import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface AuditLogFilters {
  tanggal_dari?: string;
  tanggal_sampai?: string;
  user_id?: string;
  action?: string;
  resource?: string;
  search?: string;
}

export const useAuditLog = (filters?: AuditLogFilters) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["audit-log", user?.id, filters],
    queryFn: async () => {
      if (!user?.id) return [];

      try {
        let query = supabase
          .from("audit_log")
            .select(`
              *,
              user:profiles!audit_log_user_id_fkey(full_name, email)
            `)
            .order("created_at", { ascending: false });

        // Apply filters
        if (filters?.tanggal_dari) {
          query = query.gte("created_at", filters.tanggal_dari);
        }

        if (filters?.tanggal_sampai) {
          query = query.lte("created_at", filters.tanggal_sampai);
        }

        if (filters?.user_id && filters.user_id !== "all") {
          query = query.eq("user_id", filters.user_id);
        }

        if (filters?.action && filters.action !== "all") {
          query = query.eq("action", filters.action);
        }

        if (filters?.resource && filters.resource !== "all") {
          query = query.eq("resource", filters.resource);
        }

        if (filters?.search) {
          query = query.or(
            `resource_id.ilike.%${filters.search}%`
          );
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching audit log:", error);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error("Error in useAuditLog:", error);
        return [];
      }
    },
    enabled: !!user?.id,
  });
};
