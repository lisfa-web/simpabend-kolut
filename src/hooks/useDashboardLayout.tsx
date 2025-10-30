import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "react-grid-layout";
import type { Database } from "@/integrations/supabase/types";

export interface DashboardLayoutConfig {
  layouts: Layout[];
  hiddenWidgets: string[];
}

const DEFAULT_LAYOUT: Layout[] = [
  { i: "stats", x: 0, y: 0, w: 12, h: 2, minW: 6, minH: 2 },
  { i: "quick-actions", x: 0, y: 2, w: 12, h: 1, minW: 6, minH: 1 },
  { i: "performance", x: 0, y: 3, w: 4, h: 3, minW: 3, minH: 2 },
  { i: "charts", x: 4, y: 3, w: 8, h: 3, minW: 4, minH: 2 },
  { i: "analytics", x: 0, y: 6, w: 12, h: 3, minW: 6, minH: 2 },
  { i: "financial", x: 0, y: 9, w: 6, h: 3, minW: 4, minH: 2 },
  { i: "activity", x: 6, y: 9, w: 6, h: 3, minW: 4, minH: 2 },
  { i: "sp2d-activity", x: 0, y: 12, w: 6, h: 3, minW: 4, minH: 2 },
  { i: "sp2d-stats", x: 6, y: 12, w: 6, h: 2, minW: 6, minH: 2 },
  { i: "opd-breakdown", x: 0, y: 15, w: 6, h: 3, minW: 4, minH: 2 },
  { i: "vendors", x: 6, y: 15, w: 6, h: 3, minW: 4, minH: 2 },
  { i: "alerts", x: 0, y: 18, w: 6, h: 2, minW: 4, minH: 2 },
  { i: "action-items", x: 6, y: 18, w: 6, h: 2, minW: 4, minH: 2 },
  { i: "spm-sp2d-table", x: 0, y: 20, w: 12, h: 8, minW: 8, minH: 6 },
  { i: "spm-status-distribution", x: 0, y: 28, w: 6, h: 4, minW: 4, minH: 3 },
];

export const useDashboardLayout = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentLayout, setCurrentLayout] = useState<Layout[]>(DEFAULT_LAYOUT);
  const [hiddenWidgets, setHiddenWidgets] = useState<string[]>([]);

  // Fetch saved layout
  const { data: savedLayout, isLoading } = useQuery({
    queryKey: ["dashboard-layout"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Try to get user's own layout
      const { data: userLayout, error: userError } = await supabase
        .from("dashboard_layout")
        .select("*")
        .eq("user_id", user.id)
        .single();

      // If user has their own layout, return it
      if (userLayout && !userError) {
        return userLayout;
      }

      // If user doesn't have layout, try to get superadmin's layout as default
      // First, get superadmin user_id
      const { data: superAdminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "super_admin")
        .limit(1)
        .single();

      if (superAdminRoles?.user_id) {
        const { data: superAdminLayout } = await supabase
          .from("dashboard_layout")
          .select("*")
          .eq("user_id", superAdminRoles.user_id)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (superAdminLayout) {
          return superAdminLayout;
        }
      }

      // If no layouts found, return null (will use DEFAULT_LAYOUT)
      return null;
    },
  });

  // Load saved layout when available
  useEffect(() => {
    if (savedLayout?.layout_config) {
      const config = savedLayout.layout_config as unknown as DashboardLayoutConfig;
      setCurrentLayout(config.layouts || DEFAULT_LAYOUT);
      setHiddenWidgets(config.hiddenWidgets || []);
    }
  }, [savedLayout]);

  // Save layout mutation
  const saveMutation = useMutation({
    mutationFn: async (config: DashboardLayoutConfig) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const payload: Database['public']['Tables']['dashboard_layout']['Insert'] = {
        user_id: user.id,
        layout_config: config as any,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("dashboard_layout")
        .upsert(payload, { onConflict: "user_id" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-layout"] });
      toast({
        title: "Layout Tersimpan",
        description: "Konfigurasi dashboard berhasil disimpan",
      });
      setIsEditMode(false);
    },
    onError: (error) => {
      toast({
        title: "Gagal Menyimpan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLayoutChange = (newLayout: Layout[]) => {
    setCurrentLayout(newLayout);
  };

  const handleSaveLayout = () => {
    saveMutation.mutate({
      layouts: currentLayout,
      hiddenWidgets,
    });
  };

  const handleResetLayout = () => {
    setCurrentLayout(DEFAULT_LAYOUT);
    setHiddenWidgets([]);
    toast({
      title: "Layout Direset",
      description: "Layout dashboard dikembalikan ke default",
    });
  };

  const toggleWidget = (widgetId: string) => {
    setHiddenWidgets((prev) =>
      prev.includes(widgetId)
        ? prev.filter((id) => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  return {
    currentLayout,
    hiddenWidgets,
    isEditMode,
    isLoading,
    setIsEditMode,
    handleLayoutChange,
    handleSaveLayout,
    handleResetLayout,
    toggleWidget,
    isSaving: saveMutation.isPending,
  };
};
