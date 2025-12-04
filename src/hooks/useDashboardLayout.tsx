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
  { i: "daily-briefing", x: 0, y: 0, w: 12, h: 5, minW: 6, minH: 4 },
  { i: "stats", x: 0, y: 5, w: 12, h: 2, minW: 6, minH: 2 },
  { i: "quick-actions", x: 0, y: 7, w: 12, h: 1, minW: 6, minH: 1 },
  { i: "target-realization", x: 0, y: 8, w: 6, h: 5, minW: 4, minH: 4 },
  { i: "deadline-calendar", x: 6, y: 8, w: 6, h: 5, minW: 4, minH: 4 },
  { i: "performance", x: 0, y: 13, w: 12, h: 3, minW: 6, minH: 2 },
  { i: "charts", x: 0, y: 16, w: 12, h: 3, minW: 4, minH: 2 },
  { i: "analytics", x: 0, y: 19, w: 12, h: 3, minW: 6, minH: 2 },
  { i: "financial", x: 0, y: 22, w: 6, h: 3, minW: 4, minH: 2 },
  { i: "activity", x: 6, y: 22, w: 6, h: 3, minW: 4, minH: 2 },
  { i: "sp2d-activity", x: 0, y: 25, w: 6, h: 3, minW: 4, minH: 2 },
  { i: "sp2d-stats", x: 6, y: 25, w: 6, h: 2, minW: 6, minH: 2 },
  { i: "opd-breakdown", x: 0, y: 28, w: 6, h: 3, minW: 4, minH: 2 },
  { i: "opd-comparison", x: 6, y: 28, w: 6, h: 5, minW: 4, minH: 4 },
  { i: "vendors", x: 0, y: 31, w: 6, h: 3, minW: 4, minH: 2 },
  { i: "alerts", x: 0, y: 34, w: 6, h: 2, minW: 4, minH: 2 },
  { i: "action-items", x: 6, y: 34, w: 6, h: 2, minW: 4, minH: 2 },
  { i: "spm-sp2d-table", x: 0, y: 36, w: 12, h: 8, minW: 8, minH: 6 },
  { i: "spm-status-distribution", x: 0, y: 44, w: 6, h: 4, minW: 4, minH: 3 },
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

      // Try to get user's own layout first
      const { data: userLayout, error: userError } = await supabase
        .from("dashboard_layout")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      // If user has their own layout, return it
      if (userLayout && !userError) {
        console.log("Using user's own layout");
        return userLayout;
      }

      // If user doesn't have own layout, try to use the default layout (applies to ALL users)
      console.log("User has no custom layout, checking for default layout...");

      // Try the globally flagged default layout
      const { data: defaultLayout, error: defaultError } = await supabase
        .from("dashboard_layout")
        .select("*")
        .eq("is_default", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log("Default layout result:", { hasDefault: !!defaultLayout, defaultError });

      if (defaultLayout) {
        console.log("Using default layout for all users");
        return defaultLayout;
      }

      // If no default layout exists, return null (will use DEFAULT_LAYOUT hardcoded)
      console.log("No default layout found, using hardcoded DEFAULT_LAYOUT");
      return null;
    },
    staleTime: 5 * 60 * 1000, // Data fresh selama 5 menit
    gcTime: 10 * 60 * 1000, // Cache 10 menit
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Jangan refetch saat component mount
    retry: false,
    placeholderData: (previousData) => previousData,
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
    mutationFn: async ({ config, saveAsDefault }: { config: DashboardLayoutConfig; saveAsDefault: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // If saving as default, first reset all other default layouts
      if (saveAsDefault) {
        await supabase
          .from("dashboard_layout")
          .update({ is_default: false })
          .eq("is_default", true);
      }

      const payload: Database['public']['Tables']['dashboard_layout']['Insert'] = {
        user_id: user.id,
        layout_config: config as any,
        updated_at: new Date().toISOString(),
        is_default: saveAsDefault,
      };

      const { error } = await supabase
        .from("dashboard_layout")
        .upsert(payload, { onConflict: "user_id" });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-layout"] });
      toast({
        title: "Layout Tersimpan",
        description: variables.saveAsDefault 
          ? "Layout disimpan sebagai default untuk semua user"
          : "Konfigurasi dashboard berhasil disimpan",
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

  const handleSaveLayout = (saveAsDefault: boolean = false) => {
    saveMutation.mutate({
      config: {
        layouts: currentLayout,
        hiddenWidgets,
      },
      saveAsDefault,
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
