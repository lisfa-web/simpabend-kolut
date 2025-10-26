import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SidebarTemplate, SIDEBAR_TEMPLATES } from "@/types/sidebar";

export const useSidebarTemplate = () => {
  return useQuery({
    queryKey: ["sidebar-template"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("config_sistem")
        .select("value")
        .eq("key", "sidebar_template")
        .single();

      if (error) {
        console.error("Error loading sidebar template:", error);
        return "blue-gradient" as SidebarTemplate;
      }

      return (data?.value as SidebarTemplate) || "blue-gradient";
    },
    staleTime: Infinity,
  });
};

export const useSidebarTemplateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: SidebarTemplate) => {
      const { error } = await supabase
        .from("config_sistem")
        .upsert(
          { key: "sidebar_template", value: template },
          { onConflict: "key" }
        );

      if (error) throw error;
    },
    onSuccess: (_, template) => {
      queryClient.invalidateQueries({ queryKey: ["sidebar-template"] });
      const templateName = SIDEBAR_TEMPLATES[template].name;
      toast.success(`Template sidebar berhasil diubah ke "${templateName}"`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal mengubah template sidebar");
    },
  });
};
