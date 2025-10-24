import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmergencyModeStatus {
  enabled: boolean;
  activatedAt: string | null;
  activatedBy: string | null;
  reason: string | null;
}

export const useEmergencyMode = () => {
  return useQuery({
    queryKey: ["emergency-mode"],
    queryFn: async (): Promise<EmergencyModeStatus> => {
      const { data, error } = await supabase
        .from("config_sistem")
        .select("key, value")
        .in("key", [
          "emergency_mode_enabled",
          "emergency_mode_activated_at",
          "emergency_mode_activated_by",
          "emergency_mode_reason",
        ]);

      if (error) throw error;

      const config = data.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {} as Record<string, string>);

      return {
        enabled: config.emergency_mode_enabled === "true",
        activatedAt: config.emergency_mode_activated_at || null,
        activatedBy: config.emergency_mode_activated_by || null,
        reason: config.emergency_mode_reason || null,
      };
    },
  });
};

export const useToggleEmergencyMode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ enabled, reason }: { enabled: boolean; reason: string }) => {
      const { data, error } = await supabase.functions.invoke("toggle-emergency-mode", {
        body: { enabled, reason },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["emergency-mode"] });
      queryClient.invalidateQueries({ queryKey: ["config-sistem"] });
      
      toast.success(
        data.enabled 
          ? "Mode emergency berhasil diaktifkan" 
          : "Mode emergency berhasil dinonaktifkan"
      );
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal mengubah status emergency mode");
    },
  });
};
