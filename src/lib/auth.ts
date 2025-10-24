import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"] | 'super_admin';

export const hasRole = (roles: AppRole[], targetRole: AppRole): boolean => {
  return roles.includes(targetRole);
};

export const isAdmin = (roles: AppRole[]): boolean => {
  return roles.includes("administrator") || roles.includes("kepala_bkad");
};

export const getRoleDisplayName = (role: AppRole): string => {
  const roleNames: Record<AppRole, string> = {
    super_admin: "Super Administrator",
    administrator: "Administrator",
    bendahara_opd: "Bendahara OPD",
    resepsionis: "Resepsionis",
    pbmd: "PBMD",
    akuntansi: "Akuntansi",
    perbendaharaan: "Perbendaharaan",
    kepala_bkad: "Kepala BKAD",
    kuasa_bud: "Kuasa BUD",
    publik: "Publik",
  };
  return roleNames[role] || role;
};

export const getRoleBadgeColor = (role: AppRole): string => {
  const colors: Record<AppRole, string> = {
    super_admin: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
    administrator: "bg-destructive text-destructive-foreground",
    kepala_bkad: "bg-primary text-primary-foreground",
    kuasa_bud: "bg-info text-info-foreground",
    perbendaharaan: "bg-accent text-accent-foreground",
    akuntansi: "bg-success text-success-foreground",
    pbmd: "bg-secondary text-secondary-foreground",
    resepsionis: "bg-muted text-muted-foreground",
    bendahara_opd: "bg-card text-card-foreground border border-border",
    publik: "bg-muted text-muted-foreground",
  };
  return colors[role] || "bg-muted text-muted-foreground";
};
