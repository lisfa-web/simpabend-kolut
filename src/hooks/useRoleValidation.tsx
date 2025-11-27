import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const SINGLE_USER_ROLES: AppRole[] = ["resepsionis", "pbmd", "akuntansi", "perbendaharaan", "kepala_bkad"];

export const useRoleValidation = () => {
  return useQuery({
    queryKey: ["role-validation"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role, user_id, profiles!inner(id, full_name, email, is_active)")
        .in("role", SINGLE_USER_ROLES);

      if (error) throw error;

      // Group by role to check if there's already a user for each role
      const roleMap: Record<string, { userId: string; userName: string; isActive: boolean }> = {};
      
      data?.forEach((ur: any) => {
        if (!roleMap[ur.role] && ur.profiles?.is_active) {
          roleMap[ur.role] = {
            userId: ur.user_id,
            userName: ur.profiles.full_name,
            isActive: ur.profiles.is_active,
          };
        }
      });

      return roleMap;
    },
  });
};

export const isSingleUserRole = (role: string) => {
  return SINGLE_USER_ROLES.includes(role as AppRole);
};

export const getRoleValidationMessage = (role: string, existingUser?: { userName: string }) => {
  if (!isSingleUserRole(role)) return null;
  
  const roleNames: Record<string, string> = {
    resepsionis: "Resepsionis",
    pbmd: "PBMD",
    akuntansi: "Akuntansi",
    perbendaharaan: "Perbendaharaan",
    kepala_bkad: "Kepala BKAD",
  };
  
  if (existingUser) {
    return `Role ${roleNames[role]} sudah dimiliki oleh ${existingUser.userName}. Anda hanya dapat mengedit user tersebut, tidak dapat menambahkan user baru dengan role ini.`;
  }
  
  return `Role ${roleNames[role]} hanya dapat dimiliki oleh satu user saja`;
};
